# Data CATS Site

The Davidson College Data CATS consultant roster, filterable directory, team calendar, and appointment booking site.

## Stack

- **[Astro](https://astro.build)** for static-site generation, content collections for consultant data.
- **[Svelte 5](https://svelte.dev)** islands for interactivity (filtering, calendar, booking modal).
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling.
- **[FullCalendar](https://fullcalendar.io)** for the weekly/monthly team and per-consultant calendars.
- **Zoom Scheduler** (embedded iframe) for booking appointments — no custom backend required.
- Data lives in the repo as markdown + JSON (see below), not a database — the roster is small (8-10 people) and changes rarely, so a git-reviewable content collection is simpler to maintain than a hosted API.

## Project structure

```text
src/
├── content/consultants/*.md   # one file per consultant (frontmatter = structured data, body = bio)
├── content.config.ts          # zod schema for consultant frontmatter, incl. major/minor rules
├── data/availability.json     # sample office-hours / appointment blocks per consultant
├── components/                # Svelte islands: ConsultantGrid, TeamCalendar, ScheduleModal, ConsultantSchedule
├── layouts/Layout.astro       # shared page shell/nav
├── lib/consultant.ts          # shared helpers (major/minor label formatting)
└── pages/
    ├── index.astro            # consultant grid + filters
    ├── calendar.astro         # team calendar + filters
    └── consultants/[slug].astro  # consultant detail page + booking calendar
```

## Editing the roster

Add or edit a consultant by adding/editing a file in `src/content/consultants/`. Each file is markdown with frontmatter:

- `majors` (0-2) — declared majors. If empty, use `intendedMajors` instead (for students without a declared major).
- `minor` — optional; only valid when the consultant has exactly **one** declared or intended major.
- `headshot` — path to an image in `src/assets/headshots/` (swap the placeholder SVGs for real photos).
- `zoomSchedulerUrl` — only set for consultants who take bookable appointments.
- The markdown body becomes the consultant's bio on their detail page.

These rules are enforced by the zod schema in `src/content.config.ts` — `npm run build` will fail with a clear error if a consultant file violates them.

Availability (office hours / appointment blocks) is sample data in `src/data/availability.json`, keyed by consultant slug (the markdown filename). Replace this with real availability data, or wire it up to a live calendar feed, when that's ready.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`      | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`   |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |

## Deployment

`.github/workflows/deploy.yml` builds the site and deploys `dist/` to GitHub Pages on every push to `main`. One-time setup: in the repo's Settings → Pages, set "Source" to "GitHub Actions" — no secrets required.

The site is served from `https://davidsoncollege-datacats.github.io/DataCATS-site/` (a subpath, not the domain root), so `astro.config.mjs` sets `site`/`base` accordingly, and internal links use the `withBase()` helper (`src/lib/url.ts`) instead of hardcoded `/`-rooted paths so they resolve correctly under that subpath.

This is meant as a placeholder — swap it for the Azure Static Web Apps workflow (see git history) once that resource exists.
