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

const ALLOWED_HOSTS = [
  'github.com',
  'www.linkedin.com',
  'linkedin.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'dmarquez-dev.github.io',
];

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

test('has exactly three project cards', () => {
  const html = read('index.html');
  assert.equal((html.match(/<article class="project[ "]/g) || []).length, 3);
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

test('has sharing meta', () => {
  const html = read('index.html');
  for (const needle of [
    '<meta name="description"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'name="twitter:card"',
    '<link rel="icon"',
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

test('no placeholders remain', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /TODO\(user\)/);
});

test('inline head script guards storage', () => {
  assertStorageGuarded(read('index.html'), 'index.html');
});

// ---------- styles.css ----------

test('reveal hidden state is gated on html.js', () => {
  const css = read('styles.css');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const hiding = rules.filter(([, sel, body]) => sel.includes('[data-reveal]') && /opacity:\s*0(?![.\d])/.test(body));
  assert.ok(hiding.length > 0, 'expected a hidden start state for [data-reveal]');
  for (const [, sel] of hiding) {
    for (const part of sel.split(',')) {
      assert.match(part.trim(), /^\.js\s/, `selector "${part.trim()}" hides content without JS`);
    }
  }
});

test('reduced-motion block removes transforms', () => {
  const css = read('styles.css');
  const block = blockAfter(css, '@media (prefers-reduced-motion: reduce)');
  assert.ok(block, 'missing prefers-reduced-motion block');
  assert.match(block, /transform:\s*none/);
});

// ---------- main.js ----------

test('storage access is guarded', () => {
  assertStorageGuarded(read('main.js'), 'main.js');
});
