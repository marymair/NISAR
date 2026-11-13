"""On-demand, scientifically labelled NISAR HDF5 subset processing.

GCOV: co-registered gamma0 backscatter (10 log10(power)) in dB.
GUNW: unwrapped interferometric phase in radians; NOT a corrected displacement map.
All pixels originate from an authenticated ASF NISAR HDF5 product.
"""
import base64
import io
import math
import os
from contextlib import contextmanager

import aiohttp
import fsspec
import h5py
import numpy as np
from PIL import Image
from pyproj import Transformer
from scipy.ndimage import map_coordinates

from catalog import scene_url


class ProcessingError(Exception):
    pass


RESOLUTION = 192
ROI_RADIUS_KM = 2.5
MAX_WINDOW_PIXELS = 1_500_000
GCOV_CHANNELS = {
    "flood": ("HHHH", "VVVV", "RHRH", "RVRV", "HVHV", "VHVH"),
    "forest": ("HVHV", "VHVH", "HHHH", "VVVV", "RHRH", "RVRV"),
}


@contextmanager
def open_product(url):
    user = os.environ.get("EARTHDATA_USERNAME", "")
    password = os.environ.get("EARTHDATA_PASSWORD", "")
    token = os.environ.get("EARTHDATA_TOKEN", "")
    if user and password:
        fs = fsspec.filesystem("https", client_kwargs={"auth": aiohttp.BasicAuth(user, password)})
    elif token:
        fs = fsspec.filesystem("https", headers={"Authorization": "Bearer " + token})
    else:
        raise ProcessingError("Earthdata authorization is not configured on the server")
    try:
        # fsspec issues remote HTTP Range requests; HDF5 is not downloaded in full.
        with fs.open(url, mode="rb", cache_type="blockcache", block_size=8 * 1024 * 1024) as remote:
            with h5py.File(remote, "r") as h5:
                yield h5
    except ProcessingError:
        raise
    except Exception as exc:
        raise ProcessingError("Unable to stream ASF HDF5 data: " + str(exc)) from exc


def target_coordinates(lat, lon):
    # Fixed local geographic AOI, common to all observation dates.
    radius_lat = ROI_RADIUS_KM / 111.195
    cosine = max(abs(math.cos(math.radians(lat))), 0.12)
    radius_lon = radius_lat / cosine
    longs = np.linspace(lon - radius_lon, lon + radius_lon, RESOLUTION)
    lats = np.linspace(lat + radius_lat, lat - radius_lat, RESOLUTION)
    return np.meshgrid(longs, lats)


def find_grid(h5, layer):
    group = h5[layer.rsplit("/", 1)[0]]
    while group.name != "/":
        if "xCoordinates" in group and "yCoordinates" in group:
            x = np.asarray(group["xCoordinates"][:], dtype="float64")
            y = np.asarray(group["yCoordinates"][:], dtype="float64")
            proj = group.get("projection")
            if proj is None:
                # Some products put projection on the parent frequency grid.
                parent = group.parent
                proj = parent.get("projection")
            if proj is not None:
                epsg = proj.attrs.get("epsg_code")
                if epsg is not None:
                    return x, y, int(np.asarray(epsg).reshape(-1)[0])
        group = group.parent
    raise ProcessingError("This NISAR product lacks a supported georeferenced grid")


def fractional_indices(axis, values):
    if axis[0] <= axis[-1]:
        return np.interp(values, axis, np.arange(axis.size), left=np.nan, right=np.nan)
    return np.interp(values, axis[::-1], np.arange(axis.size - 1, -1, -1), left=np.nan, right=np.nan)


def sample_layer(h5, layer, lon_mesh, lat_mesh):
    ds = h5[layer]
    if ds.ndim != 2:
        raise ProcessingError("Expected a two-dimensional geocoded NISAR dataset")
    xs, ys, epsg = find_grid(h5, layer)
    if ds.shape != (ys.size, xs.size):
        raise ProcessingError("Coordinate axes do not match the NISAR raster shape")
    tx, ty = Transformer.from_crs(4326, epsg, always_xy=True).transform(lon_mesh, lat_mesh)
    px = fractional_indices(xs, tx)
    py = fractional_indices(ys, ty)
    valid = np.isfinite(px) & np.isfinite(py)
    if int(valid.sum()) < int(RESOLUTION * RESOLUTION * 0.10):
        raise ProcessingError("Chosen point is outside the usable radar grid")
    x0 = max(0, int(np.floor(np.nanmin(px))) - 2)
    x1 = min(ds.shape[1], int(np.ceil(np.nanmax(px))) + 3)
    y0 = max(0, int(np.floor(np.nanmin(py))) - 2)
    y1 = min(ds.shape[0], int(np.ceil(np.nanmax(py))) + 3)
    if (x1 - x0) * (y1 - y0) > MAX_WINDOW_PIXELS:
        raise ProcessingError("Requested pixel window is too large; try a smaller region")
    cropped = np.asarray(ds[y0:y1, x0:x1], dtype="float32")
    for attr in ("_FillValue", "fill_value"):
        if attr in ds.attrs:
            v = float(np.asarray(ds.attrs[attr]).reshape(-1)[0])
            cropped[np.isclose(cropped, v)] = np.nan
    cropped[~np.isfinite(cropped)] = np.nan
    coords = np.array([np.where(valid, py - y0, -999), np.where(valid, px - x0, -999)])
    samples = map_coordinates(cropped, coords, order=1, mode="constant", cval=np.nan)
    samples[~valid] = np.nan
    return samples, epsg


def choose_gcov_channel(h5, change):
    group_name = "/science/LSAR/GCOV/grids/frequencyA"
    if group_name not in h5:
        raise ProcessingError("The requested product has no LSAR GCOV frequencyA grid")
    group = h5[group_name]
    for channel in GCOV_CHANNELS[change]:
        if channel in group:
            return group_name + "/" + channel, channel
    raise ProcessingError("No supported real-valued GCOV backscatter channel found")


def choose_gunw_layer(h5):
    base = "/science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram"
    for pol in ("HH", "VV"):
        layer = base + "/" + pol + "/unwrappedPhase"
        if layer in h5:
            return layer, pol
    raise ProcessingError("The NISAR GUNW scene lacks an HH/VV unwrapped phase layer")


def read_scene(feature, change, lon_grid, lat_grid):
    url = scene_url(feature)
    if not url:
        raise ProcessingError("ASF supplied no supported authenticated HDF5 download URL")
    with open_product(url) as h5:
        if change == "ground":
            layer, channel = choose_gunw_layer(h5)
            arr, epsg = sample_layer(h5, layer, lon_grid, lat_grid)
            # A GUNW product includes a two-acquisition interferogram already.
            if int(np.isfinite(arr).sum()) < 500:
                raise ProcessingError("Insufficient valid interferometric phase in this region")
            coherence_layer = layer.rsplit("/", 1)[0] + "/coherenceMagnitude"
            if coherence_layer in h5:
                coherence, _ = sample_layer(h5, coherence_layer, lon_grid, lat_grid)
                arr[~(coherence >= 0.35)] = np.nan
        else:
            layer, channel = choose_gcov_channel(h5, change)
            power, epsg = sample_layer(h5, layer, lon_grid, lat_grid)
            with np.errstate(divide="ignore", invalid="ignore"):
                arr = np.where(power > 0, 10.0 * np.log10(power), np.nan)
        return {"arr": arr, "channel": channel, "epsg": epsg, "layer": layer}


def png_data(array, lo, hi, palette):
    valid = np.isfinite(array)
    span = max(hi - lo, 1e-6)
    fraction = np.clip((np.where(valid, array, lo) - lo) / span, 0, 1)
    palette = np.asarray(palette, dtype=np.float32)
    index = fraction * (len(palette) - 1)
    low = np.floor(index).astype(int)
    high = np.minimum(low + 1, len(palette) - 1)
    tint = index - low
    rgb = palette[low] * (1 - tint[..., None]) + palette[high] * tint[..., None]
    rgb[~valid] = [9, 18, 38]
    image = Image.fromarray(np.uint8(np.clip(rgb, 0, 255)), "RGB")
    image = image.resize((512, 512), Image.Resampling.BILINEAR)
    buf = io.BytesIO()
    image.save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


RADAR = [[8, 18, 47], [20, 75, 120], [31, 155, 170], [137, 225, 211], [241, 244, 221]]
DELTA = [[29, 88, 206], [70, 129, 204], [13, 26, 54], [239, 149, 64], [240, 68, 67]]
PHASE = [[30, 38, 107], [93, 75, 192], [40, 181, 228], [107, 219, 166], [249, 193, 100], [220, 93, 109]]


def scene_metadata(feature):
    p = feature.get("properties", {})
    return {
        "id": p.get("fileID") or p.get("sceneName") or "unknown",
        "date": p.get("startTime"),
        "processingLevel": p.get("processingLevel"),
        "track": p.get("pathNumber"),
        "frame": p.get("frameNumber"),
    }


def process(features, lat, lon, change):
    if not features:
        raise ProcessingError("No compatible published NISAR acquisitions for this location and period")
    glon, glat = target_coordinates(lat, lon)
    if change == "ground":
        measured = read_scene(features[0], change, glon, glat)
        phase = measured["arr"]
        good = phase[np.isfinite(phase)]
        if good.size < 500:
            raise ProcessingError("Too few valid GUNW pixels after coherence filtering")
        lo, hi = np.percentile(good, [2, 98])
        return {
            "status": "processed", "kind": "gunw_phase", "change": change,
            "channel": measured["channel"], "layer": measured["layer"], "unit": "radian",
            "measurements": {
                "valid_pixels": int(good.size),
                "median_phase_rad": round(float(np.median(good)), 4),
                "p10_phase_rad": round(float(np.percentile(good, 10)), 4),
                "p90_phase_rad": round(float(np.percentile(good, 90)), 4),
            },
            "images": {"phase": png_data(phase, lo, hi, PHASE)},
            "products": [scene_metadata(features[0])],
            "disclaimer": "Unwrapped phase, not corrected LOS displacement. Atmospheric/ionospheric signals, coherence and reference choice can affect interpretation.",
            "roi_radius_km": ROI_RADIUS_KM,
        }
    if len(features) < 2:
        raise ProcessingError("Two same-track GCOV acquisitions are required")
    before = read_scene(features[0], change, glon, glat)
    after = read_scene(features[1], change, glon, glat)
    if before["channel"] != after["channel"]:
        raise ProcessingError("Acquisitions have mismatched GCOV polarizations; cannot compare fairly")
    a, b = before["arr"], after["arr"]
    valid = np.isfinite(a) & np.isfinite(b)
    if int(valid.sum()) < 500:
        raise ProcessingError("Not enough overlapping valid NISAR pixels for before/after")
    a = np.where(valid, a, np.nan)
    b = np.where(valid, b, np.nan)
    diff = b - a
    all_vals = np.concatenate((a[valid], b[valid]))
    lo, hi = np.percentile(all_vals, [2, 98])
    difference_max = max(float(np.percentile(abs(diff[valid]), 95)), 1.5)
    return {
        "status": "processed", "kind": "gcov_change", "change": change,
        "channel": before["channel"], "layer": before["layer"], "unit": "dB",
        "measurements": {
            "valid_pixels": int(valid.sum()),
            "median_delta_db": round(float(np.median(diff[valid])), 3),
            "p10_delta_db": round(float(np.percentile(diff[valid], 10)), 3),
            "p90_delta_db": round(float(np.percentile(diff[valid], 90)), 3),
            "pixels_above_3db_absolute_pct": round(float(np.mean(abs(diff[valid]) >= 3) * 100), 2),
        },
        "images": {
            "before": png_data(a, lo, hi, RADAR),
            "after": png_data(b, lo, hi, RADAR),
            "difference": png_data(diff, -difference_max, difference_max, DELTA),
        },
        "products": [scene_metadata(f) for f in features[:2]],
        "disclaimer": "Backscatter changes are measured, but do not by themselves prove flooding, fire, or deforestation. Wind, soil moisture, look geometry and seasonal changes can mimic an event.",
        "roi_radius_km": ROI_RADIUS_KM,
    }
