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

Full HDF5 processing requires an Earthdata Login token injected as a **Google Cloud Run Secret Manager secret**; do not put credentials in frontend JavaScript. NASA science files can be extremely large, and data reads can be slow. The backend is a single-instance in-memory demonstrator with limited concurrency and no durable job queue.

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

The case cards link to official NASA studies. Those published example illustrations are not represented as new calculations by our application.

## Dependencies and attribution

- [NASA–ISRO NISAR](https://nisar.jpl.nasa.gov/), NASA Jet Propulsion Laboratory, ISRO.
- [NASA ASF DAAC](https://asf.alaska.edu/) data catalog and [NISAR User Guide](https://nisar-docs.asf.alaska.edu/); see each returned scene's product ID/date for scientific provenance.
- [asf_search](https://docs.asf.alaska.edu/asf_search/), [earthaccess](https://earthaccess.readthedocs.io/), [h5py](https://www.h5py.org/), [NumPy](https://numpy.org/), [SciPy](https://scipy.org/), [pyproj](https://pyproj4.github.io/pyproj/), [Pillow](https://pillow.readthedocs.io/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/).
- Base map provider and attribution: Esri World Imagery, NASA GIBS imagery, CARTO and OpenStreetMap; these are contextual basemaps, **not NISAR scientific measurements**. Their respective licenses and attribution requirements apply.
- Original ZORI mascot and app code are authored in this project; images from external reference sites are not incorporated without permission.
- AI disclosure: ChatGPT/OpenAI tools supported ideation, UI design, code generation, debugging, technical writing and testing. The project is human-directed and scientific claims are linked to primary NASA/ASF sources.

## Independent project and license

This is **not an official NASA, ISRO or Alaska Satellite Facility website** and does not imply endorsement. Agency logos are not displayed. NASA/ASF is credited for the scientific data.

Source code: [MIT License](LICENSE), copyright 2026 marymair; third-party libraries, maps and NASA source imagery retain their own terms. See [docs/SUBMISSION.md](docs/SUBMISSION.md) for the English submission narrative and demo checklist.
