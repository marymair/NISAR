/*
 * Real browser-DOM startup smoke test using jsdom, not just JavaScript syntax.
 * Prevents the catastrophic UI regression where $('selector').forEach
 * crashes boot before mission texts, NASA cases and action buttons render.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'frontend/index.html'), 'utf8');
const errors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', error => errors.push(String(error)));
virtualConsole.on('error', error => errors.push(String(error)));
const dom = new JSDOM(html, {
  url: 'https://zori.example.test/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  virtualConsole
});
const { window: win } = dom;
win.matchMedia ||= () => ({ matches: false, addListener() {}, removeListener() {} });
win.scrollTo = () => {};
// Old preferences must not override the English/dark first impression.
win.localStorage.setItem('zori.lang', 'it');
win.localStorage.setItem('zori.theme', 'light');

const sources = [
  'i18n.js',
  'i18n-extra.js',
  'science-i18n.js',
  'i18n-it.js',
  'samples.js',
  'case-data.js',
  'i18n-nl.js',
  'config.js',
  'app.js',
  'zori.js'
];

// jsdom's eval() creates a new lexical environment for each invocation,
// unlike browser script tags that share one global lexical environment.
// Joining the scripts preserves const I18N / SAMPLES visibility across files.
// Browser-only fixture for two saved results; never included in production assets.
const caseFixture = [
  "Object.assign(SAMPLES.find(s => s.id === 'mozambique'), {precomputed:true, before:'/assets/cases/mozambique-before.png', after:'/assets/cases/mozambique-after.png', difference:'/assets/cases/mozambique-difference.png', sources:[{date:'2026-01-05'},{date:'2026-01-17'}], stats:{median_delta_db:3.72,changed_pixel_fraction:.6156}});",
  "Object.assign(SAMPLES.find(s => s.id === 'venezuela'), {precomputed:true, image:'/assets/cases/venezuela-difference.png', coherence:'/assets/cases/venezuela-coherence.png', sources:[{date:'2026-06-30'}], stats:{relative_phase_iqr_rad:1.5}});"
].join('\n');
const compiledPage = sources
  .map(source => fs.readFileSync(path.join(root, 'frontend', source), 'utf8') +
    (source === 'case-data.js' ? caseFixture : ''))
  .join('\n;\n');
try {
  win.eval(compiledPage);
} catch (err) {
  throw new Error('ZORI startup threw: ' + (err.stack || err));
}
const doc = win.document;
const text = id => doc.querySelector(id)?.textContent?.trim() || '';
assert.equal(errors.length, 0, errors.join('\n'));
assert.equal(doc.documentElement.lang, 'en', 'English must be the startup language despite old browser preferences');
assert.equal(doc.documentElement.dataset.theme, 'dark', 'Dark mode must always be the initial theme');

assert.ok(text('.hero .lead').length > 40, 'Hero lead must have localized text');
assert.ok(text('#intro .logline').length > 10, 'Transmission log must be populated');
assert.equal(doc.querySelectorAll('#intro-cases .case-card').length, 2, 'Only two archived NASA science cases appear');
assert.equal(doc.querySelectorAll('#cases-grid .case-card').length, 2, 'Incomplete crops case stays hidden');
assert.equal(doc.querySelectorAll('#cases-grid .case-feature').length, 2, 'Both verified science cases appear');
assert.equal(doc.querySelectorAll('#cases-grid .compare-group').length, 2, 'GCOV and real GUNW science-layer comparisons both have sliders');
assert.equal(doc.querySelectorAll('#cases-grid .reading-guide').length, 2, 'Each real radar example must explain its own visual immediately below images');
assert.equal(doc.querySelectorAll('#cases-grid [data-open-lab]').length, 2, 'Each archived case links directly to the Science Lab');
assert.ok(doc.querySelector('#view-lab .lab-archive a[href^="https://search.asf.alaska.edu/"]'), 'NASA ASF Vertex belongs in Science Lab');
assert.ok(doc.querySelector('#intro .earth-scanner'), 'Hero has an Earth scan overlay');
assert.ok(doc.querySelector('#intro .mission-attribution'), 'Mission credits real NASA and ISRO owners');
assert.match(doc.querySelector('#cases-grid').textContent, /Coherence|Когерентность/, 'GUNW comparison uses correct labels, not fake Before/After');
assert.doesNotMatch(doc.querySelector('#cases-grid').textContent, /Maize Triangle|Кукурузный треугольник/, 'Unprepared South Africa case is hidden');
assert.match(doc.querySelector('#cases-grid').textContent, /Cause|Причина|Cause and interpretation/);
assert.equal(doc.querySelectorAll('#cases-grid img[src^="https://"]').length, 0, 'No foreign photographs can appear in case panels');
assert.ok(doc.querySelector('#begin').onclick, 'Start mission must be wired');
assert.ok(doc.querySelector('#analyze').onclick, 'Analyze button must be wired');
assert.equal(doc.querySelector('#btn-base'), null, 'Only globe and flat map controls');
assert.ok(doc.querySelector('#lang-menu [data-lang="it"]'), 'Italian must be available');
assert.ok(text('#signal-text'), 'Signal of day must be populated');
assert.ok(text('#zori-text'), 'ZORI speech must be populated');

const dutch = doc.querySelector('#lang-menu [data-lang="nl"]');
assert.ok(dutch, 'Dutch must appear in the language menu');
dutch.click();
assert.equal(doc.documentElement.lang, 'nl', 'Switching to Dutch must change the page language');
assert.match(text('.hero h1'), /planeet ontdekt/i, 'Dutch hero title renders');
assert.match(text('.hero .mission-attribution'), /NASA en ISRO/, 'Dutch NASA–ISRO attribution renders');
assert.match(doc.querySelector('#cases-grid .reading-guide > summary').textContent, /Hoe lees je deze beelden/, 'Dutch radar reading guide renders');
assert.match(text('#cases-grid .case-summary h2'), /Venezuela|Mozambique/, 'Dutch case names render');
assert.ok(doc.querySelector('#lang-menu [data-lang="nl"][aria-checked="true"]'), 'Dutch language selection is visibly active');
assert.equal(doc.querySelectorAll('#cases-grid .compare-group').length, 2, 'Dutch translation must preserve both genuine radar sliders');

const italian = doc.querySelector('#lang-menu [data-lang="it"]');
italian.click();
assert.equal(doc.documentElement.lang, 'it', 'Italian switch must set page language');
assert.match(text('.hero h1'), /pianeta/i, 'Italian home copy must appear');
assert.ok(text('#intro-cases .case-card').length > 5, 'Italian cases must stay populated');

const russian = doc.querySelector('#lang-menu [data-lang="ru"]');
russian.click();
assert.equal(doc.documentElement.lang, 'ru');
assert.match(text('.hero h1'), /планету/i);
assert.match(text('.hero .transmit'), /СРОЧНОЕ СООБЩЕНИЕ/, 'Russian emergency signal must render');
assert.match(text('.hero .mission-attribution'), /NASA и ISRO/, 'Russian hero must attribute NISAR properly');
assert.match(doc.querySelector('#cases-grid .reading-guide > summary').textContent, /Как читать эти снимки/, 'Reading guide accessible in Russian');
assert.equal(doc.querySelectorAll('#intro-cases .case-card').length, 2);

doc.querySelector('#theme-toggle').click();
assert.equal(doc.documentElement.dataset.theme, 'light');

assert.equal(errors.length, 0, errors.join('\n'));

// Render the actual compareHTML function from app.js in a DOM and check that
// a user-visible range is present, with two stacked radar images and a handle.
const appText = fs.readFileSync(path.join(root, 'frontend/app.js'), 'utf8');
const matched = appText.match(/function compareHTML\(a, b, la, lb\) \{[\s\S]*?\n\}/);
assert.ok(matched, 'before/after renderer exists');
const makeCompare = new Function('esc', 't', 'return (' + matched[0] + ')')(
  str => String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;'),
  key => ({ 'r.slide': 'Slider' })[key] || key
);
const compEl = doc.createElement('section');
compEl.innerHTML = makeCompare('/before.png', '/after.png', 'Before', 'After');
doc.body.appendChild(compEl);
assert.equal(compEl.querySelectorAll('.compare img').length, 2, 'two co-registered images are present');
assert.ok(compEl.querySelector('.c-handle .c-grip'), 'visible divider grabber is present');
assert.equal(compEl.querySelectorAll('input[type=range]').length, 2, 'in-image slider and visible external slider exist');
assert.ok(compEl.querySelector('.compare-slider-row .compare-range'), 'native accessible range is visible below images');
assert.match(compEl.textContent, /Before[\s\S]*After/);
console.log('PASS: boot, languages, cases, theme, ZORI, and comparison slider');
win.close();
