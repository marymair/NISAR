# ZORI — Alien Earth Observatory

**Explore Earth's changing surface using real NASA–ISRO NISAR synthetic-aperture radar data.**

An independent, multilingual science-communication web application designed around the NASA Space Apps Challenge 2026 theme *Dancing with the SARs*. ZORI, an original animated alien guide, helps visitors explore changes from floods, forests and ground motion.

## What works

- Cinematic interactive space-laboratory UI; original reactive SVG mascot ZORI.
- Interactive MapLibre Earth globe, satellite and base-map options.
- English, Russian, French and Spanish translations, with dark and light themes.
- Geographic and time-range search of NASA Alaska Satellite Facility (ASF) NISAR scientific products. The catalog is queried live; returned products are actual archived scenes, not simulation.
- Separate VALIDATED, PROVISIONAL and BETA collections using official CMR short names, avoiding mixed scientific processing maturity.
- When NASA Earthdata credentials are set on the backend, read remote HDF5 science layers and compute:
  - GCOV two-scene backscatter change: geospatially align raster windows, convert linear covariance terms to dB, show before/after/difference, median delta and fraction of measured pixels whose backscatter changed by at least 3 dB.
  - GUNW interferometric unwrapped phase quick-look with a coherence mask, not a fully corrected deformation/displacement estimate.
- Links to original NASA studies for three curated real events.

## Scientific honesty

This project **does not stream raw telemetry directly from orbit**; it queries the latest NISAR products already published in the NASA ASF archive. Processing on the server is on demand. NISAR processed products typically appear with a delay of ~36–72 hours.

A radar brightness change can be caused by many factors, including acquisition geometry, moisture, and seasonal growth. It **does not automatically confirm a flood or forest fire**. The changed-pixel statistic is not an affected-area estimate. GUNW phase requires geophysical corrections before it can be interpreted as physical displacement. The results are exploratory and should be verified using source granules and secondary observations.

Full HDF5 processing requires NASA Earthdata Login credentials supplied securely through **Google Cloud Secret Manager** (this Cloud Run deployment uses EARTHDATA_USERNAME and EARTHDATA_PASSWORD because ASF OAuth may reject bearer-token redirects). Never put credentials in frontend JavaScript or GitHub. NASA science files can be extremely large, and data reads can be slow. The backend is a single-instance in-memory demonstrator with limited concurrency and no durable job queue.

## Running and deployment

See [deploy/README.md](deploy/README.md) for **Cloud Shell / Google Cloud Run** instructions, including secure Earthdata token setup, cost warnings and verification.

The same FastAPI service hosts the site and API:
- GET /health — service status and credential configuration flag.
- GET /api/search?lat=...&lon=...&start=...&end=...&change=flood — public NASA ASF metadata.
- POST /analyze — start authenticated remote NISAR HDF5 analysis.
- GET /status/{job_id} — job result, source provenance and measurements.
- GET /image/{job_id}?kind=before|after|difference — server-generated PNG.

Local development:

~~~bash
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8080
~~~

Tests:

~~~bash
python -m pip install pytest httpx
python -m pytest -q tests
~~~

CI: [Verify ZORI Observatory](https://github.com/marymair/NISAR/actions), including offline calculations and an independent network smoke test against ASF.

## Curated NASA case studies

- [Venezuela earthquakes, June 2026](https://science.nasa.gov/earth/earth-observatory/where-venezuelas-earthquakes-shifted-the-ground/)
- [South African Maize Triangle, 2025–26](https://science.nasa.gov/earth/earth-observatory/painting-the-growing-season-in-the-maize-triangle/)
- [Mozambique floods, January 2026](https://svs.gsfc.nasa.gov/5661/)

The case cards show NASA-published image assets with explicit source links and creator credits, while on-demand ZORI scientific results are labeled separately. Mozambique official pre/post images are from NASA SVS #5661 (Zoey N. Armstrong); the Venezuela image is NASA Earth Observatory (Lauren Dauphin/NISAR team), and the South African imagery is Paul Siqueira (UMass Amherst), prepared for NASA Earth Observatory by Michala Garrison. The ZORI-generated GCOV and GUNW results are derived separately from ASF scene files. Never present a NASA-published illustration as a fresh ZORI calculation.

## Dependencies and attribution

- [NASA–ISRO NISAR](https://nisar.jpl.nasa.gov/), NASA Jet Propulsion Laboratory, ISRO.
- [NASA ASF DAAC](https://asf.alaska.edu/) data catalog and [NISAR User Guide](https://nisar-docs.asf.alaska.edu/); see each returned scene's product ID/date for scientific provenance.
- [asf_search](https://docs.asf.alaska.edu/asf_search/), [earthaccess](https://earthaccess.readthedocs.io/), [h5py](https://www.h5py.org/), [NumPy](https://numpy.org/), [SciPy](https://scipy.org/), [pyproj](https://pyproj4.github.io/pyproj/), [Pillow](https://pillow.readthedocs.io/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/).
- Base map provider and attribution: Esri World Imagery, NASA GIBS imagery, CARTO and OpenStreetMap; these are contextual basemaps, **not NISAR scientific measurements**. Their respective licenses and attribution requirements apply.
- Original ZORI mascot and app code are authored in this project. NASA scientific imagery shown in the reference case cards is cited to its original authors and pages and used in an educational, informational context under [NASA's imagery and media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). NASA trademarks and logos are not used to imply endorsement. NASA imagery can include third-party rights and must be reviewed case by case.
- AI disclosure: ChatGPT/OpenAI tools supported ideation, UI design, code generation, debugging, technical writing and testing. The project is human-directed and scientific claims are linked to primary NASA/ASF sources.

## Independent project and license

This is **not an official NASA, ISRO or Alaska Satellite Facility website** and does not imply endorsement. Agency logos are not displayed. NASA/ASF is credited for the scientific data.

Source code: [MIT License](LICENSE), copyright 2026 marymair; third-party libraries, maps and NASA source imagery retain their own terms. See [docs/SUBMISSION.md](docs/SUBMISSION.md) for the English submission narrative and demo checklist.

## Contest sources and user-facing accessibility

NASA Space Apps 2026 [participant terms](https://www.spaceappschallenge.org/legal/) require citing **every** source, including open-source dependencies and imagery. The source documentation and case cards reference the original NASA studies. The published NASA images are clearly distinguished from the app's own on-demand numerical results. The observatory offers English, Russian, French, Spanish and Italian; two geographic map projections (3-D globe and 2-D flat map); a draggable, blinking, animated ZORI guide; and explicit "no compatible data" states rather than unrelated generic catalog fallbacks. The processor intentionally rejects locations outside ±85° latitude. The backend currently uses an in-memory job store; image links may expire when Cloud Run restarts.


## Precomputed Cases — first-party NISAR radar image archive

The **Examples** screen deliberately uses only PNGs computed by this application's scientific backend from authenticated NASA/ASF NISAR HDF5 granules. NASA article illustrations and remote photography are **not** embedded. Event background and cited NASA source links are separate from the radar measurements.

After Cloud Shell has fetched the latest GitHub source, run the seed command from the repository root:

```bash
python3 tools/precompute_cases.py
```

This submits three science jobs to the already-deployed, Earthdata-authenticated Cloud Run service, polls their statuses, verifies authentic PNG output and provenance, and stores the resulting science imagery under `frontend/assets/cases/`. It also writes `frontend/case-data.js` and `frontend/assets/cases/manifest.json` with real image paths, dates and computed metrics. Then deploy the **local** Cloud Shell working directory with `gcloud run deploy zori-observatory --source . --project zori-nisar-observatory --region europe-west6 --allow-unauthenticated`. Optionally commit/push generated assets to GitHub so examples survive future clones.

No credentials are exposed in this archive; authentication remains inside Cloud Run. The code reports a case as **not ready** when there are no compatible data or processing fails; it never creates placeholder science images. Confirmed GCOV cases (such as Mozambique) show an actual before/after radar comparison and change map. GUNW is a *paired interferometric phase result* and is shown as **one science image**, never mislabeled as two displacement photographs. A GCOV backscatter change does not prove the flood footprint or crop yield. Sources and cautions remain visible.

