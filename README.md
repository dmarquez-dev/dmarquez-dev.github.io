# dmarquez-dev.github.io

Personal portfolio, served by GitHub Pages at <https://dmarquez-dev.github.io>.
Plain HTML, CSS and a little JavaScript. There is no build step: what's in the repo is what's served.

| File | What it holds |
| --- | --- |
| `index.html` | All page content |
| `styles.css` | Colours (light and dark), layout, motion |
| `main.js` | Theme toggle and scroll reveal. The page works without it. |
| `assets/` | Favicon, link-preview image, project screenshots, résumé |

## Add a project

1. In `index.html`, copy one `<article class="project ...">` block inside `.project-grid` and edit its content.
2. Give it a colour: add a `project--<name>` modifier and set `--hue` (panel, must keep white text at 4.5:1)
   and `--line` (motif) for it in `styles.css`, next to `.project--dungeon`.
3. Swap the inline SVG pattern for one that suits the project, or add a screenshot as the first child of
   `.project__media`: `<img src="assets/screens/<name>.webp" alt="..." width="1280" height="800" loading="lazy">`.
4. Only add a **Download** or **Live demo** link to `.project__links` once it really exists.
5. Update the card count in `tests/site.test.mjs` (`has exactly three project cards`).

## Check it

```sh
npm test                          # structural checks, no dependencies
python -m http.server 4173        # then open http://127.0.0.1:4173
```
