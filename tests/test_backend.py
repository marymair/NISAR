"""Offline tests. No Earthdata login, satellite requests or fake production results."""
from contextlib import contextmanager
from datetime import date

import h5py
import numpy as np
from fastapi.testclient import TestClient

from backend import main, nisar_proc


client = TestClient(main.app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["catalog"] == "NASA ASF NISAR"


def test_catalog_schema_without_external_requests(monkeypatch):
    features = [{"properties": {
        "fileID": "NISAR_REAL_METADATA_TEST",
        "processingLevel": "GCOV", "dataMaturity": "VALIDATED",
        "startTime": "2026-11-09T11:00:00Z",
    }, "geometry": {"type": "Polygon", "coordinates": []}}]
    monkeypatch.setattr(main, "_catalog", lambda *args: features)
    r = client.get("/api/search", params={
        "lat": 10.5, "lon": -67.0, "start": "2026-11-01",
        "end": "2026-11-12", "change": "flood"
    })
    assert r.status_code == 200
    payload = r.json()
    assert payload["count"] == 1
    assert payload["is_live_satellite_stream"] is False
    assert payload["features"][0]["properties"]["dataMaturity"] == "VALIDATED"


def test_analysis_needs_earthdata_credentials(monkeypatch):
    for key in ("EARTHDATA_TOKEN", "EARTHDATA_USERNAME", "EARTHDATA_PASSWORD"):
        monkeypatch.delenv(key, raising=False)
    r = client.post("/analyze", json={
        "lat": 10.5, "lon": -67.0,
        "start_date": "2026-11-01", "end_date": "2026-11-12",
        "change": "flood",
    })
    assert r.status_code == 503
    assert "EARTHDATA_LOGIN_REQUIRED" in r.json()["detail"]


def test_science_from_synthetic_local_h5(monkeypatch, tmp_path):
    """Proves actual dB arithmetic, window extraction and PNG generation.
    Synthetic arrays are used in unit tests only — never in production.
    """
    xs = np.linspace(29.99, 30.01, 128)
    ys = np.linspace(5.01, 4.99, 128)
    paths = []
    for i, value in enumerate((0.01, 0.025)):
        path = tmp_path / f"scene_{i}.h5"
        with h5py.File(path, "w") as f:
            group = f.require_group("/science/LSAR/GCOV/grids/frequencyA")
            group.create_dataset("xCoordinates", data=xs)
            group.create_dataset("yCoordinates", data=ys)
            group.create_dataset("projection", data=4326)
            group.create_dataset("HHHH", data=np.full((128,128), value, dtype="float32"))
        paths.append(path)

    @contextmanager
    def fake_open(url):
        index = int(url[-1])
        with h5py.File(paths[index], "r") as f:
            yield f

    monkeypatch.setattr(nisar_proc, "open_remote_h5", fake_open)
    output = nisar_proc.process_gcov({"url":"test0"}, {"url":"test1"}, 5.0, 30.0, "flood")
    stats = output["stats"]
    assert stats["polarization"] == "HHHH"
    assert 3.8 < stats["median_delta_db"] < 4.1
    assert stats["changed_pixel_fraction"] == 1.0
    assert output["images"]["difference"].startswith(b"\x89PNG")


def test_invalid_date_range():
    r = client.get("/api/search", params={
        "lat": 10.5, "lon": 20,
        "start": "2026-11-12", "end": "2026-11-01",
        "change": "flood",
    })
    assert r.status_code == 400



def test_real_gunw_phase_and_coherence_layers_both_render(monkeypatch, tmp_path):
    """GUNW comparison contains two *measured layers* from the same HDF5 grid.
    These are not imaginary before/after photos. Test inputs are local fixtures.
    """
    path = tmp_path / "gunw_fixture.h5"
    xs = np.linspace(29.99, 30.01, 128)
    ys = np.linspace(5.01, 4.99, 128)
    with h5py.File(path, "w") as f:
        group = f.require_group(
            "/science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram"
        )
        group.create_dataset("xCoordinates", data=xs)
        group.create_dataset("yCoordinates", data=ys)
        group.create_dataset("projection", data=4326)
        pol = group.require_group("HH")
        phase = np.linspace(-3, 3, 128 * 128, dtype="float32").reshape(128, 128)
        pol.create_dataset("unwrappedPhase", data=phase)
        pol.create_dataset("coherenceMagnitude", data=np.full((128, 128), 0.85, dtype="float32"))

    @contextmanager
    def fake_open(_url):
        with h5py.File(path, "r") as f:
            yield f

    monkeypatch.setattr(nisar_proc, "open_remote_h5", fake_open)
    output = nisar_proc.process_gunw({"url": "offline-fixture"}, 5.0, 30.0)
    assert output["stats"]["mode"] == "gunw_unwrapped_phase"
    assert output["stats"]["has_coherence_layer"] is True
    assert set(output["images"]) == {"difference", "coherence"}
    assert all(png.startswith(b"\x89PNG\r\n\x1a\n") for png in output["images"].values())
    assert output["images"]["difference"] != output["images"]["coherence"]
