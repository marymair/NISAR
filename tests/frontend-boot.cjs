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

const sources = [
  'i18n.js',
  'i18n-extra.js',
  'science-i18n.js',
  'i18n-it.js',
  'samples.js',
  'config.js',
  'app.js',
  'zori.js'
];

for (const source of sources) {
  try {
    win.eval(fs.readFileSync(path.join(root, 'frontend', source), 'utf8') + '\n//# sourceURL=' + source);
  } catch (err) {
    throw new Error('Script ' + source + ' threw during startup: ' + (err.stack || err));
  }
}
const doc = win.document;
const text = id => doc.querySelector(id)?.textContent?.trim() || '';
assert.equal(errors.length, 0, errors.join('\n'));
assert.ok(text('.hero .lead').length > 40, 'Hero lead must have localized text');
assert.ok(text('#intro .logline').length > 10, 'Transmission log must be populated');
assert.equal(doc.querySelectorAll('#intro-cases .case-card').length, 3, 'All three NASA case cards must appear');
assert.equal(doc.querySelectorAll('#cases-grid .case-card').length, 3, 'Mission cases must appear');
assert.ok(doc.querySelector('#begin').onclick, 'Start mission must be wired');
assert.ok(doc.querySelector('#analyze').onclick, 'Analyze button must be wired');
assert.equal(doc.querySelector('#btn-base'), null, 'Only globe and flat map controls');
assert.ok(doc.querySelector('#lang-menu [data-lang="it"]'), 'Italian must be available');
assert.ok(text('#signal-text'), 'Signal of day must be populated');
assert.ok(text('#zori-text'), 'ZORI speech must be populated');

const italian = doc.querySelector('#lang-menu [data-lang="it"]');
italian.click();
assert.equal(doc.documentElement.lang, 'it', 'Italian switch must set page language');
assert.match(text('.hero h1'), /pianeta/i, 'Italian home copy must appear');
assert.ok(text('#intro-cases .case-card').length > 5, 'Italian cases must stay populated');

const russian = doc.querySelector('#lang-menu [data-lang="ru"]');
russian.click();
assert.equal(doc.documentElement.lang, 'ru');
assert.match(text('.hero h1'), /планету/i);
assert.equal(doc.querySelectorAll('#intro-cases .case-card').length, 3);

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
