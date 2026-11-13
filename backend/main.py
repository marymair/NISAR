"""ZORI NISAR processing API for Google Cloud Run.

Public catalogue search can run without Earthdata credentials. /api/analyze performs
real, on-demand HDF5 pixel processing, and never substitutes simulated measurements.
"""
import os
from datetime import date
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from catalog import CatalogError, search, select_products, validate
from nisar_proc import ProcessingError, process

app = FastAPI(
    title="ZORI Earth Observatory API",
    version="0.1.0",
    description="On-demand search and measurement of published NISAR data from ASF DAAC",
)
origins = [x.strip() for x in os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080"
).split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

ChangeType = Literal["flood", "forest", "ground"]


class AnalyzeRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    start_date: date
    end_date: date
    change: ChangeType


def safe_search(lat, lon, start, end, change):
    try:
        return search(lat, lon, start, end, change)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except CatalogError as exc:
        raise HTTPException(502, str(exc)) from exc


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ZORI-NISAR",
        "earthdata_configured": bool(os.getenv("EARTHDATA_TOKEN") or (
            os.getenv("EARTHDATA_USERNAME") and os.getenv("EARTHDATA_PASSWORD")
        )),
    }


@app.get("/api/search")
def discover(
    lat: float = Query(ge=-90, le=90),
    lon: float = Query(ge=-180, le=180),
    start_date: date = Query(),
    end_date: date = Query(),
    change: ChangeType = Query(),
):
    return safe_search(lat, lon, str(start_date), str(end_date), change)


@app.post("/api/analyze")
def analyze(request: AnalyzeRequest):
    if not (os.getenv("EARTHDATA_TOKEN") or (
        os.getenv("EARTHDATA_USERNAME") and os.getenv("EARTHDATA_PASSWORD")
    )):
        raise HTTPException(503, "Earthdata credentials are not configured in Cloud Run")
    catalog = safe_search(request.lat, request.lon, str(request.start_date), str(request.end_date), request.change)
    selected = select_products(catalog["features"], request.change)
    if not selected:
        reason = (
            "No suitable GUNW interferogram in the chosen time and location."
            if request.change == "ground"
            else "Two GCOV scenes on the same track and frame at different dates were not found."
        )
        raise HTTPException(404, reason)
    try:
        result = process(selected, request.lat, request.lon, request.change)
    except ProcessingError as exc:
        raise HTTPException(422, str(exc)) from exc
    except Exception as exc:
        # Keep credentials, download URLs, and traceback out of public responses.
        import logging
        logging.exception("NISAR processing failed")
        raise HTTPException(502, "The HDF5 processing step failed. Consult Cloud Run logs.") from exc
    result["catalog_truncated"] = catalog["truncated"]
    result["provenance"] = "ASF DAAC / NASA-ISRO NISAR, processed on request"
    return result
