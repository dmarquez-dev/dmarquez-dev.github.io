// Structural invariants for the portfolio. Zero dependencies: node:test + string checks.
// Look, motion and layout are verified in a real browser; these pin what must never regress.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => {
  const path = join(root, file);
  assert.ok(existsSync(path), `${file} should exist`);
  return readFileSync(path, 'utf8');
};

const ALLOWED_HOSTS = ['github.com', 'dmarquez-dev.github.io'];

const REPOS = ['dungeon-master', 'orcastrate', 'dm-auth'];

/** Returns true when the character at `index` sits inside a `try { ... }` block. */
function isInsideTry(source, index) {
  let depth = 0;
  for (let i = index - 1; i >= 0; i--) {
    const ch = source[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        if (/try\s*$/.test(source.slice(0, i))) return true;
      } else depth--;
    }
  }
  return false;
}

function assertStorageGuarded(source, label) {
  let at = source.indexOf('localStorage');
  while (at !== -1) {
    assert.ok(isInsideTry(source, at), `${label}: localStorage at offset ${at} is not inside try { }`);
    at = source.indexOf('localStorage', at + 1);
  }
}

/** The body of the first block that opens right after `header`, braces balanced. */
function blockAfter(source, header) {
  const start = source.indexOf(header);
  if (start === -1) return null;
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i);
  }
  return null;
}

// ---------- index.html ----------

/** Each <article class="project ..."> block, in page order. */
const cards = (html) => html.match(/<article class="project[ "][\s\S]*?<\/article>/g) || [];

test('every project card is complete', () => {
  const list = cards(read('index.html'));
  assert.ok(list.length >= 1, 'expected at least one project card');
  for (const card of list) {
    const name = (card.match(/<h3 class="project__name">([^<]+)</) || [])[1] || '(unnamed)';
    for (const [part, re] of [
      ['name', /<h3 class="project__name">[^<]+</],
      ['status badge', /<span class="badge">[^<]+</],
      ['summary', /<p class="project__summary">[^<]+/],
      ['source link', /<a class="link" href="https:\/\/github\.com\/dmarquez-dev\/[^"]+"/],
    ]) assert.match(card, re, `${name}: missing ${part}`);
  }
});

test('each card links to its repo', () => {
  const html = read('index.html');
  for (const repo of REPOS) {
    assert.ok(html.includes(`https://github.com/dmarquez-dev/${repo}"`), `missing link to ${repo}`);
  }
});

test('no dead links', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /href="#"/);
  assert.doesNotMatch(html, /href=""/);
});

test('external links are safe', () => {
  const html = read('index.html');
  const anchors = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || [];
  for (const a of anchors) assert.match(a, /rel="noopener noreferrer"/, a);
});

test('images have alt', () => {
  const html = read('index.html');
  for (const img of html.match(/<img\b[^>]*>/g) || []) assert.match(img, /\salt="/, img);
});

test('decorative svgs are hidden from screen readers', () => {
  const html = read('index.html');
  assert.match(html, /<div class="hero__art" aria-hidden="true">/);
  for (const svg of html.match(/<svg\b[^>]*>/g) || []) {
    if (/class="motif/.test(svg)) continue; // inside the aria-hidden .hero__art
    assert.match(svg, /aria-hidden="true"/, svg);
  }
});

test('screenshot goes after the name panel so the name is read first', () => {
  for (const card of cards(read('index.html'))) {
    const img = card.indexOf('<img');
    if (img !== -1) assert.ok(img > card.indexOf('project__overlay'), 'img must follow .project__overlay');
  }
  assert.match(read('README.md'), /after the name panel/);
});

test('has sharing meta', () => {
  const html = read('index.html');
  for (const needle of [
    '<meta name="description"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'name="twitter:card"',
    '<link rel="icon"',
    '<link rel="canonical" href="https://dmarquez-dev.github.io/">',
    '<meta name="color-scheme" content="light dark">',
    'property="og:site_name"',
    'property="og:image:alt"',
    'property="og:image:width" content="1200"',
    'property="og:image:height" content="630"',
  ]) {
    assert.ok(html.includes(needle), `missing ${needle}`);
  }
});

test('only allowed external hosts', () => {
  const html = read('index.html');
  for (const [, url] of html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) {
    const host = new URL(url).hostname;
    assert.ok(ALLOWED_HOSTS.includes(host), `disallowed host ${host} in ${url}`);
  }
});

test('contact is email only, in hero and footer', () => {
  const html = read('index.html');
  for (const cls of ['hero__links', 'site-footer__links']) {
    const block = html.match(new RegExp(`<(div|p) class="${cls}"[^>]*>([\\s\\S]*?)</\\1>`));
    assert.ok(block, `missing .${cls}`);
    const hrefs = [...block[2].matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(hrefs, ['mailto:dmarquez.development@gmail.com'], `.${cls} links`);
  }
  assert.doesNotMatch(html, /<nav\b/, 'a single mailto link is not a navigation landmark');
});

test('font is self-hosted', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
  assert.match(html, /<link rel="preload" href="assets\/fonts\/schibsted-grotesk-latin\.woff2" as="font" type="font\/woff2" crossorigin>/);
  assert.match(read('styles.css'), /@font-face\s*\{[^}]*url\("assets\/fonts\/schibsted-grotesk-latin\.woff2"\)/);
  read('assets/fonts/schibsted-grotesk-latin.woff2');
  read('assets/fonts/OFL.txt');
});

test('no placeholders remain', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /TODO\(user\)/);
});

test('inline head script guards storage', () => {
  assertStorageGuarded(read('index.html'), 'index.html');
});

// ---------- styles.css ----------

test('reveal hidden state is gated on html.js', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const hiding = rules.filter(([, sel, body]) => sel.includes('[data-reveal]') && /opacity:\s*0(?![.\d])/.test(body));
  assert.ok(hiding.length > 0, 'expected a hidden start state for [data-reveal]');
  for (const [, sel] of hiding) {
    for (const part of sel.split(',')) {
      assert.match(part.trim(), /^\.js\s/, `selector "${part.trim()}" hides content without JS`);
    }
  }
});

test('reveal falls back to visible if main.js never runs', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(
    ([, sel, body]) => sel.includes('[data-reveal]') && sel.includes(':not(.is-visible)') && /animation:/.test(body),
  );
  assert.ok(rule, 'expected a delayed CSS animation that reveals [data-reveal] without main.js');
  const name = rule[2].match(/animation:\s*([\w-]+)/)[1];
  const keyframes = blockAfter(css, `@keyframes ${name}`);
  assert.ok(keyframes && /opacity:\s*1/.test(keyframes), `@keyframes ${name} should end at opacity: 1`);
  const reduced = blockAfter(css, '@media (prefers-reduced-motion: reduce)');
  assert.match(reduced, /\[data-reveal\][^{]*\{[^}]*opacity:\s*1/, 'reduced motion must not leave cards hidden');
});

test('reduced-motion block removes transforms', () => {
  const css = read('styles.css');
  const block = blockAfter(css, '@media (prefers-reduced-motion: reduce)');
  assert.ok(block, 'missing prefers-reduced-motion block');
  assert.match(block, /transform:\s*none/);
});

test('a screenshot replaces the pattern and compacts the overlay', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const hidesPattern = rules.some(([, sel, body]) => sel.includes(':has(> img)') && sel.includes('.project__pattern') && /display:\s*none/.test(body));
  const compacts = rules.some(([, sel, body]) => sel.includes(':has(> img)') && sel.includes('.project__overlay') && /max-width:/.test(body));
  assert.ok(hidesPattern, 'cards with an <img> must hide the SVG pattern');
  assert.ok(compacts, 'cards with an <img> must use a narrower overlay');
});

test('printing shows every card', () => {
  const css = read('styles.css');
  const block = blockAfter(css, '@media print');
  assert.ok(block, 'missing @media print block');
  assert.match(block, /\[data-reveal\][^{]*\{[^}]*opacity:\s*1\s*!important/);
});

test('theme toggle stays hidden until main.js runs', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /:not\(\.reveal-ready\)\s+\.theme-toggle\s*\{[^}]*visibility:\s*hidden/);
});

test('theme toggle names its state', () => {
  const html = read('index.html');
  const button = html.match(/<button id="theme-toggle"[^>]*>/);
  assert.ok(button, 'missing #theme-toggle');
  assert.match(button[0], /aria-label="Dark theme"/);
  assert.match(button[0], /aria-pressed="(true|false)"/);
  assert.match(button[0], /title="/);
});

test('layout uses the full width on large screens', () => {
  const css = read('styles.css');
  const max = Number((css.match(/--max:\s*(\d+)px/) || [])[1]);
  assert.ok(max >= 1920, `--max is ${max}px; a 1920px screen would get wide empty gutters`);
  assert.match(css, /--gutter:\s*clamp\(/, 'gutter should scale with the viewport');
});

test('motion durations stay within 400ms', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, ms] of css.matchAll(/(\d+)ms/g)) assert.ok(Number(ms) <= 400, `${ms}ms exceeds 400ms`);
});

test('overlay hover does not animate layout', () => {
  const css = read('styles.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const hover = rules.filter(([, sel]) => /:(hover|focus-within)/.test(sel) && sel.includes('.project__overlay'));
  assert.ok(hover.length > 0, 'expected an overlay hover state');
  for (const [, sel, body] of hover) assert.doesNotMatch(body, /padding|width|margin/, `${sel.trim()} animates layout`);
  const base = rules.find(([, sel]) => sel.trim() === '.project__overlay');
  assert.doesNotMatch(base[2], /transition:[^;]*padding/);
});

// ---------- main.js ----------

test('main.js sets every class the CSS waits for', () => {
  const js = read('main.js');
  const css = read('styles.css');
  for (const cls of ['reveal-ready', 'is-visible', 'is-settled']) {
    assert.ok(css.includes(`.${cls}`), `styles.css no longer uses .${cls}`);
    assert.ok(js.includes(`classList.add('${cls}')`), `main.js never adds .${cls}`);
  }
});

test('reveal stagger resets so hover is not delayed', () => {
  assert.ok(read('main.js').includes(`setProperty('--i', '0')`), 'main.js should clear --i after the reveal');
});

test('slow main.js does not re-hide cards the fallback already showed', () => {
  assert.match(read('main.js'), /performance\.now\(\)/, 'main.js should detect a late start');
});

test('storage access is guarded', () => {
  assertStorageGuarded(read('main.js'), 'main.js');
});
