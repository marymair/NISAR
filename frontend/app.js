/* ============ app.js — ZORI · Earth Dance Observatory (v2) ============ */
(() => {
'use strict';

/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} }
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const iso = d => d.toISOString().slice(0, 10);
const ICON = { flood: '🌊', forest: '🌿', ground: '🌋' };
const REC = { flood: ['GCOV'], forest: ['GCOV'], ground: ['GUNW', 'GOFF'] };   /* best NISAR products per change */
const EMPTY = { type: 'FeatureCollection', features: [] };
const BASES = ['sat', 'nasa', 'map'];
const PUBLIC_START = '2026-06-17';       /* first public calibrated L-band observations */
const CFG = window.NISAR_CONFIG || {};
const API_BASE = String(CFG.BACKEND_URL || (location.protocol.startsWith('http') ? location.origin : '')).replace(/\/$/, '');
const LIVE = !!(CFG.ENABLE_PROCESSING && API_BASE);

const state = {
  lang: 'en', theme: 'dark', change: null,
  point: null, place: null, scenes: [], status: 'idle',
  report: null, sample: null, projection: 'globe', base: 'sat',
  range: { from: PUBLIC_START, to: iso(new Date()) }, exLevel: 1, polarOutside: false
};
let map, marker, reqId = 0, spin = true, noteIdx = 0, noteTimer, mapReady = false;
const whenMapReady = fn => (mapReady ? fn() : map.once('load', fn));

const t = (k, vars = {}) => {
  let s = (I18N[state.lang] && I18N[state.lang][k]) ?? I18N.en[k] ?? k;
  for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, b);
  return s;
};
const fmtDate = d => { const x = new Date(d); return isNaN(x) ? '—' : x.toLocaleDateString(state.lang, { year: 'numeric', month: 'short', day: 'numeric' }); };
const fmtCoords = p => `${Math.abs(p.lat).toFixed(4)}° ${p.lat >= 0 ? 'N' : 'S'}, ${Math.abs(p.lng).toFixed(4)}° ${p.lng >= 0 ? 'E' : 'W'}`;
const browseUrl = s => { const b = s.browse; return Array.isArray(b) ? (b.find(Boolean) || null) : (b || null); };
const accentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5cc8ff';

/* ---------- alien lab background + clock ---------- */
function buildLab() {
  let h = '';
  ['l', 'r'].forEach(side => {
    h += `<div class="console ${side}">`;
    for (let i = 0; i < 5; i++) {
      h += `<div class="cpanel" style="--d:${(Math.random() * 3).toFixed(2)}s"><div class="mini">`
        + Array.from({ length: 8 }, () => `<i style="--h:${(20 + Math.random() * 80) | 0}%;--s:${(1.5 + Math.random() * 2.5).toFixed(1)}s"></i>`).join('')
        + '</div><b></b></div>';
    }
    h += '</div>';
  });
  h += '<div class="lights">' + Array.from({ length: 14 }, (_, i) => `<u style="--d:${(i * 0.37).toFixed(2)}s"></u>`).join('') + '</div>';
  $('#lab-bg').innerHTML = h;
}
function tickClock() { $('#i-utc').textContent = new Date().toISOString().slice(11, 19); }

/* ---------- language & theme ---------- */
function applyLang(lang) {
  state.lang = lang; store.set('zori.lang', lang);
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $('#lang-current').textContent = lang.toUpperCase();
  $$('#lang-menu [data-lang]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.lang === lang)));
  updateToolLabels();
  renderSignal(); renderCases(); startNotes(); refreshPanel(); renderTimeline(); renderResult();
  if ($('#explain').open) fillExplain();
  if (state.point) geocode(state.point.lat, state.point.lng, reqId);
}
function updateToolLabels() {
  $('#btn-proj span').textContent = state.projection === 'globe' ? t('m.flat') : t('m.globe');
  // Basemap control removed: the user chooses only globe or flat projection.
}
function applyTheme(th) {
  state.theme = th; store.set('zori.theme', th);
  document.documentElement.dataset.theme = th;
  $('#theme-toggle').setAttribute('aria-pressed', String(th === 'light'));
  if (map && mapReady) updateBasemap();
}
function setChange(id) {
  state.change = id;
  if (id) document.documentElement.dataset.change = id; else delete document.documentElement.dataset.change;
  $$('.change-card').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.change === id)));
  if (id) { zoriSay(t('z.' + id)); window.setZoriEmotion?.(id === 'ground' ? 'detective' : id === 'flood' ? 'wave' : 'curious'); }
  if (state.point) recheck();
  if (map && mapReady) setTimeout(paintAccent, 800);
  refreshPanel();
  if (state.report || state.sample) renderResult();
}

/* ---------- ZORI helper ---------- */
function zoriSay(text) {
  $('#zori-text').textContent = text;
  $('#zori-widget').classList.add('open');
  const msg = String(text || '').toLowerCase();
  let mood = 'happy';
  if (/error|failed|no data|not available|пока нет|ошиб|недостаточно|aucune|sin datos|pas de données/.test(msg)) mood = 'worried';
  else if (/scan|analy|обработ|анализ|скан|radar|processing|traitement|procesando/.test(msg)) mood = 'thinking';
  else if (/found|detect|обнаруж|нашл|wow|удив|incredible|incroyable/.test(msg)) mood = 'surprised';
  else if (/curious|интерес|explor|изуч|explorons|exploremos/.test(msg)) mood = 'curious';
  window.setZoriEmotion?.(mood);
}
function startNotes() {
  clearInterval(noteTimer);
  const arr = I18N[state.lang].notes;
  noteIdx = Math.floor(Math.random() * arr.length);
  zoriSay(arr[noteIdx]);
  noteTimer = setInterval(() => { noteIdx = (noteIdx + 1) % arr.length; zoriSay(I18N[state.lang].notes[noteIdx]); }, 18000);
}
function renderSignal() {
  const arr = I18N[state.lang].signals;
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  $('#signal-text').textContent = arr[day % arr.length];
  $('#signal-date').textContent = new Date().toLocaleDateString(state.lang, { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ---------- ZORI explains (3 levels) ---------- */
function fillExplain() {
  $$('#ex-levels button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.level === state.exLevel)));
  $('#ex-text').textContent = state.change ? t(`ex.${state.change}.${state.exLevel}`) : '';
}
function openExplain() { if (!state.change) return; state.exLevel = 1; fillExplain(); window.setZoriEmotion?.('thinking'); $('#explain').showModal(); }

/* ---------- screens ---------- */
function enterApp(view = 'mission') {
  const intro = $('#intro');
  intro.classList.add('leaving');
  setTimeout(() => {
    intro.hidden = true; intro.classList.remove('leaving');
    $('#app').hidden = false; document.body.dataset.screen = 'app';
    showView(view); initMap(); window.scrollTo(0, 0);
  }, 430);
}
function showView(v) {
  ['mission', 'cases', 'lab'].forEach(n => { $('#view-' + n).hidden = n !== v; });
  $$('.nav button').forEach(b => b.setAttribute('aria-current', b.dataset.view === v ? 'page' : 'false'));
  if (v === 'mission' && map) setTimeout(() => map.resize(), 50);
  window.scrollTo(0, 0);
}
function goHome() { $('#app').hidden = true; $('#intro').hidden = false; document.body.dataset.screen = 'intro'; window.scrollTo(0, 0); }

/* ---------- map / globe ---------- */
function nasaTiles() {
  const d = new Date(state.range.to); d.setDate(d.getDate() - 1);          /* NASA daily imagery lags by about a day */
  return [`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${iso(d)}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`];
}
function initMap() {
  if (map) { map.resize(); return; }
  const cartoAttr = '© <a href="https://carto.com/attributions">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  const carto = name => ['a', 'b', 'c', 'd'].map(s => `https://${s}.basemaps.cartocdn.com/${name}/{z}/{x}/{y}.png`);
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      projection: { type: 'globe' },
      sky: {
        'sky-color': '#199EF3', 'horizon-color': '#cfe8ff', 'fog-color': '#0b1d4a',
        'sky-horizon-blend': 0.5, 'horizon-fog-blend': 0.5, 'fog-ground-blend': 0.5,
        'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0]
      },
      sources: {
        sat:   { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 18, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' },
        nasa:  { type: 'raster', tiles: nasaTiles(), tileSize: 256, maxzoom: 9, attribution: 'Imagery © NASA GIBS / MODIS Terra' },
        dark:  { type: 'raster', tiles: carto('dark_all'),  tileSize: 256, maxzoom: 19, attribution: cartoAttr },
        light: { type: 'raster', tiles: carto('light_all'), tileSize: 256, maxzoom: 19, attribution: cartoAttr }
      },
      layers: [
        { id: 'sat',   type: 'raster', source: 'sat' },
        { id: 'nasa',  type: 'raster', source: 'nasa',  layout: { visibility: 'none' } },
        { id: 'dark',  type: 'raster', source: 'dark',  layout: { visibility: 'none' } },
        { id: 'light', type: 'raster', source: 'light', layout: { visibility: 'none' } }
      ]
    },
    center: [25, 25], zoom: 1.5, minZoom: 1, attributionControl: { compact: true }
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.on('load', () => {
    mapReady = true;
    map.addSource('fp', { type: 'geojson', data: EMPTY });
    map.addLayer({ id: 'fp-fill', type: 'fill', source: 'fp', paint: { 'fill-color': accentColor(), 'fill-opacity': 0.14 } });
    map.addLayer({ id: 'fp-line', type: 'line', source: 'fp', paint: { 'line-color': accentColor(), 'line-width': 2 } });
    updateBasemap(); spinGlobe();
  });
  map.on('error', e => console.warn('map:', e && e.error && e.error.message));
  map.on('click', e => selectPoint(e.lngLat.wrap()));
  ['mousedown', 'touchstart', 'wheel'].forEach(ev => map.on(ev, () => { spin = false; }));
}
function spinGlobe() {
  if (!spin || state.projection !== 'globe' || state.point) return;
  const c = map.getCenter(); c.lng += 0.1; map.jumpTo({ center: c });
  requestAnimationFrame(spinGlobe);
}
function updateBasemap() {
  const vis = (id, on) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  vis('sat', state.base === 'sat');
  vis('nasa', state.base === 'nasa');
  vis('dark', state.base === 'map' && state.theme === 'dark');
  vis('light', state.base === 'map' && state.theme === 'light');
  map.getSource('nasa').setTiles(nasaTiles());
}
function paintAccent() {
  const c = accentColor();
  [['fp-fill', 'fill-color'], ['fp-line', 'line-color']].forEach(([id, prop]) => { if (map.getLayer(id)) map.setPaintProperty(id, prop, c); });
}
function drawFootprints(scenes) {
  if (!mapReady) return;
  map.getSource('fp').setData({ type: 'FeatureCollection', features: scenes.filter(s => s.geometry).map(s => ({ type: 'Feature', geometry: s.geometry, properties: {} })) });
}
function clearOverlay() { if (!mapReady) return; if (map.getLayer('ov')) map.removeLayer('ov'); if (map.getSource('ov')) map.removeSource('ov'); }
function showOverlay(o) {
  clearOverlay();
  if (!o || !mapReady) return;
  map.addSource('ov', { type: 'image', url: o.url, coordinates: o.coordinates });
  map.addLayer({ id: 'ov', type: 'raster', source: 'ov', paint: { 'raster-opacity': 0.85 } }, 'fp-fill');
}

/* ---------- date range ---------- */
function syncDateInputs() { $('#d-from').value = state.range.from; $('#d-to').value = state.range.to; }
function applyRange(from, to) {
  if (!from || !to) return;
  if (from > to) [from, to] = [to, from];
  state.range = { from, to }; syncDateInputs();
  if (mapReady) map.getSource('nasa').setTiles(nasaTiles());
  recheck();
}
function preset(p) {
  const today = iso(new Date()); const d = new Date(); d.setDate(d.getDate() - 30);
  if (p === 'p30') applyRange(iso(d), today);
  if (p === 'pjun') applyRange(PUBLIC_START, today);
  if (p === 'pall') applyRange('2025-07-30', today);
}
async function recheck() {
  if (!state.point) return;
  const token = ++reqId;
  state.status = 'checking'; state.scenes = []; state.report = null;
  state.sample = null;
  refreshPanel(); renderTimeline(); renderResult();
  await checkData(state.point.lat, state.point.lng, token);
}

/* ---------- choose a point ---------- */
async function selectPoint(ll, opts = {}) {
  spin = false;
  const lat = +ll.lat.toFixed(4), lng = +ll.lng.toFixed(4);
  const token = ++reqId;
  state.point = { lat, lng }; state.place = null; state.scenes = [];
  state.status = 'checking'; state.report = null; state.sample = opts.sample || null;
  state.polarOutside = Math.abs(lat) > 85;
  whenMapReady(() => { drawFootprints([]); if (!opts.sample) clearOverlay(); });
  if (!marker) { const el = document.createElement('div'); el.className = 'pin'; marker = new maplibregl.Marker({ element: el }); }
  marker.setLngLat([lng, lat]).addTo(map);
  map.flyTo({ center: [lng, lat], zoom: opts.zoom || Math.max(map.getZoom(), 4.5), speed: 0.9 });
  refreshPanel(); renderTimeline(); renderResult(); setHash();
  if (Math.abs(lat) > 85) zoriSay(t('a.polar'));
  await Promise.allSettled([geocode(lat, lng, token), checkData(lat, lng, token)]);
}
async function geocode(lat, lng, token) {
  if (lat <= -75) { if (token === reqId) { state.place = { name: 'Antarctica / polar region', region: '', country: 'Antarctica' }; refreshPanel(); } return; }
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lng}&accept-language=${state.lang}`);
    const j = await r.json();
    if (token !== reqId) return;
    if (j.error) state.place = { name: null, region: '', country: null };
    else {
      const a = j.address || {};
      state.place = { name: a.city || a.town || a.village || a.municipality || a.county || a.state || j.name || null, region: a.state || a.region || '', country: a.country || null };
    }
  } catch { if (token === reqId) state.place = { name: null, region: '', country: null }; }
  if (token === reqId) refreshPanel();
}
/* Is there any NISAR product over this exact point, inside the chosen dates? (ASF DAAC SearchAPI, no login for search) */
async function checkData(lat, lng, token) {
  if (Math.abs(lat) > 85) {
    if (token === reqId) { state.scenes = []; state.status = 'none'; state.polarOutside = true; refreshPanel(); renderTimeline(); }
    return;
  }
  const direct = 'https://api.daac.asf.alaska.edu/services/search/param?dataset=NISAR&maxResults=300&output=geojson'
    + `&start=${state.range.from}T00:00:00Z&end=${state.range.to}T23:59:59Z`
    + '&intersectsWith=' + encodeURIComponent(`POINT(${lng} ${lat})`);
  const params = new URLSearchParams({
    lat: String(lat), lon: String(lng),
    start: state.range.from, end: state.range.to,
    change: state.change || 'flood'
  });
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 40000);
  try {
    let response = LIVE ? await fetch(API_BASE + '/api/search?' + params, { signal: ctl.signal }) : null;
    if (!response || !response.ok) {
      // Never replace a failed product-specific catalog search with an unfiltered
      // generic NISAR search: it can falsely claim hundreds of unrelated scenes.
      if (LIVE) throw new Error('NASA ASF catalog HTTP ' + (response ? response.status : 'unavailable'));
      response = await fetch(direct, { signal: ctl.signal });
    }
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const j = await response.json();
    if (token !== reqId) return;
    state.scenes = (j.features || []).map(f => ({ ...f.properties, geometry: f.geometry }))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    state.status = state.scenes.length ? 'found' : 'none';
    window.setZoriEmotion?.(state.status === 'found' ? 'excited' : 'worried');
  } catch (e) {
    console.warn('NASA ASF catalog search failed:', e);
    if (token !== reqId) return;
    state.status = 'error';
    window.setZoriEmotion?.('worried');
  } finally { clearTimeout(to); }
  if (token === reqId) { refreshPanel(); renderTimeline(); }
}

/* ---------- info panel & timeline ---------- */
function levelSummary() {
  const c = {};
  state.scenes.forEach(s => { const l = s.processingLevel || '?'; c[l] = (c[l] || 0) + 1; });
  return Object.entries(c).map(([k, v]) => `${k}×${v}`).join(', ');
}
function refreshPanel() {
  const p = state.point;
  $('#p-name').textContent = !p ? t('p.idle') : (state.place ? (state.place.name || t('p.unknown')) : '…');
  $('#p-country').textContent = p && state.place ? ([state.place.region, state.place.country].filter(Boolean).join(', ') || '—') : '—';
  $('#p-coords').textContent = p ? fmtCoords(p) : '—';
  $('#i-target').textContent = p ? `${p.lat.toFixed(2)}, ${p.lng.toFixed(2)}` : '—';
  $('#i-scenes').textContent = state.status === 'found' ? state.scenes.length : (state.status === 'none' ? '0' : '—');
  $('#status').dataset.state = state.status;
  $('#status-text').textContent = t('s.' + state.status);
  let d = '';
  if (state.status === 'found') {
    const dates = state.scenes.map(s => s.startTime).filter(Boolean);
    d = t('s.foundd', { n: state.scenes.length, levels: levelSummary(), from: fmtDate(dates[0]), to: fmtDate(dates.at(-1)) });
  } else if (state.status === 'none') d = state.polarOutside ? t('a.polar') : t('s.noned');
  else if (state.status === 'error') d = t('s.errd');
  $('#status-detail').textContent = d;
  let why = '';
  if (!state.change) why = t('a.needType');
  else if (!p) why = t('a.needPlace');
  else if (state.status === 'checking') why = t('s.checking');
  else if (state.polarOutside) why = t('a.polar');
  else if (state.status !== 'found') why = t('a.needData');
  $('#analyze').disabled = !!why; $('#analyze-why').textContent = why;
  $('#copy').disabled = !p;
}
function renderTimeline() {
  const box = $('#timeline'); const sc = state.scenes;
  if (!sc.length) { box.innerHTML = `<p class="note">${esc(t('tl.empty'))}</p>`; return; }
  const byM = {};
  sc.forEach(s => { const k = (s.startTime || '').slice(0, 7); if (k) byM[k] = (byM[k] || 0) + 1; });
  const keys = Object.keys(byM).sort(); const max = Math.max(...Object.values(byM));
  box.innerHTML = `<div class="bars">${keys.map(k => `<div class="bar" title="${k}: ${byM[k]}"><strong class="bar-count" aria-label="${byM[k]} scenes">${byM[k]}</strong><i style="height:${Math.max(12, byM[k] / max * 78)}%"></i><span>${k.slice(5)}/${k.slice(2,4)}</span></div>`).join('')}</div>`;
}
function setHash() {
  if (!state.point) return;
  try { history.replaceState(null, '', `#${state.change || 'x'}/${state.point.lat}/${state.point.lng}`); } catch {}
}

/* ---------- briefing -> scan -> report ---------- */
function openBriefing() {
  const place = [$('#p-name').textContent, $('#p-country').textContent].filter(x => x && x !== '—').join(', ');
  $('#b-target').textContent = `${place} (${fmtCoords(state.point)})`;
  $('#b-what').textContent = t('ch.' + state.change + '.name');
  $('#b-how').textContent = t('ch.' + state.change + '.how');
  $('#briefing').showModal();
}
function scanMsg(txt) { const m = $('#scan-msg'); m.textContent = txt; m.hidden = !txt; }

/* optional: your Google Cloud backend processes the real interferogram (Ground motion only) */
async function liveAnalyze() {
  const base = API_BASE;
  const headers = { 'Content-Type': 'application/json' };
  const r = await fetch(base + '/analyze', {
    method: 'POST', headers,
    body: JSON.stringify({
      lat: state.point.lat, lon: state.point.lng,
      start_date: state.range.from, end_date: state.range.to, change: state.change
    })
  });
  const j = await r.json();
  if (!r.ok || j.error || !j.job_id) throw new Error(j.detail || j.error || 'No analysis job ID');
  for (let i = 0; i < 225; i++) {
    await sleep(4000);
    const rr = await fetch(base + '/status/' + j.job_id);
    if (!rr.ok) throw new Error('Job status HTTP ' + rr.status);
    const s = await rr.json();
    if (s.status === 'done') {
      const imgs = s.images || {};
      const full = key => imgs[key] ? new URL(imgs[key], base).href : null;
      return {
        jobId: j.job_id, stats: s.stats || {},
        sources: s.sources || [], method: s.method,
        beforeImg: full('before'), afterImg: full('after'),
        diffImg: full('difference'), img: full('difference')
      };
    }
    if (s.status === 'error') throw new Error(s.error || 'Processing error');
    scanMsg(t('live.run') + ' · ' + (i + 1) * 4 + 's');
  }
  throw new Error('Analysis timed out');
}
async function runScan() {
  if (!state.point || state.status !== 'found' || state.polarOutside) { zoriSay(t('a.needData')); return; }
  const sc = $('#scanner'); const pt = map.project([state.point.lng, state.point.lat]);
  sc.style.left = pt.x + 'px'; sc.style.top = pt.y + 'px';
  sc.classList.add('on'); scanMsg(t('scan.text'));
  window.setZoriEmotion?.('thinking');
  $('#map-wrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  let live = null, liveFailed = false, liveError = '';
  if (LIVE) {
    try { live = await liveAnalyze(); } catch (e) { console.warn('live analysis failed:', e); liveFailed = true; liveError = String(e.message || e).slice(0, 220); }
  } else await sleep(300);
  sc.classList.remove('on'); scanMsg('');
  buildReport(live, liveFailed, liveError); renderResult();
  window.setZoriEmotion?.(live ? 'excited' : (liveFailed ? 'worried' : 'curious'));
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function pickPair(list) {
  const seen = new Set();
  const uniq = list.filter(s => { const d = (s.startTime || '').slice(0, 10); if (!d || seen.has(d)) return false; seen.add(d); return true; });
  return uniq.length >= 2 ? [uniq[0], uniq.at(-1)] : null;
}
function buildReport(live, liveFailed, liveError = '') {
  const levels = REC[state.change];
  const rec = state.scenes.filter(s => levels.includes(s.processingLevel));
  const withImg = rec.filter(s => browseUrl(s));
  let pair = null;
  if (state.change !== 'ground') {
    const groups = {};
    withImg.forEach(s => { (groups[[s.pathNumber, s.frameNumber, s.flightDirection].join('|')] ||= []).push(s); });
    const best = Object.values(groups).sort((a, b) => b.length - a.length)[0];
    if (best) pair = pickPair(best);
  }
  state.report = { rec, withImg, pair, live, liveFailed, liveError };
  const shown = pair ? pair : (state.change === 'ground' ? withImg.slice(-4) : withImg.slice(-1));
  whenMapReady(() => drawFootprints(shown.length ? shown : rec.slice(-1)));
}

/* ---------- result card ---------- */
function compareHTML(a, b, la, lb) {
  return `<div class="compare" style="--pos:50%">
      <img src="${esc(a)}" alt="${esc(la)}"><img class="c-after" src="${esc(b)}" alt="${esc(lb)}">
      <span class="c-tag l">${esc(la)}</span><span class="c-tag r">${esc(lb)}</span>
      <div class="c-handle"></div><input type="range" min="0" max="100" value="50" aria-label="${esc(t('r.slide'))}">
    </div>
    <div class="seg" role="group"><button data-mode="slide" aria-pressed="true">${esc(t('r.slide'))}</button><button data-mode="diff" aria-pressed="false">${esc(t('r.diff'))}</button></div>`;
}
function renderResult() {
  const el = $('#result'); const ty = state.change;
  if (!ty || (!state.report && !state.sample) || !state.point) { el.hidden = true; return; }
  // A newly requested scientific analysis takes precedence over the curated NASA case.
  // Otherwise, selecting the Mozambique example hides the real HDF5 result forever.
  // The official image remains available if science processing is unavailable.
  const R = state.report, s = R && R.live ? null : state.sample;
  let title, media = '', extra = '', facts = [];
  if (s) {
    title = s.title[state.lang] || s.title.en;
    extra = `<p>${esc(s.text[state.lang] || s.text.en)}</p><p class="credit">${esc(t('c.credit'))}: ${esc(s.credit)}</p>`;
    if (s.sourceUrl) extra += `<p><a class="btn" href="${esc(s.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(t('live.storylink'))}</a></p>`;
    extra += `<p class="note">${esc(t('live.curated'))}</p>`;
    if (s.before && s.after) media = compareHTML(s.before, s.after, t('r.before'), t('r.after'));
    else if (s.image) media = `<figure><img class="single" loading="lazy" src="${esc(s.image)}" alt="${esc(title)}"><figcaption>${esc(t('live.nasaimage'))} · ${esc(s.credit)}</figcaption></figure>`;
    if (R?.liveFailed) extra += `<p class="scan-error">${esc(t('live.fail'))}${R.liveError ? ' · ' + esc(R.liveError) : ''}</p>`;
  } else {
    title = t('ch.' + ty + '.name');
    const { rec, withImg, pair, live, liveFailed } = R;
    const dates = state.scenes.map(x => x.startTime).filter(Boolean);
    facts.push(t('r.kf.scenes', { n: state.scenes.length, a: fmtDate(dates[0]), b: fmtDate(dates.at(-1)) }));
    if (live) {
      media = `<span class="live-badge">${esc(t('live.badge'))}</span>`;
      if (live.beforeImg && live.afterImg) {
        media += compareHTML(live.beforeImg, live.afterImg, t('r.before'), t('r.after'));
        media += `<figure class="live-difference"><img class="single" src="${esc(live.diffImg)}" alt="${esc(t('r.diff'))}"><figcaption>${esc(t('live.visualdifference'))}</figcaption></figure>`;
      } else if (live.img) {
        media += `<figure><img class="single" src="${esc(live.img)}" alt="${esc(title)}"><figcaption>${esc(t('live.phase'))}</figcaption></figure>`;
      }
      const st = live.stats;
      if (Number.isFinite(st.median_delta_db)) facts.push(t('live.median', {n: st.median_delta_db.toFixed(2)}));
      if (Number.isFinite(st.changed_pixel_fraction)) facts.push(t('live.changed', {n: (st.changed_pixel_fraction * 100).toFixed(1)}));
      if (Number.isFinite(st.relative_phase_iqr_rad)) facts.push(t('live.phaseiqr', {n: st.relative_phase_iqr_rad.toFixed(2)}));
      extra = `<p class="note">${esc(live.method || '')}</p><p class="note">${esc(t('live.warning'))}</p>`;
      if (live.sources.length) extra += `<details><summary>${esc(t('live.sources'))}</summary><ul class="scene-list">${live.sources.map(s => `<li>${esc(s.date || '')} · ${esc(s.maturity || '')} · ${esc(s.id || '')}</li>`).join('')}</ul></details>`;
      if (Number.isFinite(st.disp_min_cm) && Number.isFinite(st.disp_max_cm)) facts.push(t('r.disp', { a: st.disp_min_cm.toFixed(2), b: st.disp_max_cm.toFixed(2) }));
    } else if (!rec.length) {
      extra = `<p class="note">${esc(t('r.norec', { levels: levelSummary() }))}</p>`;
    } else if (pair) {
      media = compareHTML(browseUrl(pair[0]), browseUrl(pair[1]), fmtDate(pair[0].startTime), fmtDate(pair[1].startTime));
      extra = `<p class="note">${esc(t('r.pair', { a: fmtDate(pair[0].startTime), b: fmtDate(pair[1].startTime) }))}</p>`;
      facts.push(t('r.kf.pair', { a: fmtDate(pair[0].startTime), b: fmtDate(pair[1].startTime) }));
    } else if (withImg.length) {
      const imgs = ty === 'ground' ? withImg.slice(-4).reverse() : [withImg.at(-1)];
      media = `<div class="gallery">${imgs.map(x => `<figure><img class="single" loading="lazy" src="${esc(browseUrl(x))}" alt=""><figcaption>${esc(fmtDate(x.startTime))} · ${esc(x.processingLevel)}</figcaption></figure>`).join('')}</div>`;
      if (ty !== 'ground') extra = `<p class="note">${esc(t('r.one'))}</p>`;
    } else extra = `<p class="note">${esc(t('r.noimg'))}</p>`;
    if (liveFailed) extra += `<p class="scan-error">${esc(t('live.fail'))}${R.liveError ? ' · ' + esc(R.liveError) : ''}</p>`;
  }
  const p = state.point;
  const vertex = `https://search.asf.alaska.edu/#/?dataset=NISAR&center=${p.lng},${p.lat}&zoom=8`;
  const list = (R ? R.rec : []).slice(-8).reverse().map(x => `<li>${esc(fmtDate(x.startTime))} · ${esc(x.processingLevel)} · ${esc(x.fileID || x.fileName || '')}</li>`).join('');
  el.innerHTML = `
    <h2>${ICON[ty]} ${esc(title)}</h2>
    <div class="report-grid">
      <div>${media}${extra}</div>
      <div>
        ${facts.length ? `<h3>${esc(t('r.key'))}</h3><ul class="kf">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
        <details class="science-disclosure"><summary>${esc(t('r.science'))}</summary>
        <h3>${esc(t('r.read'))}</h3><p>${esc(t('ch.' + ty + '.how'))}</p>
        <h3>${esc(t('r.pol'))}</h3><p>${esc(t('pol.' + ty))}</p>
        <h3>${esc(t('r.why'))}</h3><p>${esc(t('ch.' + ty + '.why'))}</p>
        <h3>${esc(t('r.trust'))}</h3><p>${esc(t('r.trustd'))}</p>
        <h3>${esc(t('r.future'))}</h3><p>${esc(t('r.futured'))}</p>
        <p class="note">${esc(t('r.optical'))}</p></details>
        <p style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" id="explain-btn">${esc(t('r.explain'))}</button>
          <a class="btn" style="text-decoration:none;color:inherit" href="${esc(vertex)}" target="_blank" rel="noopener">${esc(t('r.vertex'))}</a>
        </p>
        ${list ? `<details><summary>${esc(t('r.scenes'))}</summary><ul class="scene-list">${list}</ul></details>` : ''}
      </div>
    </div>`;
  $$('img.single', el).forEach(i => { i.onerror = () => { i.replaceWith(Object.assign(document.createElement('p'), { className: 'note', textContent: '⚠ ' + (i.getAttribute('src') || 'image') })); }; });
  $('#explain-btn', el).onclick = openExplain;
  const cmp = $('.compare', el);
  if (cmp) {
    $('input[type=range]', cmp).addEventListener('input', e => cmp.style.setProperty('--pos', e.target.value + '%'));
    $$('.seg button', el).forEach(b => b.addEventListener('click', () => {
      $$('.seg button', el).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      cmp.classList.toggle('diff', b.dataset.mode === 'diff');
    }));
  }
  el.hidden = false;
}

/* ---------- case studies ---------- */
function renderCases() {
  const html = SAMPLES.map(s => `
    <button class="card case-card" data-sample="${esc(s.id)}">
      <span class="ico">${ICON[s.type]}</span>
      <h3>${esc(s.title[state.lang] || s.title.en)}</h3>
      <p>${esc((s.text[state.lang] || s.text.en).slice(0, 120))}…</p>
      <span class="tag">${esc(t('ch.' + s.type + '.name'))}</span>
    </button>`).join('');
  $('#cases-grid').innerHTML = html;
  $('#intro-cases').innerHTML = html;
}
function openSample(id) {
  const s = SAMPLES.find(x => x.id === id); if (!s) return;
  if ($('#app').hidden) { $('#intro').hidden = true; $('#app').hidden = false; document.body.dataset.screen = 'app'; initMap(); }
  showView('mission');
  if (s.from && s.to) { state.range = { from: s.from, to: s.to }; syncDateInputs(); }
  setChange(s.type);
  whenMapReady(() => { showOverlay(s.overlay); });
  selectPoint(new maplibregl.LngLat(s.lng, s.lat), { sample: s, zoom: s.zoom });
  setTimeout(() => $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' }), 900);
}

/* ---------- events ---------- */
function bind() {
  $('#begin').onclick = () => enterApp('mission');
  $$('[data-start]').forEach(b => { b.onclick = () => enterApp(b.dataset.start); });
  $('#brand').onclick = goHome;
  $$('.nav button').forEach(b => { b.onclick = () => showView(b.dataset.view); });
  $$('.change-card').forEach(b => { b.onclick = () => { setChange(b.dataset.change); setHash(); }; });
  document.addEventListener('click', e => { const c = e.target.closest('[data-sample]'); if (c) openSample(c.dataset.sample); });

  const menu = $('#lang-menu'), lb = $('#lang-btn');
  lb.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; lb.setAttribute('aria-expanded', String(!menu.hidden)); };
  $('#lang-menu [data-lang]').forEach(b => { b.onclick = () => { applyLang(b.dataset.lang); menu.hidden = true; window.setZoriEmotion?.('curious'); zoriSay(t('z.language')); }; });
  document.addEventListener('click', () => { menu.hidden = true; lb.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.hidden = true; });
  $('#theme-toggle').onclick = () => { applyTheme(state.theme === 'dark' ? 'light' : 'dark'); window.setZoriEmotion?.('surprised'); zoriSay(t('z.theme')); };

  $('#btn-proj').onclick = () => {
    state.projection = state.projection === 'globe' ? 'mercator' : 'globe';
    try { map.setProjection({ type: state.projection }); } catch (e) { console.warn(e); }
    updateToolLabels(); zoriSay(t('z.map'));
  };

  $('#search-form').onsubmit = async e => {
    e.preventDefault();
    const q = $('#search').value.trim(); if (!q) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=${state.lang}&q=${encodeURIComponent(q)}`);
      const j = await r.json();
      if (j[0]) selectPoint(new maplibregl.LngLat(+j[0].lon, +j[0].lat));
    } catch (err) { console.warn(err); }
  };

  $('#d-from').onchange = () => applyRange($('#d-from').value, $('#d-to').value);
  $('#d-to').onchange = () => applyRange($('#d-from').value, $('#d-to').value);
  $$('[data-preset]').forEach(b => { b.onclick = () => preset(b.dataset.preset); });

  $('#analyze').onclick = () => { window.setZoriEmotion?.('detective'); openBriefing(); };
  $('#b-cancel').onclick = () => $('#briefing').close();
  $('#b-go').onclick = () => { $('#briefing').close(); window.setZoriEmotion?.('wave'); zoriSay(t('z.scan')); runScan(); };
  $('#copy').onclick = async () => { try { await navigator.clipboard.writeText(location.href); $('#analyze-why').textContent = t('a.copied'); } catch {} };

  $('#zori-face').onclick = () => { const a = I18N[state.lang].notes; noteIdx = (noteIdx + 1) % a.length; zoriSay(a[noteIdx]); };
  $('#zori-close').onclick = () => $('#zori-widget').classList.remove('open');
  $$('#ex-levels button').forEach(b => { b.onclick = () => { state.exLevel = +b.dataset.level; fillExplain(); }; });
  $('#ex-close').onclick = () => $('#explain').close();
}

/* ---------- boot ---------- */
function boot() {
  buildLab(); bind(); syncDateInputs();
  tickClock(); setInterval(tickClock, 1000);
  applyTheme(store.get('zori.theme', document.documentElement.dataset.theme || 'dark'));
  const nav = (navigator.language || 'en').slice(0, 2);
  applyLang(store.get('zori.lang', I18N[nav] ? nav : 'en'));
  zoriSay(t('z.hello'));
  const m = location.hash.match(/^#(flood|forest|ground|x)\/(-?[\d.]+)\/(-?[\d.]+)$/);
  if (m) {
    $('#intro').hidden = true; $('#app').hidden = false; document.body.dataset.screen = 'app';
    showView('mission'); initMap();
    if (m[1] !== 'x') setChange(m[1]);
    selectPoint(new maplibregl.LngLat(+m[3], +m[2]));
  }
}
boot();
})();
