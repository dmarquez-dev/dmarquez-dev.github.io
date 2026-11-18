# Developer Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single-page, recruiter-facing portfolio at `https://dmarquez-dev.github.io` showcasing Dungeon Master, Orcastrate and DM Auth.

**Architecture:** Hand-written static site — `index.html`, `styles.css`, `main.js`, `assets/` — served by GitHub Pages from `main` root with no build. Structural invariants are pinned by a zero-dependency Node test (`node:test`, string/regex checks on the HTML/CSS/JS source); look, motion and responsiveness are verified in a real browser (Playwright MCP) at fixed widths in both themes.

**Tech Stack:** HTML5, modern CSS (custom properties, grid, `@media (prefers-color-scheme)`, `prefers-reduced-motion`), vanilla JS (IntersectionObserver), Node 22+ `node:test` for checks. No runtime dependencies, no npm packages.

**Spec:** `docs/superpowers/specs/2026-11-18-portfolio-design.md`

## Global Constraints

- No build step, no framework, no npm dependencies. `package.json` exists only for `npm test` and has no `dependencies`/`devDependencies`.
- Jekyll stays on (no `.nojekyll`); `_config.yml` has `exclude: [docs, tests, package.json, README.md]` so only the site is published.
- No `href="#"`, no Download/Live-demo link unless the artifact exists. Status is shown by a badge.
- Every project card is one self-contained `<article class="project">` block; adding a project = copying one block.
- Motion: transitions 150–400 ms, eased, no attention loops; under `prefers-reduced-motion: reduce` no transforms, opacity-only or none.
- Content fully visible without JavaScript: reveal's hidden start state applies only under `html.js`.
- WCAG AA contrast in both themes; visible `:focus-visible` styles; `alt` on every `<img>`.
- External links: `target="_blank" rel="noopener noreferrer"`.
- Phone width: no horizontal scroll at 360 px; 16 px side gutter.
- `localStorage` access wrapped in try/catch; page works if it throws.
- Fonts: Google Fonts only (or system stack); no other external hosts.

## Review Focus

1. **JS disabled / script fails** — every card and section must be visible; covered by test `reveal hidden state is gated on html.js` (Task 1) and a browser check with JS off (Task 4).
2. **Reduced-motion users** — overlays and reveals must not translate/scale; test `reduced-motion block removes transforms` (Task 2).
3. **Card without a screenshot** (likely for some projects at launch) — the geometric overlay must still look intentional, not like a broken image; browser check in Task 2 with one card lacking `<img>`.
4. **Narrow phones (360 px) with long names/many tags** (DM Auth has 10 tags) — tags wrap, no horizontal scroll; browser check in Task 2 measuring `document.documentElement.scrollWidth <= 360`.
5. **Grid at 4–5 cards** (two projects coming) — last row must not look orphaned; browser check in Task 2 temporarily duplicating cards to 4 and 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | All content and semantic structure; meta/OG tags. |
| `styles.css` | Design tokens (light/dark), layout, card + overlay visuals, motion. |
| `main.js` | Theme toggle (persisted), scroll reveal. Adds `js` class to `<html>`. |
| `assets/` | `favicon.svg`, `og-image.png`, `screens/<project>.png|webp`, optional `resume.pdf`. |
| `_config.yml` | Jekyll exclude list. |
| `package.json` | `"test": "node --test tests/"` only. |
| `tests/site.test.mjs` | Structural invariant checks. |
| `README.md` | How to add a project card; how to run tests. |

---

### Task 1: Repo, test harness, and page content (`index.html`)

**Files:**
- Create: `index.html`, `_config.yml`, `package.json`, `tests/site.test.mjs`, `README.md`, `.gitignore`

**Interfaces:**
- Produces (class/id names Tasks 2–3 style and script against):
  - `<html lang="en">` — `main.js` adds class `js`; `data-theme="light|dark"` attribute set by toggle.
  - `header.hero` containing `h1.hero__name`, `p.hero__role`, `p.hero__pitch`, `nav.hero__links` of `a.btn`.
  - `button#theme-toggle` with `aria-label="Toggle color theme"` and `aria-pressed`.
  - `section#projects` > `div.project-grid` > `article.project[data-reveal]`, each with:
    `div.project__media` (optional `img` + `div.project__overlay` containing `h3.project__name` and `span.badge`), `p.project__summary`, `ul.project__highlights`, `ul.tags > li`, `div.project__links > a.link`.
  - `section#about` with `p` + `dl.skills` (or grouped `ul`s).
  - `footer.site-footer`.
- Badge text values: Dungeon Master `In active development — Windows build coming`; Orcastrate `In active development — desktop build coming`; DM Auth `Hosted demo planned`.

- [ ] **Step 1: `git init` in `C:\Users\dmarq\Development\Repos\dmarquez-dev.github.io`, branch `main`; write `package.json`, `_config.yml`, `.gitignore` (`node_modules/`).**

- [ ] **Step 2: Write the failing tests in `tests/site.test.mjs`** (read files with `fs.readFileSync`, assert with `node:assert/strict`):
  - `has exactly three project cards` — `/<article class="project"/g` matches 3.
  - `each card links to its repo` — contains `https://github.com/dmarquez-dev/dungeon-master`, `/orcastrate`, `/dm-auth`.
  - `no dead links` — no `href="#"` and no `href=""`.
  - `external links are safe` — every `<a ... target="_blank"` also has `rel="noopener noreferrer"`.
  - `images have alt` — every `<img` has an `alt=` attribute.
  - `has sharing meta` — contains `<meta name="description"`, `property="og:title"`, `property="og:description"`, `property="og:image"`, `name="twitter:card"`, `<link rel="icon"`.
  - `only allowed external hosts` — every `src=`/`href=` starting `http` is on `github.com`, `linkedin.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, or `dmarquez-dev.github.io`.
  - `no placeholders remain` — no `TODO(user)` anywhere in `index.html`. *(Expected to stay failing until Task 4 fills user details.)*
  - `reveal hidden state is gated on html.js` — in `styles.css`, every rule selecting `[data-reveal]` with `opacity: 0` has a selector starting `.js `.
  - `reduced-motion block removes transforms` — `styles.css` contains `@media (prefers-reduced-motion: reduce)` whose block sets `transform: none`.
  - `storage access is guarded` — every `localStorage` occurrence in `main.js` is inside a `try` block (regex: count of `localStorage` equals count inside `try {…}` segments).

- [ ] **Step 3: Run `npm test`** — Expected: FAIL (files missing).

- [ ] **Step 4: Write `index.html`** with the structure above and the project content table from the spec (summary, 2–3 highlights, tags, badge, Source link). Hero/about/contact use draft copy marked `TODO(user)` where the user must supply facts (name, role, LinkedIn URL, email, résumé, about text, location). Load the Google Font with `preconnect`; link `styles.css` and `main.js` (`defer`). Load the `frontend-design` skill before writing markup copy and structure.

- [ ] **Step 5: Run `npm test`** — Expected: all HTML tests PASS except `no placeholders remain`; CSS/JS tests FAIL (files absent).

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: page structure and project content"`

---

### Task 2: Visual design and motion (`styles.css`)

**Files:**
- Create: `styles.css`

**Interfaces:**
- Consumes: class names from Task 1; `html.js`, `html[data-theme]`.
- Produces: `.is-visible` class (added by Task 3 to `[data-reveal]` elements) transitions them from `opacity:0; transform: translateY(12px)` to visible.

- [ ] **Step 1: Write tokens on `:root`** — background, surface, text, muted, border, accent, accent-contrast; redefined under `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` and again `:root[data-theme="dark"] {…}`. Explicit `body` background. One accent colour (builder's pick unless the user names one); verify AA contrast for text and badge.

- [ ] **Step 2: Layout** — max-width container (~1100 px) with 16 px gutter on phones; hero first; `.project-grid` uses `grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr))` so 1–5 cards fill rows; tags `flex-wrap: wrap`.

- [ ] **Step 3: Card + geometric overlay** — `.project__media` is an aspect-ratio box (16/10); screenshot `object-fit: cover`; `.project__overlay` is a layered geometric shape (clip-path/gradient panel) carrying name + badge. When no `img` is present, the media box shows a generated geometric pattern in the accent hue so it reads as intentional.

- [ ] **Step 4: Motion** — on card `:hover`/`:focus-within`: card lifts (`translateY(-4px)`, shadow deepens), screenshot scales ~1.03, overlay shape shifts/expands slightly; 150–400 ms, `cubic-bezier(.2,.7,.2,1)`. Buttons/links get colour + underline transitions. Reveal: `.js [data-reveal] { opacity:0; transform: translateY(12px) }` → `.js [data-reveal].is-visible { opacity:1; transform:none }`, staggered via `transition-delay: calc(var(--i, 0) * 80ms)`. `@media (prefers-reduced-motion: reduce)`: all `transform: none`, transitions limited to opacity ≤150 ms. `:focus-visible` outline in accent.

- [ ] **Step 5: Run `npm test`** — Expected: CSS tests PASS.

- [ ] **Step 6: Browser checks (Playwright MCP, open `index.html` via a local static server, e.g. `npx --yes http-server -p 4173` or `python -m http.server 4173`)**:
  - 1280×800 and 390×844, light and dark (`browser_emulate_media colorScheme`): screenshot each; no overlap/clipping.
  - 360 px wide: `document.documentElement.scrollWidth <= 360` → true.
  - Remove one card's `<img>` via `browser_evaluate`: media box shows the geometric fallback.
  - Duplicate cards to 4 then 5 via `browser_evaluate`: screenshot; rows look balanced.
  - Emulate `reducedMotion: 'reduce'`: hover a card, computed `transform` is `none`.

- [ ] **Step 7: Commit** — `git commit -am "feat: visual design, theming and motion"`

---

### Task 3: Behaviour (`main.js`)

**Files:**
- Create: `main.js`

**Interfaces:**
- Consumes: `#theme-toggle`, `[data-reveal]`, `.is-visible` from Tasks 1–2.
- Produces: `document.documentElement.classList.add('js')` first thing; `data-theme` on `<html>`; storage key `"theme"` with values `"light" | "dark"`.

- [ ] **Step 1: Theme** — on load read stored theme (try/catch) and set `data-theme` if present; toggle flips between light/dark relative to the current effective theme (stored value, else `matchMedia('(prefers-color-scheme: dark)')`), updates `aria-pressed`, writes storage in try/catch. To avoid a flash, put a tiny inline `<script>` in `<head>` that sets `js` class and stored `data-theme` before paint (the only inline script).

- [ ] **Step 2: Reveal** — `IntersectionObserver` (threshold 0.15) adds `.is-visible` once and unobserves; set `--i` per card index for stagger. If `IntersectionObserver` is missing, add `.is-visible` to all immediately.

- [ ] **Step 3: Run `npm test`** — Expected: all PASS except `no placeholders remain`.

- [ ] **Step 4: Browser checks** — toggle switches theme and survives reload; with `localStorage` stubbed to throw (`browser_evaluate` override before reload via `addInitScript`/`browser_run_code_unsafe`), page renders and toggle still works for the session; scroll reveals cards; console has no errors.

- [ ] **Step 5: Commit** — `git commit -am "feat: theme toggle and scroll reveal"`

---

### Task 4: User details, assets, final verification, publish prep

**Files:**
- Modify: `index.html` (replace every `TODO(user)`)
- Create: `assets/favicon.svg`, `assets/og-image.png` (1200×630), `assets/screens/*` (as supplied), optional `assets/resume.pdf`; `README.md` content

- [ ] **Step 1: Ask the user** for the items in the spec's "Needed from the user" list in one message; replace each `TODO(user)` with their answers. Omit the Résumé button if no PDF.

- [ ] **Step 2: Add assets** — SVG favicon (monogram in accent); OG image rendered from a simple HTML card via Playwright screenshot at 1200×630; screenshots compressed (≤300 KB each, `loading="lazy"`, explicit `width`/`height`).

- [ ] **Step 3: Run `npm test`** — Expected: ALL PASS including `no placeholders remain`.

- [ ] **Step 4: Final browser pass** — repeat Task 2 Step 6 checks; plus JS disabled (`javaScriptEnabled: false` context): all cards visible; every link returns non-404 (`curl -sI` each external URL).

- [ ] **Step 5: README** — how to add a project (copy one `<article class="project">`, add Download/Live-demo link only when real), how to run `npm test`.

- [ ] **Step 6: Commit** — `git commit -am "feat: personal details and assets"`

- [ ] **Step 7: Publish handoff** — tell the user to create the empty public repo `dmarquez-dev/dmarquez-dev.github.io` on GitHub; then (with their go-ahead) `git remote add origin https://github.com/dmarquez-dev/dmarquez-dev.github.io.git && git push -u origin main`; Settings → Pages → Deploy from branch `main` / root. Verify the live URL loads.
