# Developer Portfolio — Design

**Date:** 2026-11-18
**Repo:** `dmarquez-dev.github.io` (GitHub user Pages site, served at `https://dmarquez-dev.github.io`)

## Intent

A recruiter-facing portfolio for job hunting. A recruiter landing on it should, within ~30 seconds,
know who the developer is, what they build, and how to make contact — then be able to click into
concrete proof (the projects and their source). Tone: clean, modern, clear, concise.

## Goals

- Lead with identity and contact: name, role, one-line pitch, GitHub / LinkedIn / email / résumé.
- Showcase three projects now (Dungeon Master, Orcastrate, DM Auth), with two more arriving over
  the next few months. Adding a project must be a copy-one-block edit.
- Be honest about project status: no download or live-demo buttons until those exist; a status
  badge says what's coming instead.
- Load instantly, work at phone width, read well in light and dark.

## Non-goals

- Blog, CMS, contact form, analytics, multi-page site.
- A build step or framework.

## Anti-goals (failure even if it works)

- Looks like a stock template.
- Dead or placeholder buttons ("Download" that goes nowhere).
- Walls of text a recruiter has to dig through.

## Approaches considered

1. **Hand-written HTML + CSS, no build** — *chosen.* One `index.html` + `styles.css`, served by
   Pages as-is. Fastest load, nothing to maintain, and the source itself is a clean work sample.
   Five projects is well within what a hand-maintained page handles.
2. **Astro static site deployed by GitHub Actions** — projects as data files. Worth it at 10+
   projects or with a blog; for 3–5 projects it's added moving parts.
3. **Jekyll theme** — fastest start, but reads as a template, which works against the brief.

Chosen by Claude after the user deferred to the recommendation, knowing two more projects are coming.

## Page structure (single page)

```
┌──────────────────────────────────────────────┐
│ D. Marquez                      [theme ◐]     │
│ Software Engineer — .NET · TypeScript         │
│ One-line pitch.                               │
│ [GitHub] [LinkedIn] [Email] [Résumé]          │
├──────────────────────────────────────────────┤
│ Projects                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│ │ (screenshot)│ │             │ │           │ │
│ │ Name  ●badge│ │ ...         │ │ ...       │ │
│ │ One-liner   │ │             │ │           │ │
│ │ • highlight │ │             │ │           │ │
│ │ [tags]      │ │             │ │           │ │
│ │ Source →    │ │             │ │           │ │
│ └─────────────┘ └─────────────┘ └───────────┘ │
├──────────────────────────────────────────────┤
│ About · Skills (grouped)                      │
├──────────────────────────────────────────────┤
│ Footer: contact links · © year                │
└──────────────────────────────────────────────┘
```

- **Hero:** name, role, one-line pitch, contact buttons. Résumé button only if a PDF is supplied.
- **Project card:** optional screenshot, name, status badge, one-line summary, 2–3 highlight
  bullets, tech tags, links. Link slots for *Source* (always), *Download* and *Live demo* (added
  only when real). Responsive grid that looks right with 1–5 cards (1 column on phones).
- **About & Skills:** a short paragraph plus skills grouped (e.g. Languages, Backend, Frontend,
  Desktop, Practices).
- **Footer:** repeat contact links.

## Project content (initial)

| Project | Summary | Highlights | Tags | Status |
|---|---|---|---|---|
| **Dungeon Master** | Cross-platform .NET 10 MAUI desktop app for designing tabletop-RPG dungeon maps — floors, areas, placeable objects and notes. | Clean Architecture with a strong lean toward CQRS, DDD domain model; 500+ commits with recorded architecture decisions; Windows primary, macCatalyst build-verified. | C#, .NET 10, .NET MAUI, Clean Architecture, CQRS, DDD | In active development — Windows build coming |
| **Orcastrate** | Native desktop dashboard for Claude Code: persistent named conversations as tabs, with each dispatched sub-agent as its own inspectable lane, plus GUI administration of Claude Code settings. | Drives the real `claude` CLI via the Claude Agent SDK; strict process isolation (renderer has no FS/IPC beyond a typed preload bridge); frozen interface contracts; SQLite event store. | TypeScript, Electron, React, SQLite, Claude Agent SDK, Vitest | In active development — desktop build coming |
| **DM Auth** | OAuth 2.0 + OpenID Connect authorization server enabling "Sign in with DM Auth" for external apps. | Authorization Code + mandatory PKCE (S256); RSA-signed JWT access/ID tokens, rotating refresh tokens; Clean Architecture with CQRS-lite (MediatR) and DDD. | C#, .NET 10, ASP.NET Core, OAuth 2.0, OIDC, EF Core, SQL Server, Azure Key Vault, React, Tailwind | Hosted demo planned |

Copy is the builder's to polish; facts above come from the repos and the user.

## Visual & technical decisions (Claude's calls)

- **Look:** neutral palette with a single accent colour; generous whitespace; one modern sans-serif
  (self-contained or Google Fonts). Distinctive but restrained — no template feel.
- **Motion (user requirement):** the site must not feel static. Wherever elements layer or overlap
  (e.g. a geometric overlay carrying the project name over a card's screenshot), they get soft
  animation — gentle hover/focus transitions, subtle shifts of the overlay, and a light fade/rise
  as cards scroll into view. Motion stays short and eased (~150–400 ms), never loops for attention,
  keeps emphasis on the projects, and is reduced to simple fades or removed under
  `prefers-reduced-motion`. CSS-first; a small IntersectionObserver for scroll reveals is fine,
  and content must be visible without JavaScript.
- **Theming:** follows the OS light/dark setting; small toggle overrides it. JavaScript is limited
  to the toggle and scroll reveals; the page works fully without it.
- **Accessibility:** semantic landmarks, WCAG AA contrast, visible keyboard focus,
  `prefers-reduced-motion` respected, alt text on screenshots.
- **Sharing/SEO:** `<title>`, meta description, Open Graph/Twitter tags, favicon, so the link
  previews well when pasted into LinkedIn or email.
- **Files:** `index.html`, `styles.css`, `main.js` (theme toggle + scroll reveals), `assets/` (screenshots, favicon, OG image,
  optional résumé PDF). Spec lives in `docs/`; a `_config.yml` excludes `docs/` from the
  published site.
- **Deploy:** public repo `dmarquez-dev.github.io`, Pages serving from `main` root. The user
  creates the GitHub repo (no `gh` CLI on this machine); Claude prepares and commits locally.
- **Verification:** view in a browser at desktop and phone widths, both themes; check every link.

## Needed from the user (before or during build)

1. Display name and role/title line; one-line pitch (or approve a draft).
2. Contact links to show: email (public?), LinkedIn URL, résumé PDF (optional).
3. Short about paragraph (or approve a draft) and location / remote preference, if wanted.
4. Screenshots for each project (optional but strongly recommended for recruiters).
5. Preferred accent colour, if any (otherwise Claude's call).

## Left to the builder

Exact copy wording, spacing scale, accent colour (absent a preference), icon choice, card
hover treatment, OG image design.
