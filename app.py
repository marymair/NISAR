import datetime, json, pathlib
import requests, folium, streamlit as st
from folium.raster_layers import ImageOverlay
from streamlit_folium import st_folium

st.set_page_config(page_title="NISAR Surface Change Tracker", page_icon="🛰️", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
html, body, [class*="css"] { font-family:'Space Grotesk',sans-serif; }
.stApp { background:
  radial-gradient(1100px 600px at 12% -10%, #16254d 0%, transparent 60%),
  radial-gradient(900px 500px at 100% 0%, #3a1030 0%, transparent 55%), #070b16; }
header[data-testid="stHeader"] { background:transparent; }
.block-container { padding-top:2rem; max-width:1200px; }
.badge { display:inline-block; padding:6px 14px; border:1px solid #2c3a66; border-radius:999px;
  color:#8fb4ff; font-size:12px; letter-spacing:.08em; text-transform:uppercase; background:rgba(79,140,255,.08); }
.hero h1 { font-size:3.3rem; line-height:1.05; margin:16px 0 10px; font-weight:700;
  background:linear-gradient(90deg,#7db1ff 0%,#c58bff 50%,#ff7a59 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.hero p { color:#aab4cf; font-size:1.12rem; max-width:780px; line-height:1.6; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:14px; margin:18px 0 8px; }
.card { background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
  border:1px solid #232d4d; border-radius:14px; padding:18px; transition:.25s; }
.card:hover { border-color:#4f8cff; transform:translateY(-2px); box-shadow:0 8px 30px rgba(79,140,255,.18); }
.card .ic { font-size:1.8rem; }
.card h4 { margin:8px 0 4px; color:#fff; font-size:1.05rem; }
.card p { margin:0; color:#98a3c0; font-size:.85rem; line-height:1.5; }
.card .prod { color:#7db1ff; font-size:.78rem; margin-top:6px; }
.tag { display:inline-block; margin-top:10px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.05em; }
.live { background:rgba(46,204,113,.15); color:#4ee38a; border:1px solid #2f8f5b; }
.plan { background:rgba(255,255,255,.06); color:#9aa6c4; border:1px solid #334066; }
[data-testid="stMetric"] { background:rgba(255,255,255,.04); border:1px solid #232d4d; border-radius:12px; padding:14px 16px; }
[data-testid="stMetricValue"] { color:#7db1ff; }
.stButton > button { border-radius:10px; border:1px solid #2c3a66; transition:.2s; }
.stButton > button:hover { border-color:#4f8cff; box-shadow:0 0 18px rgba(79,140,255,.35); }
button[kind="primary"] { background:linear-gradient(90deg,#4f8cff,#9b59ff) !important; border:none !important; }
.note { border-left:3px solid #4f8cff; background:rgba(79,140,255,.07); padding:12px 16px; border-radius:6px; color:#c5cde2; font-size:.92rem; }
.foot { text-align:center; color:#6f7a99; font-size:12px; margin-top:30px; }
</style>
""", unsafe_allow_html=True)


def secret(k):
    try:
        return st.secrets[k]
    except Exception:
        return ""


BACKEND, HDR = secret("BACKEND_URL"), {"X-API-Key": secret("API_KEY")}
CASE = pathlib.Path("cases/venezuela")
ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

# ---------- HERO ----------
st.markdown("""
<div class="hero">
  <span class="badge">NASA Space Apps Challenge 2026 · Dancing with the SARs</span>
  <h1>NISAR Surface Change Tracker</h1>
  <p>Earth never stands still. We turn raw L-band radar from the NASA-ISRO NISAR mission into a
  quality-checked picture of how the ground moves, and we are honest about what the radar can and cannot tell you.</p>
</div>
""", unsafe_allow_html=True)

CARDS = [
    ("🌍", "Earthquakes", "InSAR displacement · NISAR GUNW", "Ground motion along the satellite line of sight, masked by coherence.", True),
    ("❄️", "Glaciers", "Pixel offsets · NISAR GOFF", "Ice-flow speed from sub-pixel offsets. Next module.", False),
    ("🌊", "Floods", "Backscatter · NISAR GCOV", "Open water is dark in radar. Change detection planned.", False),
    ("🌿", "Wetlands", "Backscatter time series · GCOV", "Seasonal flooding under vegetation (HH/HV).", False),
    ("🔥", "Wildfires", "HV backscatter change · GCOV", "Forest structure loss seen through smoke and cloud.", False),
    ("🏜️", "Desertification", "Soil moisture · NISAR SME2", "Long-term moisture and surface trends.", False),
]
html = '<div class="grid">'
for ic, t, prod, d, live in CARDS:
    tag = '<span class="tag live">● LIVE</span>' if live else '<span class="tag plan">ROADMAP</span>'
    html += f'<div class="card"><div class="ic">{ic}</div><h4>{t}</h4><p>{d}</p><div class="prod">{prod}</div>{tag}</div>'
st.markdown(html + "</div>", unsafe_allow_html=True)
st.caption("Each change type needs a different NISAR product. We ship one fully validated pipeline instead of six fake ones.")

tab1, tab2, tab3 = st.tabs(["🌍 Case study: Venezuela M7.5", "🛰️ Explore NISAR live", "🔬 Method & limits"])

# ---------- TAB 1 ----------
with tab1:
    sf = CASE / "stats.json"
    if not sf.exists():
        st.warning("Case data not found. Run precompute.py and upload cases/venezuela/.")
    else:
        s = json.loads(sf.read_text())
        st.markdown("**24 June 2026.** A M7.2 and a M7.5 earthquake struck northern Venezuela "
                    "(strike-slip, San Sebastián fault system). "
                    f"Pair: {s.get('pair', 'see scene name')}. Product: `{s.get('scene', '')}`")
        c = st.columns(4)
        c[0].metric("Reliable pixels", f"{s['valid_pct']}%")
        c[1].metric("Mean coherence", s.get("mean_coherence"))
        c[2].metric("99th pct |LOS|", f"{s['los_cm_abs_p99']} cm")
        c[3].metric("Pixel size", f"~{s['pixel_m_approx']} m")
        op = st.slider("Overlay opacity", 0.1, 1.0, 0.8)
        if s.get("bounds"):
            b = s["bounds"]
            m = folium.Map(location=[(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2],
                           zoom_start=8, tiles=ESRI, attr="Esri World Imagery")
            ImageOverlay(image=str(CASE / "overlay.png"), bounds=b, opacity=op).add_to(m)
            st_folium(m, height=560, returned_objects=[])
        st.image(str(CASE / "quicklook.png"), caption="Coherence (left) and masked relative LOS displacement (right)")
        st.markdown('<div class="note">Colours show <b>relative line-of-sight displacement</b> in cm, '
                    'referenced to a high-coherence area. NASA reported up to ~60 cm of ground shift near '
                    'Caracas and La Guaira. Our value is LOS, downsampled and masked, so we compare '
                    'order of magnitude and pattern, not exact numbers.</div>', unsafe_allow_html=True)

# ---------- TAB 2 ----------
with tab2:
    st.write("Click a point, search real NISAR GUNW products, pick one, analyze it.")
    if not BACKEND:
        st.warning("BACKEND_URL is not configured in Secrets.")
    else:
        for k, v in {"lat": 10.5, "lon": -67.0, "scenes": [], "searched": False, "job": None, "res": None}.items():
            st.session_state.setdefault(k, v)
        d1, d2 = st.columns(2)
        start = d1.date_input("From", value=datetime.date(2026, 6, 10))
        end = d2.date_input("To", value=datetime.date(2026, 7, 5))
        m = folium.Map(location=[st.session_state.lat, st.session_state.lon], zoom_start=5,
                       tiles=ESRI, attr="Esri World Imagery")
        folium.Marker([st.session_state.lat, st.session_state.lon]).add_to(m)
        click = st_folium(m, height=380, returned_objects=["last_clicked"])
        if click and click.get("last_clicked"):
            st.session_state.lat = click["last_clicked"]["lat"]
            st.session_state.lon = click["last_clicked"]["lng"]
        st.caption(f"Point: {st.session_state.lat:.3f}, {st.session_state.lon:.3f}")

        if st.button("Search NISAR GUNW here"):
            try:
                r = requests.post(f"{BACKEND}/search", headers=HDR, timeout=90, json={
                    "lat": st.session_state.lat, "lon": st.session_state.lon,
                    "start_date": str(start), "end_date": str(end)})
                r.raise_for_status()
                st.session_state.scenes = r.json()["scenes"]
                st.session_state.searched = True
                st.session_state.job, st.session_state.res = None, None
            except Exception as e:
                st.error(f"Search failed: {e}")

        sc = st.session_state.scenes
        if sc:
            st.success(f"{len(sc)} GUNW products at this point")
            labels = {f"{x['maturity']} | {str(x['date'])[:10]} | {x['name']}": x["name"] for x in sc}
            pick = st.selectbox("Choose the exact product to analyze", list(labels))
            st.caption("PROVISIONAL and BETA are not equally mature. Do not compare them without care.")
            if st.button("Analyze this product", type="primary"):
                r = requests.post(f"{BACKEND}/analyze", headers=HDR, timeout=30, json={"scene_name": labels[pick]})
                if r.status_code == 200:
                    st.session_state.job, st.session_state.res = r.json()["job_id"], None
                else:
                    st.error(r.text)
        elif st.session_state.searched:
            st.info("No GUNW products here for these dates. No data is not the same as no change.")

        @st.fragment(run_every=5)
        def poll():
            jid = st.session_state.job
            if not jid or st.session_state.res:
                return
            d = requests.get(f"{BACKEND}/status/{jid}", headers=HDR, timeout=15).json()
            if d["status"] == "processing":
                st.info(f"⏳ {d.get('stage')} ...")
            elif d["status"] == "error":
                st.error(d.get("error"))
            else:
                img = requests.get(f"{BACKEND}/result/{jid}/quicklook.png", headers=HDR, timeout=60).content
                st.session_state.res = {"img": img, "stats": d["stats"]}
                st.rerun()
        poll()

        if st.session_state.res:
            st.image(st.session_state.res["img"])
            st.json(st.session_state.res["stats"])
            st.download_button("Download PNG", st.session_state.res["img"], "nisar_result.png", "image/png")

# ---------- TAB 3 ----------
with tab3:
    st.markdown("""
**Pipeline.** ASF search → selected GUNW (HDF5) → unwrapped phase and coherence → mask
(coherence ≥ 0.4, valid connected components) → reference to a high-coherence area →
phase × λ/4π (L-band, ~23.8 cm) → relative LOS displacement.

**Limits (please read).**
- LOS displacement is **relative** and mixes vertical and horizontal motion. It is not a vertical-motion measurement.
- Ionospheric, tropospheric and tide corrections are **not** applied by default in GUNW, so residual errors remain.
- Low coherence (vegetation, water, steep terrain) is masked. Masked is not "no change".
- The reference area is assumed stable. Near a large earthquake this is approximate.
- PROVISIONAL data are calibrated but only partially validated.
- GUNW exists only as 12-day co-polarised pairs. Floods, fires and wetlands need backscatter (GCOV): roadmap.
""")

st.markdown('<div class="foot">Built solo for NASA Space Apps 2026 · Data: NASA/ISRO NISAR via ASF DAAC · Basemap: Esri World Imagery</div>',
            unsafe_allow_html=True)
