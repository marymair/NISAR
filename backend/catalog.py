"""ASF catalog access. Search is public; reading HDF5 pixels requires Earthdata credentials."""
from datetime import date
from urllib.parse import urlparse
import requests

ASF_SEARCH = "https://api.daac.asf.alaska.edu/services/search/param"
LEVEL = {"flood": "GCOV", "forest": "GCOV", "ground": "GUNW"}
MAX_RESULTS = 200


class CatalogError(Exception):
    pass


def validate(lat, lon, start_date, end_date, change):
    if change not in LEVEL:
        raise ValueError("change must be flood, forest or ground")
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        raise ValueError("Invalid latitude or longitude")
    start, end = date.fromisoformat(start_date), date.fromisoformat(end_date)
    if start > end or end > date.today():
        raise ValueError("Invalid observation range")
    if (end - start).days > 730:
        raise ValueError("Choose a period shorter than two years")


def search(lat, lon, start_date, end_date, change):
    validate(lat, lon, start_date, end_date, change)
    params = {
        "dataset": "NISAR",
        "processingLevel": LEVEL[change],
        "intersectsWith": "POINT({:.5f} {:.5f})".format(lon, lat),
        "start": start_date + "T00:00:00Z",
        "end": end_date + "T23:59:59Z",
        "maxResults": MAX_RESULTS,
        "output": "geojson",
    }
    try:
        response = requests.get(ASF_SEARCH, params=params, timeout=45, headers={"User-Agent": "ZORI-Earth-Observatory/1.0"})
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise CatalogError("ASF catalog could not be reached: " + str(exc)) from exc
    if not isinstance(data, dict) or not isinstance(data.get("features", []), list):
        raise CatalogError("Unexpected ASF Search API response")
    features = [f for f in data.get("features", []) if
                str(f.get("properties", {}).get("processingLevel", "")).upper() == LEVEL[change]]
    return {"type": "FeatureCollection", "features": features, "truncated": len(data.get("features", [])) >= MAX_RESULTS}


def scene_url(scene):
    """Accept only ASF-hosted HDF5 URLs returned by the server-side catalog search."""
    props = scene.get("properties", {})
    values = props.get("url") or props.get("downloadUrl") or []
    if isinstance(values, str):
        values = [values]
    for url in values:
        if not isinstance(url, str):
            continue
        parsed = urlparse(url)
        host = (parsed.hostname or "").lower()
        if parsed.scheme == "https" and host.endswith(".asf.earthdatacloud.nasa.gov") and parsed.path.lower().endswith(".h5"):
            return url
    return None


def select_products(features, change):
    """GCOV: same track/frame/polarization with two distinct dates; GUNW: one pre-paired interferogram."""
    usable = [f for f in features if scene_url(f)]
    usable.sort(key=lambda f: f["properties"].get("startTime", ""), reverse=True)
    if change == "ground":
        return usable[:1]
    groups = {}
    for f in usable:
        p = f["properties"]
        track = p.get("pathNumber")
        frame = p.get("frameNumber")
        direction = p.get("flightDirection")
        if track is None or frame is None or direction is None:
            continue
        groups.setdefault((str(track), str(frame), str(direction)), []).append(f)
    for group in sorted(groups.values(), key=lambda g: g[0]["properties"].get("startTime", ""), reverse=True):
        result, seen = [], set()
        for f in group:
            date_key = str(f["properties"].get("startTime", ""))[:10]
            if not date_key or date_key in seen:
                continue
            seen.add(date_key)
            result.append(f)
            if len(result) == 2:
                return list(reversed(result))
    return []
