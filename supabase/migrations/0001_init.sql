-- Peptide Tracker — initial schema
-- All user-owned tables are protected with Row Level Security.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- treatments
-- ---------------------------------------------------------------------------
create table public.treatments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  vial_quantity  numeric(10, 3) check (vial_quantity is null or vial_quantity > 0),
  vial_unit      text not null default 'mg',
  start_date     date not null,
  end_date       date,
  duration_weeks integer check (duration_weeks is null or duration_weeks > 0),
  frequency      text not null default 'daily'
                 check (frequency in ('daily', 'every_n_days', 'weekly_days')),
  interval_days  integer check (interval_days is null or interval_days > 0),
  scheduled_days integer[] default null, -- 0 = Sunday … 6 = Saturday (used when frequency = 'weekly_days')
  scheduled_time time not null default '08:00',
  dose_amount    numeric(10, 4) not null check (dose_amount > 0),
  dose_unit      text not null default 'mg',
  notes          text,
  status         text not null default 'active'
                 check (status in ('active', 'paused', 'completed', 'archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint treatments_dates_valid check (end_date is null or end_date >= start_date)
);

create index treatments_user_id_idx on public.treatments (user_id);

alter table public.treatments enable row level security;

create policy "treatments_select_own" on public.treatments
  for select using (auth.uid() = user_id);
create policy "treatments_insert_own" on public.treatments
  for insert with check (auth.uid() = user_id);
create policy "treatments_update_own" on public.treatments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "treatments_delete_own" on public.treatments
  for delete using (auth.uid() = user_id);

create trigger treatments_set_updated_at
  before update on public.treatments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- injection_sites
-- ---------------------------------------------------------------------------
create table public.injection_sites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  body_region text not null,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (user_id, body_region)
);

create index injection_sites_user_id_idx on public.injection_sites (user_id);

alter table public.injection_sites enable row level security;

create policy "injection_sites_select_own" on public.injection_sites
  for select using (auth.uid() = user_id);
create policy "injection_sites_insert_own" on public.injection_sites
  for insert with check (auth.uid() = user_id);
create policy "injection_sites_update_own" on public.injection_sites
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "injection_sites_delete_own" on public.injection_sites
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- doses
-- Each row is one scheduled (and possibly completed) dose event. The calendar
-- is generated from treatment parameters into this table, so scheduled and
-- recorded data live in one place and never drift apart.
-- ---------------------------------------------------------------------------
create table public.doses (
  id                uuid primary key default gen_random_uuid(),
  treatment_id      uuid not null references public.treatments (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,
  scheduled_at      timestamptz not null,
  administered_at   timestamptz,
  dose_amount       numeric(10, 4) check (dose_amount is null or dose_amount > 0),
  dose_unit         text,
  injection_site_id uuid references public.injection_sites (id) on delete set null,
  status            text not null default 'scheduled'
                    check (status in ('scheduled', 'completed', 'missed', 'skipped')),
  notes             text,
  created_at        timestamptz not null default now()
);

create index doses_user_id_idx on public.doses (user_id);
create index doses_treatment_id_idx on public.doses (treatment_id);
create index doses_scheduled_at_idx on public.doses (user_id, scheduled_at);

alter table public.doses enable row level security;

create policy "doses_select_own" on public.doses
  for select using (auth.uid() = user_id);
create policy "doses_insert_own" on public.doses
  for insert with check (auth.uid() = user_id);
create policy "doses_update_own" on public.doses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "doses_delete_own" on public.doses
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- injection_site_usage
-- ---------------------------------------------------------------------------
create table public.injection_site_usage (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  dose_id           uuid references public.doses (id) on delete cascade,
  injection_site_id uuid not null references public.injection_sites (id) on delete cascade,
  used_at           timestamptz not null default now()
);

create index injection_site_usage_user_id_idx on public.injection_site_usage (user_id);
create index injection_site_usage_site_idx on public.injection_site_usage (injection_site_id, used_at desc);

alter table public.injection_site_usage enable row level security;

create policy "injection_site_usage_select_own" on public.injection_site_usage
  for select using (auth.uid() = user_id);
create policy "injection_site_usage_insert_own" on public.injection_site_usage
  for insert with check (auth.uid() = user_id);
create policy "injection_site_usage_update_own" on public.injection_site_usage
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "injection_site_usage_delete_own" on public.injection_site_usage
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- side_effects
-- ---------------------------------------------------------------------------
create table public.side_effects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  treatment_id uuid references public.treatments (id) on delete set null,
  dose_id      uuid references public.doses (id) on delete set null,
  name         text not null,
  severity     text not null check (severity in ('mild', 'moderate', 'severe')),
  started_at   timestamptz not null,
  ended_at     timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  constraint side_effects_duration_valid check (ended_at is null or ended_at >= started_at)
);

create index side_effects_user_id_idx on public.side_effects (user_id, started_at desc);

alter table public.side_effects enable row level security;

create policy "side_effects_select_own" on public.side_effects
  for select using (auth.uid() = user_id);
create policy "side_effects_insert_own" on public.side_effects
  for insert with check (auth.uid() = user_id);
create policy "side_effects_update_own" on public.side_effects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "side_effects_delete_own" on public.side_effects
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- calculator_history
-- ---------------------------------------------------------------------------
create table public.calculator_history (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  vial_quantity         numeric(10, 3) not null check (vial_quantity > 0),
  vial_unit             text not null default 'mg',
  desired_concentration numeric(10, 4) not null check (desired_concentration > 0),
  concentration_unit    text not null default 'mg/mL',
  calculated_volume     numeric(10, 3) not null check (calculated_volume > 0),
  volume_unit           text not null default 'mL',
  created_at            timestamptz not null default now()
);

create index calculator_history_user_id_idx on public.calculator_history (user_id, created_at desc);

alter table public.calculator_history enable row level security;

create policy "calculator_history_select_own" on public.calculator_history
  for select using (auth.uid() = user_id);
create policy "calculator_history_insert_own" on public.calculator_history
  for insert with check (auth.uid() = user_id);
create policy "calculator_history_delete_own" on public.calculator_history
  for delete using (auth.uid() = user_id);
