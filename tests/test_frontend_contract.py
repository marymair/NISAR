"""Guard user-visible ZORI workflows against regressions in browser assets."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = (ROOT / "frontend/app.js").read_text(encoding="utf8")
HTML = (ROOT / "frontend/index.html").read_text(encoding="utf8")
ZORI = (ROOT / "frontend/zori.js").read_text(encoding="utf8")
SCIENCE = (ROOT / "frontend/science-i18n.js").read_text(encoding="utf8")
SAMPLES = (ROOT / "frontend/samples.js").read_text(encoding="utf8")


def test_live_nisar_results_precede_nasa_reference_when_successful():
    assert "const s = R && R.live ? null : sample" in APP
    assert "const before = data.before || data.beforeImg" in APP
    assert "const after = data.after || data.afterImg" in APP
    assert "const diff = data.difference || data.diffImg" in APP
    assert 'class="unified-science-report"' in APP or 'unified-science-report' in APP
    assert "case.liveEventRadar" in APP
    assert "case.liveCause." in APP


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
    assert "sourceUrl: 'https://science.nasa.gov" in SAMPLES
    assert not any(key + ": 'https://" in SAMPLES for key in ("image", "before", "after"))
    assert 'window.ZORI_CASE_DATA' in (ROOT / "frontend/case-data.js").read_text(encoding="utf8")


def test_before_after_slider_has_visible_thumb_and_synced_controls():
    css = (ROOT / "frontend/mission-polish.css").read_text(encoding="utf8")
    assert 'class="compare-group"' in APP
    assert 'class="compare-overlay"' in APP
    assert 'class="compare-range"' in APP
    assert 'class="c-grip"' in APP
    assert "cmp.style.setProperty('--pos', pos + '%')" in APP
    assert "sliders.forEach(slider => slider.addEventListener('input'" in APP
    assert "touch-action: pan-y" in css
    assert "html[data-theme=\"light\"] #result .compare-slider-row" in css


def test_precomputed_case_gallery_no_external_image_substitutions():
    case_js = (ROOT / "frontend/case-data.js").read_text(encoding="utf8")
    precompute = (ROOT / "tools/precompute_cases.py").read_text(encoding="utf8")
    assert 'bindCompareSliders($(\'#cases-grid\'))' in APP
    assert "$$('.compare', root).forEach" in APP
    assert "$$('.compare img', cmp).forEach" in APP
    assert "$$('input[type=range]', group)" in APP
    assert 'case.event' in SCIENCE and 'case.cause' in SCIENCE
    assert 's.event[state.lang]' in APP and 's.cause[state.lang]' in APP
    assert 'window.ZORI_CASE_DATA' in case_js
    assert 'process' not in case_js.lower() or 'precompute' in case_js.lower()
    assert 'spec["image_kinds"]' in precompute
    assert 'png.startswith(PNG_HEADER)' in precompute
    assert 'No NASA illustrations or unverified data were downloaded.' in precompute


def test_only_verified_cases_are_in_intro_and_gallery():
    assert "function readyCases()" in APP
    assert "s.precomputed === true" in APP
    assert "const ready = readyCases()" in APP
    assert "const intro = ready.map" in APP
    assert "ready.length ? ready.map" in APP
    assert "scienceVisual(s)" in APP
    assert "case.noArchive" in APP
    assert "case.scanUnavailable" in APP


def test_unified_science_result_shows_event_causes_and_methods_honestly():
    assert "const eventDescription = sample" in APP
    assert "case.liveEventPhase" in APP
    assert "case.liveEventRadar" in APP
    assert "case.noConfirmedEvent" in APP
    assert "case.metricGCOV" in APP
    assert "case.metricGUNW" in APP
    css = (ROOT / "frontend/mission-polish.css").read_text(encoding="utf8")
    assert "#result .unified-science-report" in css
