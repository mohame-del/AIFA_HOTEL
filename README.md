# AIFA Hotel — Operations Prototype

A frontend-only hotel management prototype for the fictional **AIFA Hotel**
(“Where Luxury Meets Comfort”). It demonstrates two staff experiences
(receptionist and supervisor) and a multilingual guest self-service kiosk,
all backed by an in-memory data store.

> **This is a demonstration prototype.** It has no backend, no database and no
> real authentication. All rooms, reservations, guests and financial figures are
> fictional and generated in the browser. Data is held in memory and resets on
> page reload.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Routes](#routes)
- [Business rules](#business-rules)
- [Testing](#testing)
- [Production build](#production-build)
- [Deployment](#deployment)
- [Configuration and environment variables](#configuration-and-environment-variables)
- [Security notes](#security-notes)
- [Limitations](#limitations)
- [Possible future improvements](#possible-future-improvements)
- [Standalone HTML prototype](#standalone-html-prototype)

---

## Overview

AIFA Hotel is a dark, gold-accented single-page application built with
**TanStack Start** (React + TypeScript). It simulates the day-to-day tooling of
a hotel front desk and its management, plus a guest-facing kiosk:

- **Receptionist workspace** — room status, reservations, check-in/check-out
  and guest feedback.
- **Supervisor workspace** — everything above plus occupancy, demo revenue,
  ratings and alerts.
- **Guest kiosk** — share feedback or rate a stay in English, French or Arabic.

The application is intentionally **frontend-only**: business rules live in pure
functions and all state is kept in a single reducer, so the rules are small
enough to read, test and reason about.

## Features

### Staff sign-in (simulated)

- Landing page with two demo accounts: **Receptionist** (Lina Mekki) and
  **Supervisor** (Samir Benamar).
- Sign-in only sets a role in memory — there is no password, session or server.

### Reception workspace

- **Overview** — stat cards (total rooms, occupied, expected arrivals,
  maintenance), a compact room grid and an upcoming/in-house reservations list.
- **Rooms** — grid of all 90 rooms with search and status filter, plus a room
  drawer showing type, capacity, demo nightly rate and the current guest.
- **Reservations** — searchable, sortable table with create, view, check-in,
  check-out and cancel actions.
- **Guest Feedback** — filterable list (category, rating band, review status)
  with a detail panel and “mark reviewed” / “resolve” actions.
- **Settings** — switch the demo role and reset all demo data.

### Supervisor workspace

- Access to all reception pages, plus a **Supervisor Overview** with:
  - occupancy, in-house guests, average rating and demo revenue;
  - a selectable reporting period (today / last 7 days / last 30 days);
  - a 7-day occupancy trend bar chart and a room-status breakdown;
  - low-rating alerts, recent feedback and recent reservations.
- Revenue and the historical occupancy trend are clearly labelled demo data.

### Guest kiosk

- **Share feedback** — pick a category, write a message and optionally add a
  room number and name.
- **Check-out and rate your stay** — 1–5 star rating, optional improvement
  reasons for low ratings, and a free-text comment.
- **Multilingual** — English, French and Arabic dictionaries with full
  right-to-left layout for Arabic.

### Cross-cutting

- Responsive layout with a collapsible sidebar and mobile drawer.
- Global search in the staff shell (jumps to a room by number or searches
  reservations by name/reference).
- Toast notifications, accessible dialogs/drawers, and an app-wide error
  boundary with a friendly fallback page.
- Automatic two-word reference numbers for new reservations (e.g. `AIF-2401`).

## Tech stack

| Area                 | Choice                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Framework            | [TanStack Start](https://tanstack.com/start) (SSR-capable React framework) |
| Routing              | [TanStack Router](https://tanstack.com/router) (file-based routing)        |
| Language             | TypeScript (strict)                                                        |
| UI runtime           | React 19                                                                   |
| Styling              | Tailwind CSS v4 (CSS-first `@theme`) + `tw-animate-css`                    |
| Components           | [shadcn/ui](https://ui.shadcn.com) (new-york style) on Radix UI primitives |
| Icons                | lucide-react                                                               |
| Notifications        | sonner                                                                     |
| Build tool           | Vite 8 with the Lovable TanStack Start config                              |
| Server target        | [Nitro](https://nitro.build) (Vercel preset; see Deployment)               |
| Tests                | Vitest + Testing Library (jsdom)                                           |
| Linting / formatting | ESLint (flat config) + Prettier                                            |

## Architecture

The project separates **business rules** from the **UI**:

1. `src/lib/hotel/` is the domain core. It is plain TypeScript with no React
   dependencies, and holds the types, the seeded data, date helpers and the
   pure reducer/validators.
2. `src/lib/hotel/store.tsx` exposes that reducer to React through a
   `HotelProvider` context and a `useHotel()` hook.
3. `src/routes/` maps URLs to pages using TanStack Router's file-based routing,
   while `src/routes/__root.tsx` provides the shared shell (providers, theme,
   metadata, error/not-found pages).
4. `src/components/aifa/` contains the feature UI (shell, room grid,
   reservations table, feedback view, guest kiosk, supervisor overview, dialogs).
5. `src/components/ui/` contains only the shadcn/ui primitives the app actually
   uses (`button`, `label`, `dialog`, `sheet`, `alert-dialog`, plus the `sonner`
   toaster). Extra primitives can be re-added on demand with the shadcn CLI.

All state transitions flow through a single `reducer(state, action)` function in
`src/lib/hotel/logic.ts`, which keeps status rules verifiable and independent of
the components.

```text
User action ─▶ React component ─▶ dispatch(action)
                                       │
                                       ▼
                              reducer(state, action)   (pure, src/lib/hotel/logic.ts)
                                       │
                                       ▼
                       new HotelState ─▶ React re-render
```

## Project structure

```text
.
├── public/                      # Static assets served as-is (logo, favicon, robots.txt)
├── src/
│   ├── assets/                  # Bundled images (logo imported by components)
│   ├── components/
│   │   ├── aifa/                # Feature UI (shell, grids, tables, kiosk, dialogs)
│   │   └── ui/                  # shadcn/ui primitives (only those in use)
│   ├── lib/
│   │   ├── hotel/               # Domain core
│   │   │   ├── types.ts         # Domain types (Room, Reservation, Feedback, …)
│   │   │   ├── seed.ts          # Deterministic demo data (90 rooms, bookings, feedback)
│   │   │   ├── logic.ts         # Reducer, validation and selectors (pure)
│   │   │   ├── logic.test.ts    # Unit tests for the rules
│   │   │   ├── dates.ts         # Date helpers (ISO formatting, nights, overlaps)
│   │   │   ├── i18n.ts          # English/French/Arabic guest dictionaries
│   │   │   └── store.tsx        # React context wrapper around the reducer
│   │   ├── error-capture.ts     # Out-of-band error capture for SSR
│   │   ├── error-page.ts        # Static SSR fallback error page
│   │   ├── lovable-error-reporting.ts
│   │   └── utils.ts             # `cn()` class-name helper
│   ├── routes/                  # File-based routes (see Routes table)
│   ├── test/                    # Vitest setup and routing test
│   ├── router.tsx               # Router factory
│   ├── routeTree.gen.ts         # Auto-generated route tree (do not edit)
│   ├── server.ts                # SSR entry wrapper
│   ├── start.ts                 # TanStack Start middleware (errors + CSRF)
│   └── styles.css               # Tailwind v4 theme and design tokens
├── aifa-html-prototype/         # Standalone offline HTML replica (see below)
├── AGENTS.md                    # Project conventions
├── components.json              # shadcn/ui configuration
├── eslint.config.js             # ESLint flat config
├── vite.config.ts               # Vite/TanStack Start config (Nitro preset: vercel)
├── vitest.config.ts             # Vitest config
├── vercel.json                  # Vercel framework preset (tanstack-start)
└── tsconfig.json                # TypeScript config
```

`src/routeTree.gen.ts` is generated by the TanStack Router plugin during
development and build. It is committed so tests and builds work without first
starting the dev server, but it should **not** be edited by hand.

## Getting started

### Requirements

- **Bun** is the package manager (see `bun.lock` / `bunfig.toml`). npm works too
  if you do not have Bun installed, but Bun is what CI and Vercel use.
- **Node.js 20+** if you build with npm rather than Bun (developed and validated
  on Node.js 22).

### Install and run

```sh
# 1. Install dependencies
bun install        # or: npm install

# 2. Start the dev server (Vite + TanStack Start)
bun run dev        # or: npm run dev

# 3. Open the printed local URL (typically http://localhost:5173)
```

The home page (`/`) is the staff sign-in screen; from there you can open the
guest kiosk at `/guest`.

## Scripts

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `bun run dev`         | Start the development server with hot reload.     |
| `bun run build`       | Create a production build in `.vercel/output/`.   |
| `bun run build:dev`   | Production build in development mode.             |
| `bun run preview`     | Preview a production build locally.               |
| `bun run lint`        | Run ESLint over the project.                      |
| `bun run format`      | Format the codebase with Prettier.                |
| `bun run test`        | Run the Vitest suite once.                        |
| `bun run test:watch`  | Run Vitest in watch mode.                         |

`npm run <script>` works as well if you prefer npm.

## Routes

Routing is file-based: each file under `src/routes/` defines a route.

| Path                  | File                     | Purpose                                          |
| --------------------- | ------------------------ | ------------------------------------------------ |
| `/`                   | `index.tsx`              | Staff sign-in / account selection.               |
| `/guest`              | `guest.tsx`              | Multilingual guest kiosk.                        |
| `/staff`              | `staff.tsx`              | Staff layout (redirects to `/` when signed out). |
| `/staff/`             | `staff.index.tsx`        | Reception overview (stats, room grid, arrivals). |
| `/staff/rooms`        | `staff.rooms.tsx`        | All 90 rooms with live status.                   |
| `/staff/reservations` | `staff.reservations.tsx` | Reservations table (supports `?q=` search).      |
| `/staff/feedback`     | `staff.feedback.tsx`     | Guest feedback inbox.                            |
| `/staff/supervisor`   | `staff.supervisor.tsx`   | Supervisor-only analytics overview.              |
| `/staff/settings`     | `staff.settings.tsx`     | Demo role switching and data reset.              |

## Business rules

The rules live in `src/lib/hotel/logic.ts` as pure functions and are covered by
unit tests.

- **Rooms** — 90 rooms across five categories (Deluxe King, Superior Twin,
  Junior Suite, Executive Suite, Royal Suite), each with a capacity and a demo
  nightly rate in DZD. Room statuses are `available`, `reserved`, `occupied`
  and `maintenance`.
- **Reservation validation** (`validateReservation`) rejects:
  - an empty guest name;
  - an unknown room number;
  - missing dates, a check-in in the past, or fewer than one night;
  - a party larger than the room capacity;
  - a same-day booking on a room that is out of service;
  - overlapping dates on a room that already has an _active_ reservation
    (`Confirmed`, `Expected Arrival` or `Checked In`).
- **Overlap detection** uses half-open date intervals (`check-in < other
check-out` and `other check-in < check-out`), so a guest checking out on the
  same day another arrives is not treated as a conflict.
- **Status transitions**:
  - creating a reservation for today → `Expected Arrival` (and the room becomes
    `reserved`); a future reservation → `Confirmed`;
  - check-in → reservation `Checked In` and room `occupied`;
  - check-out → reservation `Checked Out` and room `available`;
  - cancel → reservation `Cancelled` (blocked once a guest is checked in or out).
- **New references** continue the `AIF-####` sequence from the seeded data.

## Testing

Tests use **Vitest** with **Testing Library** and a **jsdom** environment.

```sh
npm run test        # single run
npm run test:watch  # watch mode
```

The suite currently covers:

- `src/lib/hotel/logic.test.ts` — seeded room counts, overlap rejection, and the
  check-in/check-out room-status transitions.
- `src/test/app-routing.test.tsx` — that `/` resolves to a real page rather than
  the not-found route.

## Production build

```sh
bun run build       # emits .vercel/output/ (server function + static client assets)
bun run preview     # serve the built output locally
```

The build is produced by Vite through `@lovable.dev/vite-tanstack-config`, which
wires up TanStack Start and Nitro. `vite.config.ts` hard-pins the Nitro preset to
`vercel`, so the build emits the [Vercel Build Output
API](https://vercel.com/docs/build-output-api/v3) layout: a single server
function under `.vercel/output/functions/__server.func/` plus static assets and
`.vercel/output/config.json`.

## Deployment

The repository is configured for **Vercel** with zero build configuration:

- `vercel.json` sets `"framework": "tanstack-start"` so Vercel applies the
  TanStack Start preset even if auto-detection is skipped.
- Nitro emits the Vercel Build Output API, so Vercel builds the app with
  `bun run build` and deploys the generated functions automatically.
- **bun** is the package manager (see `bun.lock` / `bunfig.toml`); Vercel detects
  it from the lockfile.

Import the Git repository at <https://vercel.com/new> and deploy — no build
command, output directory, or environment variables need to be set. The app
requires no secrets or environment variables.

## Configuration and environment variables

- **No environment variables are required.** The application reads no
  `import.meta.env` / `process.env` values and ships no `.env` file.
- No `.env.example` is provided because there is nothing to configure.
- Tooling configuration lives in `vite.config.ts`, `vitest.config.ts`,
  `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `components.json` and
  `vercel.json`.

## Security notes

- **No real authentication.** The sign-in screen only sets a role in memory; it
  is not a security boundary. Do not reuse this pattern for a real system.
- **No secrets are stored** in the repository. `.gitignore` excludes `.env*`
  files and Cloudflare `.dev.vars`, while still allowing a future
  `.env.example`.
- **All data is fictional** and generated client-side; nothing is transmitted or
  persisted.
- The SSR entry (`src/server.ts`) and middleware (`src/start.ts`) add a generic
  error page and CSRF protection for server functions.

## Limitations

- Frontend-only: no backend, no database, no persistence. Refreshing or
  resetting the demo restores the original seeded state.
- Authentication is simulated; roles are not enforced on the server.
- Revenue, occupancy history and nightly rates are illustrative demo figures,
  not real accounting data.
- The guest kiosk is a self-service demo; it does not integrate with any real
  check-out or billing system.

## Possible future improvements

These are **not implemented** — they are ideas only:

- Persist state (e.g. `localStorage` or a real API) so data survives a reload.
- Add end-to-end and component tests covering the staff dialogs and kiosk flows.
- Localise the staff interface (only the guest kiosk is multilingual today).
- Replace the mock occupancy trend and revenue with real, timeframe-aware
  metrics.
- Add pagination/virtualisation for the 90-room grid and long reservation lists.

## Standalone HTML prototype

`aifa-html-prototype/` contains a self-contained, offline HTML replica of the
main screens (`index.html` plus a logo/favicon), produced as a static
demonstration. It requires **no server, build step or Node.js** — open
`index.html` in a browser.

This replica is a simplified, static snapshot of the interface and differs from
the live application: its modal/drawer interactions and multilingual flows are
reduced for demonstration. The TanStack Start app in `src/` is the source of
truth.

---

Built as a demonstration prototype. No license is included.
