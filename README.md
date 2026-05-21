# Begin

> small rituals shape us.

A premium, minimalist microhabits tracker built with Next.js 15, Tailwind CSS, and Framer Motion. Built around the philosophy of quiet consistency over loud motivation.

## Highlights

- **Apple-grade glassmorphism** — subtle blur, soft depth, layered ambient orbs
- **Cinematic typography** — Fraunces (display) paired with Manrope (body)
- **Instagram-style desktop sidebar** + elegant mobile bottom nav
- **Full light + dark theme** with system detection — warm ivory ↔ rich graphite
- **No backend** — everything lives in `localStorage`, export/import as JSON
- **Buttery motion** — Framer Motion with spring physics and staggered reveals

## Screens

| Route             | Screen                                                        |
| ----------------- | ------------------------------------------------------------- |
| `/`               | Splash — breathing rings, daily quote, cinematic boot         |
| `/onboarding`     | Welcome → name input with spatial transitions                 |
| `/today`          | Core experience: progress ring, swipe-to-skip, collapsibles   |
| `/history`        | Three stacked wheel pickers + day's log                       |
| `/add`            | Create habit: name, day chips, level preview                  |
| `/profile`        | Cinematic profile card, fullscreen share view, settings       |
| `/help`           | FAQs, community links, manifesto                              |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 15** (App Router)
- **React 18** + **TypeScript**
- **Tailwind CSS 3** with custom design tokens (CSS variables for theming)
- **Framer Motion** for orchestrated animation
- **Lucide** for iconography

## Design system

All design tokens live as CSS variables in `src/app/globals.css`. Tweak the palette there — `--bg-base`, `--accent`, `--sage`, `--glass-bg`, etc.

The glass aesthetic is delivered through three utility classes:

- `.glass` — standard surface (24px blur, soft border)
- `.glass-elevated` — primary surfaces (40px blur, larger shadow)
- `.glass-subtle` — secondary chips and rows (12px blur)
- `.glossy` — adds the top-down sheen that gives buttons their "premium" feel

## Interactions

- **Tap circle** → complete
- **Swipe right** → skip for today
- **Swipe left** → reveal delete (on the Today screen)
- **Expandable sections** — completed and skipped collapse by default

## License

MIT
