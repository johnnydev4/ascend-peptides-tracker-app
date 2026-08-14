# Peptide Tracker

A calm, private Progressive Web App for organizing an existing peptide
treatment protocol: dose scheduling, injection-site rotation, side-effect
records, reconstitution math, and progress tracking.

> Peptide Tracker is a **tracking and organization tool**, not medical advice.
> Severe or concerning symptoms should be discussed with a qualified
> healthcare professional.

## Try it instantly (demo mode, no Supabase)

You can explore the entire app with **zero setup**:

```bash
npm install
npm run dev
```

Open http://localhost:3000, click **Sign in** (credentials are pre-filled),
and you're in with a sample treatment already three weeks along.

Demo mode turns on automatically whenever real Supabase credentials are
absent. It runs a mock auth session and stores a seeded dataset in your
browser's `localStorage` — nothing leaves the machine, no account or server is
involved. Every feature works (creating treatments, recording doses, rotating
sites, logging side effects, the calculator). Use **Settings → Reset demo
data** to start fresh. The moment you add real keys to `.env.local`
(see below), the app switches to the live Supabase backend and demo mode
disappears.

## Stack

- **Next.js** (App Router) + React + TypeScript
- **Tailwind CSS v4** — warm, minimalist design system
- **Supabase** — PostgreSQL, Auth, Row Level Security
- **React Hook Form + Zod** — forms and validation
- **Lucide** icons, **date-fns** dates
- **PWA** — manifest, service worker, offline shell, installable

## Features

- **Dashboard** — next dose with countdown, treatment progress, injection-site
  map, upcoming doses, recent side effects, quick stats.
- **Treatments** — create/edit/pause/delete protocols; the full dose calendar
  is generated automatically from the schedule you configure (daily,
  every N days, or specific weekdays). Editing regenerates only future doses.
- **Calendar** — interactive month view; complete, skip, reschedule, or
  annotate any individual dose event.
- **Doses** — what's due now and what's coming this week; overdue scheduled
  doses are swept to *missed* after a 12-hour grace window.
- **Injection sites** — visual front/back body map, per-site usage counts and
  last-used dates, least-recently-used rotation suggestions, enable/disable
  areas.
- **Side effects** — quick records with severity, duration, notes, and a
  timeline showing effects in relation to completed doses.
- **Calculator** — BAC-water reconstitution math (`volume = vial ÷
  concentration`) with unit handling, validation against zero/negative/
  impossible values, per-dose draw volumes, and saved history.
- **History** — every dose ever recorded, filterable by treatment, status,
  injection site, and date range.
- **Settings** — profile name, notification preferences (timing, on/off),
  sign out.

## Getting started

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration:
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates every table, index, trigger, and **RLS policy** (each user can
   only ever read/write their own rows).
3. (Optional) In **Authentication → Providers → Email**, decide whether to
   require email confirmation. Both flows are supported by the app.

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

Only these two `NEXT_PUBLIC_*` values are used in the browser; they are safe
to expose because RLS protects every table. **Never** put the service-role
key in a `NEXT_PUBLIC_*` variable or ship it to the client.

### 3. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000, create an account, and add your first treatment.

### 4. (Optional) Seed demo data

After signing up your first user, run
[`supabase/seed.sql`](supabase/seed.sql) in the Supabase SQL editor. It
creates a demo 12-week daily treatment (3 weeks in), rotated injection sites,
side effects, and calculator history for the **first user in the project**.

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket.
2. **Import** the repo in [Vercel](https://vercel.com/new) — the Next.js
   preset needs no extra build configuration (`npm run build`).
3. Add the two environment variables from `.env.example` in
   **Project → Settings → Environment Variables** (Production + Preview).
4. Deploy. In Supabase, add your Vercel domain to
   **Authentication → URL Configuration → Site URL / Redirect URLs** (include
   `https://your-app.vercel.app/auth/callback` and
   `https://your-app.vercel.app/reset-password`) so email links land on the
   deployed app.

The service worker (`public/sw.js`) registers only in production builds; the
app is installable from the browser menu ("Install app" / "Add to Home
Screen").

## Architecture

```
src/
├── app/
│   ├── (auth)/           # login, signup, forgot/reset password
│   ├── (app)/            # protected app: dashboard, treatments, calendar,
│   │                     # doses, record, injection-sites, side-effects,
│   │                     # calculator, history, settings, more
│   ├── auth/callback/    # Supabase code exchange
│   ├── offline/          # PWA offline fallback
│   └── manifest.ts       # PWA web manifest
├── components/
│   ├── ui/               # Button, Card, Field, Dialog, Badge, ProgressBar,
│   │                     # StatCard, EmptyState, ConfirmDialog, Spinner…
│   ├── features/         # TreatmentForm, RecordDoseDialog, EditDoseDialog,
│   │                     # InjectionSiteMap, SideEffectDialog, DoseCard…
│   ├── layout/           # Sidebar (desktop), BottomNav (mobile), Logo
│   └── pwa/              # SW registration, dose reminder scheduler
├── hooks/                # useAsyncData, useUser
├── lib/
│   ├── supabase/         # browser / server / middleware clients
│   ├── data/             # typed data access (treatments, doses, sites…)
│   ├── validation/       # Zod schemas (auth, treatment, dose, calculator…)
│   ├── calculations/     # reconstitution math
│   ├── calendar/         # schedule generation from treatment parameters
│   ├── notifications/    # reminder preferences (device-local)
│   └── injection-sites/  # default site catalogue + rotation rules
├── proxy.ts              # session refresh + route protection
supabase/
├── migrations/0001_init.sql   # schema + RLS
└── seed.sql                   # demo data for development
```

### Design decisions worth knowing

- **One `doses` table** is the single source of truth for both the generated
  schedule and recorded administrations (the spec's `treatment_schedules`
  concept is folded into it), so calendar and history can never drift apart.
- **Schedule generation happens client-side** at treatment create/edit and is
  bulk-inserted; editing a treatment only regenerates *future, untouched*
  doses — completed history is never rewritten.
- **Rotation suggestions** are least-recently-used among enabled sites, with
  a 7-day "rest" window surfaced in the UI (`lib/injection-sites/defaults.ts`).
- **Notifications** are device-local (Notifications API) and fire while the
  app is open; preferences live in `localStorage`. Background push would
  require a push server and is intentionally out of scope.
- **The service worker never caches Supabase traffic** — the offline
  experience is an app-shell fallback, and no queued writes are ever replayed
  over newer server data.

## Security

- RLS on every user-owned table (`auth.uid() = user_id` for select/insert/
  update/delete).
- Session handling via `@supabase/ssr` cookies, refreshed in `src/proxy.ts`;
  protected routes redirect unauthenticated users to `/login`.
- Zod validation on every form; database `check` constraints as a second
  layer (positive amounts, valid statuses/severities, date ordering).
- No server-only secrets in the client bundle; no service-role key anywhere
  in the app.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons from the logo |
