"""Precomputed NISAR cases must be authentic, local, and visibly qualified."""
import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SAMPLES = (ROOT / "frontend/samples.js").read_text(encoding="utf8")
APP = (ROOT / "frontend/app.js").read_text(encoding="utf8")
HTML = (ROOT / "frontend/index.html").read_text(encoding="utf8")
ARCHIVE = (ROOT / "frontend/case-data.js").read_text(encoding="utf8")
SCRIPT = (ROOT / "tools/precompute_cases.py").read_text(encoding="utf8")


def test_case_archive_generator_compiles_without_network():
    ast.parse(SCRIPT)
    assert "gcov_backscatter_difference" in SCRIPT
    assert "gunw_unwrapped_phase" in SCRIPT
    assert "PNG_HEADER" in SCRIPT
    assert "NO" not in SCRIPT or "No NASA illustrations" in SCRIPT


def test_examples_never_link_remote_images_or_fake_previews():
    assert not any(f"{key}: 'https://" in SAMPLES for key in ("before", "after", "image"))
    assert "window.ZORI_CASE_DATA" in ARCHIVE
    assert 'src="https://' not in APP[APP.index("function renderCases()"):APP.index("function openSample(id)")]


def test_case_archive_loaded_before_frontend_start():
    assert 'src="case-data.js"' in HTML
    assert HTML.index('src="samples.js"') < HTML.index('src="case-data.js"') < HTML.index('src="app.js"')


def test_scientific_panels_have_sliders_for_real_science_layers():
    assert "bindCompareSliders($('#cases-grid'))" in APP
    assert "s.before && s.after" in APP
    assert "data.coherence || data.coherenceImg" in APP
    assert "t('case.coherence')" in APP
    assert "t('case.phaseShort')" in APP
    assert '"difference", "coherence"' in SCRIPT
    assert "t('case.phase')" in APP
    assert "case.event" in APP
    assert "case.cause" in APP
    assert "s.precomputed ? 'case.archived' : 'case.pending'" in APP
