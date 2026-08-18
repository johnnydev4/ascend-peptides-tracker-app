# Ascend Tracker

**A calm, private Progressive Web App for organizing an existing peptide
treatment protocol** — dose scheduling, injection-site rotation, side-effect
records, reconstitution math, body-transition tracking, and progress charts.

### 🔴 [**Live demo → ascend-tracker-demo.vercel.app**](https://ascend-tracker-demo.vercel.app)

**No sign-up, no backend.** The live demo opens straight into a fully seeded
sample protocol (a Retatrutide treatment already in week 4) running entirely in
your browser via `localStorage`. Click around freely — every feature works, and
**Settings → Reset demo data** starts it over. Want to use it for real? Run your
own instance with a Supabase backend (see [Getting started](#getting-started)).

> Ascend Tracker is a **tracking and organization tool**, not medical advice.
> Severe or concerning symptoms should be discussed with a qualified
> healthcare professional. Peptide reference figures shown in the app are
> anecdotal, user-reported values, not dosing recommendations.

---

## Try it instantly (demo mode, no Supabase)

You can explore the entire app with **zero setup**:

```bash
npm install
npm run dev
```

Open http://localhost:3000, click **Iniciar sesión / Sign in** (credentials are
pre-filled), and you're in with a sample treatment already three weeks along.

Demo mode turns on automatically whenever real Supabase credentials are absent.
It runs a mock auth session and stores a seeded dataset in your browser's
`localStorage` — nothing leaves the machine, no account or server is involved.
Every feature works (treatments, doses, site rotation, side effects, the
calculator, body-transition tracking, charts). Use **Settings → Reset demo
data** to start fresh. The moment you add real keys to `.env.local` (see below),
the app switches to the live Supabase backend and demo mode disappears.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** — warm, minimalist "cream/beige" design system
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **React Hook Form + Zod v4** — forms and validation
- **Lucide** icons, **date-fns** dates, dependency-free SVG charts
- **PWA** — manifest, service worker, offline shell, installable
- **i18n** — Spanish (default) and English, switchable in Settings

## Features

- **Dashboard** — next dose with countdown, treatment progress, injection-site
  map, upcoming doses, recent side effects, quick stats.
- **Treatments** — create/edit/pause/delete protocols with a searchable
  **catalog of 50 popular peptides** (autocomplete + a reference panel of
  typical function, dose, and frequency). The full dose calendar is generated
  automatically from the schedule you configure (daily, every N days, or
  specific weekdays).
- **Calendar** — interactive month view; complete, skip, reschedule, or
  annotate any individual dose. Vial-expiry days are flagged.
- **Doses** — what's due now and what's coming this week; overdue scheduled
  doses are swept to *missed* after a grace window. Doses show the draw volume
  in **insulin-syringe units**.
- **Injection sites** — visual front/back body map, per-site usage counts and
  last-used dates, least-recently-used rotation suggestions, enable/disable
  areas.
- **Side effects** — quick, editable records with severity, duration, notes, and
  a timeline showing effects in relation to completed doses.
- **Calculator** — reconstitution math in **four modes**: by *concentration*, by
  *syringe units* (solve BAC water from "X mcg = N units"), by *vial weight*
  (weigh before/after), and by *water volume*. Supports U-100 / U-40 / U-500
  syringes, unit handling, validation against impossible values, per-dose draw
  volumes, and saved history.
- **Transición (body tracking)** — log weight and per-limb measurements
  (arms/thighs, left & right) plus progress photos (compressed and stored
  privately, no external storage bucket).
- **Estadísticas (charts)** — line and bar charts of weight, measurements, and
  adherence over time.
- **History** — every dose ever recorded, filterable by treatment, status,
  injection site, and date range.
- **Settings** — profile name, language, notification/weigh-in/vial-expiry
  reminder preferences, sign out.

## Getting started

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **each migration in order** from
   [`supabase/migrations/`](supabase/migrations):
   - `0001_init.sql` — tables, indexes, triggers, and **RLS policies** (each
     user can only ever read/write their own rows).
   - `0002_transition.sql` — body measurements + photos.
   - `0003_reconstitution.sql` — BAC water, syringe type, reconstitution &
     vial-expiry dates.
   - `0004_limb_measurements.sql` — per-limb (left/right arm & thigh) columns.
3. (Optional) In **Authentication → Providers → Email**, decide whether to
   require email confirmation. Both flows are supported.

Alternatively, with the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in from **Project Settings → API**:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The `anon` public key |

Only these two `NEXT_PUBLIC_*` values are used in the browser; they are safe to
expose because RLS protects every table. **Never** put the service-role key in a
`NEXT_PUBLIC_*` variable or ship it to the client.

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, and add your first treatment.

### 4. (Optional) Seed demo data

After signing up your first user, run
[`supabase/seed.sql`](supabase/seed.sql) in the Supabase SQL editor. It creates
a demo 12-week daily treatment (3 weeks in), rotated injection sites, side
effects, and calculator history for the **first user in the project**.

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. **Import** the repo in [Vercel](https://vercel.com/new) — the Next.js preset
   needs no extra build configuration (`npm run build`).
3. Add the two environment variables from `.env.example` in
   **Project → Settings → Environment Variables** (Production + Preview).
4. Deploy. In Supabase, add your Vercel domain to
   **Authentication → URL Configuration → Site URL / Redirect URLs** (include
   `https://your-app.vercel.app/auth/callback` and
   `https://your-app.vercel.app/reset-password`) so email links land on the
   deployed app.

> Tip: set `NEXT_PUBLIC_DEMO_MODE=true` on a preview deployment to publish a
> fully interactive, backend-free demo (seeded `localStorage` data, mock auth).

The service worker (`public/sw.js`) registers only in production builds; the app
is installable from the browser menu ("Install app" / "Add to Home Screen").

## Architecture

```
src/
├── app/
│   ├── (auth)/           # login, signup, forgot/reset password
│   ├── (app)/            # protected app: dashboard, treatments, calendar,
│   │                     # doses, record, injection-sites, side-effects,
│   │                     # calculator, history, transition, stats,
│   │                     # settings, more
│   ├── auth/callback/    # Supabase code exchange
│   ├── offline/          # PWA offline fallback
│   └── manifest.ts       # PWA web manifest
├── components/
│   ├── ui/               # Button, Card, Field, Dialog, Badge, ProgressBar,
│   │                     # StatCard, DateTimePicker, LineChart, BarChart…
│   ├── features/         # TreatmentForm, RecordDoseDialog, EditDoseDialog,
│   │                     # InjectionSiteMap, SideEffectDialog, DoseCard,
│   │                     # MeasurementDialog, PeptideReference…
│   ├── layout/           # Sidebar (desktop), BottomNav (mobile), Logo
│   └── pwa/              # SW registration, reminder schedulers
├── hooks/                # useAsyncData, useUser
├── lib/
│   ├── supabase/         # browser / server / middleware clients
│   ├── demo/             # demo-mode config, mock client, seed data
│   ├── data/             # typed data access (treatments, doses, sites,
│   │                     # side-effects, measurements, calculator)
│   ├── validation/       # Zod schemas (auth, treatment, dose, calculator…)
│   ├── calculations/     # reconstitution + syringe-unit math
│   ├── calendar/         # schedule generation from treatment parameters
│   ├── notifications/    # reminder preferences (device-local)
│   ├── peptides.ts       # 50-peptide reference catalog
│   ├── images/           # client-side photo resize/compression
│   └── injection-sites/  # default site catalogue + rotation rules
├── proxy.ts              # session refresh + route protection (Next 16)
supabase/
├── migrations/           # 0001_init → 0004_limb_measurements (schema + RLS)
└── seed.sql              # demo data for development
```

### Design decisions worth knowing

- **One `doses` table** is the single source of truth for both the generated
  schedule and recorded administrations, so calendar and history can never
  drift apart. Editing a treatment regenerates all non-completed doses (keeping
  only `status='completed'`), so correcting a start date clears stale "missed"
  entries.
- **Schedule generation happens client-side** at treatment create/edit and is
  bulk-inserted; completed history is never rewritten. Future doses can't be
  marked completed (`isDoseCompletable()` gates to today + tomorrow).
- **Rotation suggestions** are least-recently-used among enabled sites, with a
  rest window surfaced in the UI (`lib/injection-sites/defaults.ts`).
- **Progress photos** are compressed to JPEG data URLs client-side and stored
  in-row (`photos text[]`) — no Supabase Storage bucket, nothing shared.
- **Notifications, weigh-in and vial-expiry reminders are device-local**
  (Notifications API) and fire while the app is open; preferences live in
  `localStorage`. Background push would require a push server and is
  intentionally out of scope.
- **The service worker never caches Supabase traffic** — the offline experience
  is an app-shell fallback, and no queued writes are ever replayed over newer
  server data.

## Security

- RLS on every user-owned table (`auth.uid() = user_id` for
  select/insert/update/delete).
- Session handling via `@supabase/ssr` cookies, refreshed in `src/proxy.ts`;
  protected routes redirect unauthenticated users to `/login`.
- Zod validation on every form; database `check` constraints as a second layer
  (positive amounts, valid statuses/severities, date ordering).
- No server-only secrets in the client bundle; no service-role key anywhere in
  the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons from the logo |
