# Urban Sports Clue · Read the Room

*"Read the room before you go."*

A clickable prototype for a UX/product case study. Before booking a fitness class, every class shows a short **"What to expect"** card with sensory and practical information: crowd, cleanliness, honest level, sound, light, trainer style, flow, facilities, what to bring and whether you can leave quietly.

**Urban Sports Clue** is a playful, fictional multi-studio class-booking app. The "clue" is that you know what a class is like before you go. **Read the Room** is the feature: the "What to expect" card on every class, inside the familiar flow (class list → class detail → book). It has its own logo and visual identity, and doesn't reuse any real app's logo, colours, fonts or screens. All studios, trainers and data are made up.

- Research behind every decision: [`docs/research.md`](docs/research.md). Code comments like `// Research: F-CROWD` point to it.
- Mock data: [`src/data/classes.ts`](src/data/classes.ts). Edit it freely; it has a typed `ClassInfo` model.

## Run it

Needs Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build (static site in `dist/`):

```bash
npm run build
npm run preview    # serves dist/ on http://localhost:4173
```

> On this Mac, Node is installed in `~/.local/node`. If `npm` isn't found, run
> `export PATH=~/.local/node/bin:$PATH` first (or add that line to `~/.zshrc`).

## Switch variants (A/B)

| URL | Effect |
| --- | --- |
| `/?variant=a` | Version A: "What to expect" card, same for everyone (default) |
| `/?variant=b` | Version B: card + "How's your energy today?" personalisation *(coming next)* |
| `/?variant=e` | **Version E: Energy Match (PRD v4 preview).** Energy check-in that re-sorts the list (Tired / Stressed → Burn it off or Calm down / Normal / Energetic, plus Skip), a reason line per class, the Quiet & dim chip, the six-section card with sources, and "Rate your class". Energy is kept for the session only. Versions A and B are unchanged. |
| `/?tester=1` | **Tester link:** clean session for a new participant, then the full loop with no test bar: book → "I went to this class" (prototype step) → rate the class → stamp. Combine with `&variant=a` or `&variant=b`. |
| `/?dev=1` | Shows a thin **test-mode bar** with an A/B toggle and a link to `/debug` |
| `/?dev=0` | Hides the test-mode bar again |

The variant and test mode are remembered in `localStorage`, so they survive navigation and reloads.

## Export event data

1. Open **`/debug`** (not linked in the app, except from the test-mode bar).
2. Before a participant starts, click **New participant session**, then tick the class types they already know. Bookings of other types count as "new class types".
3. After the session, click **Export results (JSON)**.

Logged events (each with `variant`, `timestamp`, `session`, and `classId` / `classType` where relevant):

`class_viewed`, `card_section_expanded`, `time_on_detail` (`ms` + `outcome`: book / not_for_me / left), `book_clicked`, `not_for_me_clicked`, and in Version B `energy_selected`, `preference_set`, `alternative_clicked`.

`/debug` also shows the success metrics per variant: booking rate after viewing a card, "not for me" rate, new class types booked, and median time to decide.

## Deploy

It's a static single-page app (no server needed). SPA fallbacks are included for each host:

- **GitHub Pages:** `.github/workflows/pages.yml` builds and publishes on every push to `main`. One-time setup: repo Settings → Pages → Source: **GitHub Actions**. The workflow sets the subfolder (`/<repo>/`) automatically, and `npm run build:pages` copies `index.html` to `404.html` so deep links work.

- **Vercel:** import the repo; framework preset "Vite". `vercel.json` rewrites all routes to `index.html`.
- **Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` handles routing.

## Accessibility

- WCAG AA contrast. Status is never colour-only (always icon + word).
- Large tap targets (48px or more), a skip link, real headings and lists, and expandable sections with `aria-expanded`.
- No flashing; motion is minimal and switched off with `prefers-reduced-motion`.

## Project structure

```
src/
  data/classes.ts         typed mock data (6 studios, 12 classes)
  lib/                    labels (plain-language scales), variant switch, event log
  components/ExpectCard   the "What to expect" card
  pages/                  ClassList, ClassDetail, Booked, Debug
docs/research.md          survey findings → design decisions
```
