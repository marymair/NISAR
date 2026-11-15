"""Guard user-visible ZORI workflows against regressions in browser assets."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = (ROOT / "frontend/app.js").read_text(encoding="utf8")
HTML = (ROOT / "frontend/index.html").read_text(encoding="utf8")
ZORI = (ROOT / "frontend/zori.js").read_text(encoding="utf8")
SCIENCE = (ROOT / "frontend/science-i18n.js").read_text(encoding="utf8")
SAMPLES = (ROOT / "frontend/samples.js").read_text(encoding="utf8")


def test_live_nisar_results_precede_nasa_reference_when_successful():
    assert "const R = state.report, s = R && R.live ? null : state.sample" in APP
    assert "live.beforeImg && live.afterImg" in APP
    assert "live.diffImg" in APP


def test_catalog_failure_does_not_degrade_to_unfiltered_nisar_results():
    assert "if (LIVE) throw new Error('NASA ASF catalog HTTP '" in APP
    assert "Math.abs(lat) > 85" in APP
    assert "hasScienceInputs()" in APP


def test_map_modes_and_clear_actions():
    assert 'id="btn-proj"' in HTML
    assert 'id="btn-base"' not in HTML
    assert "mission-polish.css" in HTML
    assert "i18n-it.js" in HTML
    assert 'data-lang="it"' in HTML
    assert "'a.btn': 'Анализировать место'" in SCIENCE


def test_companion_animations_and_accessible_reference_imagery():
    assert "zori-eyes" in ZORI
    assert "zori-arm-right" in ZORI
    assert "pointerdown" in ZORI
    assert "suppressClickUntil" in ZORI
    assert "svs.gsfc.nasa.gov" in SAMPLES
    assert "assets.science.nasa.gov" in SAMPLES
