# NASA Space Apps Challenge 2026 — submission pack

Challenge: **Dancing with the SARs**  
Project: **ZORI — Alien Earth Observatory**  
Submission window (official Space Apps schedule): November 14–15, 2026.  
Website URL: **ADD ACTUAL CLOUD RUN URL AFTER DEPLOYMENT**  
GitHub: https://github.com/marymair/NISAR

**Eligibility caution:** Check the organizers' written authorization to begin coding before the official opening, and confirm it applies to judging/global awards. Keep the written response. Do not misrepresent when work began.

## 1. Copy-ready English project summary

> ZORI is an interactive alien observatory that invites everyone to explore Earth's changing surface using real NASA–ISRO NISAR L-band synthetic-aperture radar data. Choose floods, vegetation, or ground motion; click a location on a 3D Earth; and search the NASA Alaska Satellite Facility archive in real time. When compatible scientific scenes are available and NASA Earthdata access is configured, ZORI analyzes GCOV radar backscatter before and after or visualizes GUNW interferometric phase, showing the results alongside their source IDs and limitations. Our expressive, animated alien guide explains complex radar science to beginners and researchers in four languages. ZORI transforms raw satellite observations into transparent, approachable scientific exploration—not unsupported hazard predictions.

## 2. Project details

### The problem
Changes from floods, vegetation disturbance and ground movement can be difficult to observe with ordinary cameras because clouds, darkness and smoke may obscure the surface. Synthetic-aperture radar uses its own microwave signal. But complex radar data products are difficult for non-specialists to discover and interpret.

### Our solution
ZORI combines a cinematic interactive science laboratory with live catalog discovery and on-demand analysis of public NISAR science products. Users choose a change category and a place on the globe, receive scene metadata with time ranges and processing maturity, and can launch real backscatter or phase analysis when suitable files and Earthdata access are available.

### What is technically novel
The interface makes NISAR science accessible through a playful original alien guide without detaching it from reproducible sources. We distinguish VALIDATED, PROVISIONAL, and BETA source collections and refuse to mix maturity levels when computing paired GCOV changes. For compatible GCOV granules, numerical extraction and co-registration produce a dB difference map from two real radar observations; for GUNW, interferometric phase is shown without mislabeling it as corrected displacement.

### Who benefits
Researchers and learners checking NISAR coverage; educators explaining radar and Earth systems; curious citizens exploring changes affecting communities. This is an educational and exploration tool, not an emergency alert service.

### Data freshness and quality
Metadata search happens on user request against the public NASA ASF archive, not from a hardcoded list. Processed satellite products are published after acquisition (often about 36–72 hours later), so the app is not live satellite telemetry. Not every location/date has a compatible pair, and processing may be slow. A 3 dB radar difference is not the same as a confirmed flood or burn scar. Our maps do not automatically identify causes.

### Human-centered storytelling
ZORI is an original vector character created for this project: asymmetric luminous fins, forehead diamond sensor, energy tail, six expressions and subtle hovering. The app has English, Russian, French and Spanish modes, dark/light styling, interactive globe, and three levels of radar explanations.

## 3. Core technology

Frontend: HTML, CSS, vanilla JavaScript, MapLibre GL JS.  
API: Python FastAPI on Google Cloud Run.  
Catalog: asf_search to query NASA ASF/CMR NISAR data.  
Protected science HDF5: NASA Earthdata Login through Earthaccess with secrets in Google Secret Manager.  
Science: h5py, NumPy, SciPy and pyproj; aligned GCOV backscatter difference, GUNW phase.  
Presentation: Pillow PNG products with before/after/difference and source metadata.

Do not claim "fully operational" until the Cloud Run URL and a full authenticated HDF5 processing run have succeeded.

## 4. Citations / resources

NASA:
- https://nisar.jpl.nasa.gov/
- https://www.spaceappschallenge.org/2026/
- https://nisar-docs.asf.alaska.edu/
- https://docs.asf.alaska.edu/
- https://earthdata.nasa.gov/

NASA case studies:
- https://science.nasa.gov/earth/earth-observatory/where-venezuelas-earthquakes-shifted-the-ground/
- https://science.nasa.gov/earth/earth-observatory/painting-the-growing-season-in-the-maize-triangle/
- https://svs.gsfc.nasa.gov/5661/

External software:
- https://maplibre.org/
- https://fastapi.tiangolo.com/
- https://numpy.org/
- https://scipy.org/
- https://www.h5py.org/
- https://pyproj4.github.io/pyproj/
- https://earthaccess.readthedocs.io/
- https://docs.asf.alaska.edu/asf_search/

Map/imagery credits are also present in the interactive map where required.

### AI assistance disclosure
OpenAI's ChatGPT assisted with brainstorming, interface design, programming, code review, testing and drafting this submission. The applicant directed project scope, selected scientific questions, and should verify and present the final deployed result. Science outputs must come from real NASA datasets, not generated by the AI.

## 5. Demo video storyboard (approx. 30 seconds)

0–4s — Enter the cinematic space laboratory: "A planet that never stops dancing." Show ZORI floating.  
4–9s — Select change type: flooding, vegetation or ground motion; fly to a real location on the globe.  
9–15s — Show live ASF search results: real source IDs, dates, data maturity and no-data handling.  
15–22s — Run the analysis on a **tested** suitable point; show real GCOV before/after and difference, or valid GUNW phase.  
22–27s — Ask ZORI to explain the finding; show accessible English explanation and Russian localization.  
27–30s — Show the transparency note, source link, and project title.

**If authenticated HDF5 processing isn't yet working, replace the processing shot with a verified NASA case source and explicitly label it as a published example. Never present a mock processing result as real.**

## 6. Final pre-submit checklist

- [ ] Confirm explicit pre-hackathon organizer approval and eligibility for the awards category.
- [ ] Register for 2026 Space Apps, choose local event and team, and select Dancing with the SARs.
- [ ] Deploy Google Cloud Run and paste the actual HTTPS URL above.
- [ ] GET /health succeeds.
- [ ] Public NASA ASF metadata search returns real source entries.
- [ ] Attach Earthdata credentials through Secret Manager (never in code).
- [ ] Verify at least one complete HDF5 analysis with screenshot/source IDs.
- [ ] Check the website on mobile and desktop, language/theme switches and ZORI emotion interactions.
- [ ] Test alternate location with no NISAR coverage; show honest explanation.
- [ ] Confirm claims and scientific units, NASA citations and map attribution.
- [ ] Record a short demo or provide the permitted slide alternative, following the current official submission instructions.
- [ ] Enter project title/summary, website, repository, NASA data sources, licenses and AI disclosure.
- [ ] Submit through the official Space Apps project dashboard within the published window and save confirmation.
