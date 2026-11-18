# dmarquez-dev.github.io

Personal portfolio, served by GitHub Pages at <https://dmarquez-dev.github.io>.
Plain HTML, CSS and a little JavaScript. There is no build step: what's in the repo is what's served.

| File | What it holds |
| --- | --- |
| `index.html` | All page content |
| `styles.css` | Colours (light and dark), layout, motion |
| `main.js` | Theme toggle and scroll reveal. The page works without it. |
| `assets/` | Favicon, link-preview image, project screenshots, self-hosted font (`fonts/`, SIL OFL) |
| `docs/og-image.html` | Source for `assets/og-image.png` (screenshot it at 1200×630) |

## Add a project

1. In `index.html`, copy one `<article class="project ...">` block inside `.project-grid` and edit its content.
   Every card needs a name, a status badge, a summary and a source link; `npm test` checks this.
2. Give it a colour: add a `project--<name>` modifier and set `--hue` (panel, must keep white text at 4.5:1)
   and `--line` (motif) for it in `styles.css`, next to `.project--dungeon`.
3. Swap the inline SVG pattern for one that suits the project, or add a screenshot inside `.project__media`,
   after the name panel (`.project__overlay`), so screen readers hear the project name before the image:
   `<img src="assets/screens/<name>.webp" alt="..." width="1280" height="800" loading="lazy">`.
   A screenshot replaces the pattern (the CSS hides the SVG) and shrinks the name panel to a compact strip;
   you can delete the SVG once the screenshot is in.
4. Only add a **Download** or **Live demo** link to `.project__links` once it really exists.

## Check it

```sh
npm test                          # structural checks, no dependencies
python -m http.server 4173        # then open http://127.0.0.1:4173
```
