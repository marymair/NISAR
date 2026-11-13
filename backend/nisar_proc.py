"""NISAR GCOV/GUNW real-data reading and quantitative quick-look analysis.

No mock data: every output is computed from authenticated NASA Earthdata files.
All spatial windows are clipped to a small area around the requested coordinates.
"""
from __future__ import annotations

from contextlib import contextmanager
from io import BytesIO
from math import pi
from urllib.parse import urlparse
import os

import h5py
import numpy as np
from PIL import Image
from pyproj import Transformer
from scipy.interpolate import RegularGridInterpolator


MAX_SIDE = int(os.environ.get("NISAR_WINDOW_PIXELS", "384"))
MAX_SIDE = max(96, min(MAX_SIDE, 640))


def _allowed_url(url: str) -> bool:
    p = urlparse(url)
    host = (p.hostname or "").lower()
    return p.scheme == "https" and (
        host.endswith(".asf.earthdatacloud.nasa.gov")
        or host == "asf.earthdatacloud.nasa.gov"
        or host.endswith(".asf.alaska.edu")
        or host == "asf.alaska.edu"
    ) and p.path.lower().endswith(".h5")


@contextmanager
def open_remote_h5(url: str):
    """Use authenticated HTTP range reads, not a multi-GB local download."""
    if not _allowed_url(url):
        raise ValueError("This is not an ASF NISAR HDF5 URL")
    if not (os.environ.get("EARTHDATA_TOKEN") or
            (os.environ.get("EARTHDATA_USERNAME") and os.environ.get("EARTHDATA_PASSWORD"))):
        raise RuntimeError("EARTHDATA_LOGIN_REQUIRED: configure an Earthdata secret on Cloud Run")
    import earthaccess
    auth = earthaccess.login(strategy="environment")
    if not auth.authenticated:
        raise RuntimeError("Earthdata login failed")
    fs = earthaccess.get_fsspec_https_session()
    with fs.open(url, "rb", block_size=8 * 1024 * 1024, cache_type="blockcache") as stream:
        with h5py.File(stream, "r", rdcc_nbytes=16 * 1024 * 1024) as file:
            yield file


def _find_grid(group, dataset):
    """Find x/y coordinate axes and EPSG code in the current/parent groups."""
    node = dataset.parent
    x = y = epsg = None
    while node is not None and node.name != "/":
        if x is None and "xCoordinates" in node:
            x = np.asarray(node["xCoordinates"][:], dtype="float64")
        if y is None and "yCoordinates" in node:
            y = np.asarray(node["yCoordinates"][:], dtype="float64")
        if epsg is None and "projection" in node:
            p = node["projection"]
            for candidate in (p.attrs.get("epsg_code"), p[()]):
                try:
                    value = int(np.asarray(candidate).reshape(-1)[0])
                    if 1024 <= value < 100000:
                        epsg = value
                        break
                except (TypeError, ValueError, IndexError):
                    pass
        node = node.parent
    if x is None or y is None or epsg is None:
        raise ValueError("NISAR grid lacks coordinate axes or EPSG projection")
    return x, y, epsg


def _extract(file, path: str, lon: float, lat: float):
    if path not in file:
        raise ValueError("The required science layer is absent: " + path)
    layer = file[path]
    x, y, epsg = _find_grid(file, layer)
    if len(layer.shape) != 2 or layer.shape != (len(y), len(x)):
        raise ValueError("Unexpected NISAR raster dimensions")
    mx, my = Transformer.from_crs(4326, epsg, always_xy=True).transform(lon, lat)
    cx, cy = int(np.argmin(abs(x - mx))), int(np.argmin(abs(y - my)))
    half = MAX_SIDE // 2
    sx = slice(max(0, cx - half), min(len(x), cx + half))
    sy = slice(max(0, cy - half), min(len(y), cy + half))
    if abs(x[cx] - mx) > 500 or abs(y[cy] - my) > 500:
        raise ValueError("The scene does not cover the requested point")
    if sx.stop - sx.start < 48 or sy.stop - sy.start < 48:
        raise ValueError("Not enough coverage around this point")
    data = np.asarray(layer[sy, sx], dtype="float32")
    return data, x[sx], y[sy], epsg


def _gcov_layer(file, mode: str):
    group = "/science/LSAR/GCOV/grids/frequencyA"
    if group not in file:
        raise ValueError("No frequencyA GCOV science grid")
    g = file[group]
    preferred = ("HVHV", "HHHH", "VVVV") if mode == "forest" else ("HHHH", "VVVV", "HVHV")
    for term in preferred:
        if term in g:
            return group + "/" + term, term
    raise ValueError("No real-valued GCOV covariance term available")


def _regrid(source, sx, sy, src_epsg, tx, ty, target_epsg):
    """Explicit geospatial resampling rather than comparing mismatched pixels."""
    xx, yy = np.meshgrid(tx, ty)
    if src_epsg != target_epsg:
        xx, yy = Transformer.from_crs(target_epsg, src_epsg, always_xy=True).transform(xx, yy)
    interpolator = RegularGridInterpolator(
        (sy, sx), source, bounds_error=False, fill_value=np.nan,
        method="linear")
    return interpolator(np.column_stack((yy.ravel(), xx.ravel()))).reshape(xx.shape)


def _png_rgb(rgb):
    out = BytesIO()
    Image.fromarray(rgb.astype("uint8"), "RGB").save(out, format="PNG", optimize=True)
    return out.getvalue()


def _gray(db):
    valid = np.isfinite(db)
    clipped = np.clip((np.where(valid, db, -35) + 35) / 40, 0, 1)
    image = (clipped * 235 + 10).astype("uint8")
    return np.stack([image, image, image], axis=-1)


def process_gcov(scene1: dict, scene2: dict, lat: float, lon: float, mode: str):
    files = []
    for scene in (scene1, scene2):
        with open_remote_h5(scene["url"]) as f:
            layer, term = _gcov_layer(f, mode)
            raster, xs, ys, epsg = _extract(f, layer, lon, lat)
            files.append((raster, xs, ys, epsg, term))
    first, ax, ay, ae, at = files[0]
    second, bx, by, be, bt = files[1]
    if at != bt:
        raise ValueError("Scene pair uses incompatible polarization channels")
    second = _regrid(second, bx, by, be, ax, ay, ae)
    with np.errstate(divide="ignore", invalid="ignore"):
        before = 10 * np.log10(np.where(first > 0, first, np.nan))
        after = 10 * np.log10(np.where(second > 0, second, np.nan))
    valid = np.isfinite(before) & np.isfinite(after)
    if np.count_nonzero(valid) < 250:
        raise ValueError("Insufficient overlapping valid radar pixels")
    delta = after - before
    selection = valid & (np.abs(delta) >= 3.0)
    # This detects SAR-brightness changes, NOT proven floods/deforestation.
    negative = valid & (delta <= -3.0)
    base = _gray(before)
    later = _gray(after)
    strength = np.clip(np.abs(np.where(valid, delta, 0)) / 10, 0, 1)
    color = np.zeros_like(base, dtype="float32")
    color[:, :, 0] = np.where(delta > 0, 242, 30)
    color[:, :, 1] = np.where(delta > 0, 82, 208)
    color[:, :, 2] = np.where(delta > 0, 168, 250)
    overlay = np.clip(_gray((before + after) / 2).astype("float32") * (1 - strength[:, :, None] * .72)
                      + color * strength[:, :, None] * .72, 0, 255)
    stats = {
        "mode": "gcov_backscatter_difference",
        "polarization": at,
        "valid_pixels": int(np.count_nonzero(valid)),
        "median_delta_db": round(float(np.median(delta[valid])), 2),
        "changed_pixel_fraction": round(float(np.mean(selection[valid])), 4),
        "decreased_pixel_fraction": round(float(np.mean(negative[valid])), 4),
        "threshold_db": 3,
        "interpretation": "Difference in calibrated radar backscatter; not an event classification.",
        "caution": "Moisture, acquisition geometry, and vegetation seasonality can mimic surface change.",
    }
    return {
        "images": {"before": _png_rgb(base), "after": _png_rgb(later),
                   "difference": _png_rgb(overlay)},
        "stats": stats,
        "method": "Aligned GCOV terrain-corrected gamma0. Difference in dB (10 log10); threshold 3 dB.",
    }


def process_gunw(scene: dict, lat: float, lon: float):
    with open_remote_h5(scene["url"]) as f:
        stem = "/science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram"
        polarizations = [p for p in ("HH", "VV") if stem + "/" + p + "/unwrappedPhase" in f]
        if not polarizations:
            raise ValueError("No GUNW unwrapped phase in this product")
        pol = polarizations[0]
        phase, xs, ys, epsg = _extract(f, stem + "/" + pol + "/unwrappedPhase", lon, lat)
        coh_path = stem + "/" + pol + "/coherenceMagnitude"
        if coh_path in f:
            coh, cx, cy, ce = _extract(f, coh_path, lon, lat)
            coh = _regrid(coh, cx, cy, ce, xs, ys, epsg)
        else:
            coh = np.ones_like(phase)
    valid = np.isfinite(phase) & (coh >= .35)
    if int(np.count_nonzero(valid)) < 120:
        raise ValueError("Too few coherent GUNW pixels at this point")
    relative = np.where(valid, phase - np.median(phase[valid]), np.nan)
    # Wrapped phase colors reveal spatial variation without claiming corrected LOS displacement.
    wrapped = np.mod(np.where(valid, relative, 0) + pi, 2 * pi) / (2 * pi)
    rgb = np.stack([
        100 + 155 * np.cos(wrapped * 2 * pi),
        110 + 125 * np.sin(wrapped * 2 * pi + 2),
        110 + 125 * np.sin(wrapped * 2 * pi + 4),
    ], axis=-1)
    rgb[~valid] = 18
    stats = {
        "mode": "gunw_unwrapped_phase",
        "polarization": pol,
        "coherent_pixels": int(np.count_nonzero(valid)),
        "relative_phase_iqr_rad": round(float(np.percentile(relative[valid], 75)
                                             - np.percentile(relative[valid], 25)), 3),
        "interpretation": "Real unwrapped interferometric phase from a paired NISAR observation.",
        "caution": "Not a corrected displacement map. Atmospheric, ionospheric, orbital and reference-phase corrections are required.",
    }
    return {
        "images": {"difference": _png_rgb(np.clip(rgb, 0, 255))},
        "stats": stats,
        "method": "GUNW unwrapped phase (radians), masked where coherence <0.35.",
    }
