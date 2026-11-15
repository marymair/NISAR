"""ZORI Observatory API: live NASA ASF catalog + on-demand science jobs.

Compatible with Google Cloud Run. Search works without Earthdata credentials;
raster analysis requires EARTHDATA_TOKEN or EARTHDATA_USERNAME/PASSWORD.
"""
from __future__ import annotations

from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path
from threading import Lock
from time import monotonic
from typing import Literal
from uuid import uuid4
import os

import asf_search as asf
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .nisar_proc import process_gcov, process_gunw


ROOT = Path(__file__).resolve().parents[1]
app = FastAPI(title="ZORI NISAR Observatory API", version="1.0")
_executor = ThreadPoolExecutor(max_workers=1)
_lock = Lock()
_jobs: OrderedDict[str, dict] = OrderedDict()
_cache = {}
_search_timeout_notice = "ASF NASA catalog request failed; try again or open ASF Vertex"


class AnalyzeRequest(BaseModel):
    lat: float = Field(ge=-85, le=85)
    lon: float = Field(ge=-180, le=180)
    start_date: date
    end_date: date
    change: Literal["flood", "forest", "ground"]


def _validate_dates(start, end):
    if start > end:
        raise HTTPException(400, "start_date is after end_date")
    if (end - start).days > 550:
        raise HTTPException(400, "Choose an interval shorter than 550 days")
    if end > date.today():
        raise HTTPException(400, "end_date cannot be in the future")


def _earthdata_ready():
    return bool(os.getenv("EARTHDATA_TOKEN") or
                (os.getenv("EARTHDATA_USERNAME") and os.getenv("EARTHDATA_PASSWORD")))


def _normalize_product(product, maturity):
    p = dict(product.properties)
    url = str(p.get("url") or "")
    if not url.lower().endswith(".h5"):
        url = next((str(u) for u in p.get("downloadUrl", []) if str(u).endswith(".h5")), url)
    p["dataMaturity"] = str(p.get("dataMaturity") or maturity).upper()
    p["processingLevel"] = p.get("processingLevel") or "GCOV"
    return {
        "type": "Feature",
        "geometry": getattr(product, "geometry", None),
        "properties": p,
        "url": url,
    }


def _catalog(lat, lon, start, end, change):
    level = "GUNW" if change == "ground" else "GCOV"
    key = (round(lat, 3), round(lon, 3), start.isoformat(), end.isoformat(), change)
    now = monotonic()
    with _lock:
        cached = _cache.get(key)
        if cached and now - cached[0] < 300:
            return cached[1]
    results = []
    errors = []
    # Search both because VALIDATED starts in late October, while earlier
    # calibrated observations belong to the PROVISIONAL archive.
    for maturity in (("VALIDATED", "PROVISIONAL", "BETA") if start < date(2026, 6, 17) else ("VALIDATED", "PROVISIONAL")):
        try:
            collection = "NISAR_L2_" + level + ("" if maturity == "VALIDATED" else "_" + maturity) + "_V1"
            found = asf.search(
                shortName=collection,
                intersectsWith=f"POINT({lon:.5f} {lat:.5f})",
                start=start.isoformat() + "T00:00:00Z",
                end=end.isoformat() + "T23:59:59Z",
                maxResults=120,
            )
            results.extend(_normalize_product(product, maturity) for product in found)
        except Exception as exc:
            errors.append(maturity + ": " + str(exc)[:160])
    if not results and len(errors) >= (3 if start < date(2026, 6, 17) else 2):
        raise RuntimeError(_search_timeout_notice + " (" + " | ".join(errors) + ")")
    unique = {}
    for item in results:
        p = item["properties"]
        name = p.get("fileID") or p.get("fileName") or item["url"]
        if name:
            unique[str(name)] = item
    sorted_results = sorted(unique.values(),
                            key=lambda x: x["properties"].get("startTime") or "")
    with _lock:
        _cache[key] = (now, sorted_results)
        if len(_cache) > 100:
            _cache.pop(next(iter(_cache)))
    return sorted_results


def _choose_gc_pair(features):
    groups = {}
    for f in features:
        p = f["properties"]
        # Only compare the same repeat track, frame, direction and maturity.
        if not (p.get("pathNumber") is not None and p.get("frameNumber") is not None):
            continue
        group = (p["pathNumber"], p["frameNumber"],
                 p.get("flightDirection"), p.get("dataMaturity"))
        groups.setdefault(group, []).append(f)
    options = []
    for group, scenes in groups.items():
        by_day = {}
        for scene in scenes:
            day = str(scene["properties"].get("startTime") or "")[:10]
            if day and scene["url"].endswith(".h5"):
                by_day[day] = scene
        if len(by_day) >= 2:
            ordered = [by_day[d] for d in sorted(by_day)]
            # Keep the closest-in-time pair to reduce non-event confounders.
            for first, last in zip(ordered[:-1], ordered[1:]):
                a = date.fromisoformat(first["properties"]["startTime"][:10])
                b = date.fromisoformat(last["properties"]["startTime"][:10])
                priority = 1 if group[-1] == "VALIDATED" else 0
                options.append((priority, b, -(b-a).days, first, last))
    if not options:
        return None
    best = max(options, key=lambda x: x[:3])
    return best[3], best[4]


def _scene_summary(scene):
    p = scene["properties"]
    return {
        "id": p.get("fileID") or p.get("fileName"),
        "date": p.get("startTime"),
        "maturity": p.get("dataMaturity"),
        "product": p.get("processingLevel"),
        "asf_vertex": "https://search.asf.alaska.edu/#/?dataset=NISAR",
    }


def _run_job(job_id, payload):
    try:
        with _lock:
            _jobs[job_id]["status"] = "processing"
        scenes = _catalog(payload.lat, payload.lon, payload.start_date,
                          payload.end_date, payload.change)
        if payload.change in ("flood", "forest"):
            pair = _choose_gc_pair(scenes)
            if pair is None:
                raise ValueError("NO_COMPATIBLE_PAIR: two matching dates on the same NISAR track, frame and maturity are required")
            data = process_gcov(pair[0], pair[1], payload.lat, payload.lon, payload.change)
            sources = [_scene_summary(s) for s in pair]
        else:
            candidates = [s for s in scenes if s["url"].endswith(".h5")]
            if not candidates:
                raise ValueError("NO_GUNW_SCENE: no paired interferogram covers this location")
            selected = max(candidates,
                           key=lambda s: (s["properties"].get("dataMaturity") == "VALIDATED",
                                          s["properties"].get("startTime") or ""))
            data = process_gunw(selected, payload.lat, payload.lon)
            sources = [_scene_summary(selected)]
        with _lock:
            _jobs[job_id].update(
                status="done", images=data["images"], stats=data["stats"],
                sources=sources, method=data["method"])
    except Exception as exc:
        with _lock:
            _jobs[job_id].update(status="error", error=str(exc)[:600])


@app.get("/health")
def health():
    return {
        "status": "ok", "catalog": "NASA ASF NISAR",
        "earthdata_credentials_configured": _earthdata_ready(),
        "processing": "authenticated HDF5 range reads" if _earthdata_ready() else "requires Earthdata credentials",
    }


@app.get("/api/search")
def search(
    lat: float = Query(ge=-85, le=85),
    lon: float = Query(ge=-180, le=180),
    start: date = Query(),
    end: date = Query(),
    change: Literal["flood", "forest", "ground"] = "flood",
):
    _validate_dates(start, end)
    try:
        items = _catalog(lat, lon, start, end, change)
        return {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "properties": x["properties"],
                          "geometry": x["geometry"]} for x in items],
            "count": len(items), "dataset": "NASA/ASF NISAR",
            "is_live_catalog_query": True,
            "is_live_satellite_stream": False,
            "warning": "Availability is not evidence of physical surface change.",
        }
    except RuntimeError as exc:
        raise HTTPException(502, str(exc)) from exc


@app.post("/analyze", status_code=202)
def analyze(payload: AnalyzeRequest, request: Request):
    _validate_dates(payload.start_date, payload.end_date)
    if not _earthdata_ready():
        raise HTTPException(503, "EARTHDATA_LOGIN_REQUIRED: add a Cloud Run Earthdata secret to enable real radar processing")
    with _lock:
        if sum(1 for j in _jobs.values() if j["status"] in ("queued", "processing")) >= 2:
            raise HTTPException(429, "The research station is busy. Try again shortly.")
        while len(_jobs) >= 15:
            _jobs.popitem(last=False)
        job_id = uuid4().hex
        _jobs[job_id] = {"status": "queued", "started": monotonic()}
    _executor.submit(_run_job, job_id, payload)
    return {"job_id": job_id, "status": "queued"}


@app.get("/status/{job_id}")
def status(job_id: str):
    with _lock:
        info = _jobs.get(job_id)
        if info is None:
            raise HTTPException(404, "Unknown analysis job")
        result = {key: val for key, val in info.items() if key not in ("images",)}
    if info["status"] == "done":
        result["images"] = {kind: f"/image/{job_id}?kind={kind}"
                            for kind in info["images"]}
    return result


@app.get("/image/{job_id}")
def image(job_id: str, kind: Literal["before", "after", "difference", "coherence"] = "difference"):
    with _lock:
        job = _jobs.get(job_id)
        data = job.get("images", {}).get(kind) if job else None
    if data is None:
        raise HTTPException(404, "Image not available")
    return Response(content=data, media_type="image/png",
                    headers={"Cache-Control": "private, max-age=900",
                             "X-Content-Type-Options": "nosniff"})


app.mount("/", StaticFiles(directory=str(ROOT / "frontend"), html=True), name="frontend")
