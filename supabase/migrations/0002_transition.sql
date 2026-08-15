-- Ascend Tracker — "Transición" body-measurement tracking
-- Body weight, composition, circumference measurements and progress photos.
-- Protected with Row Level Security, like every other user-owned table.

create table public.body_measurements (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  measured_at  date not null,

  -- Weight & body composition
  weight       numeric(6, 2) check (weight is null or weight > 0),
  weight_unit  text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  body_fat     numeric(5, 2) check (body_fat is null or (body_fat >= 0 and body_fat <= 100)), -- %
  muscle_mass  numeric(6, 2) check (muscle_mass is null or muscle_mass > 0), -- in weight_unit

  -- Circumference measurements
  length_unit  text not null default 'cm' check (length_unit in ('cm', 'in')),
  neck         numeric(5, 1) check (neck is null or neck > 0),
  chest        numeric(5, 1) check (chest is null or chest > 0),
  waist        numeric(5, 1) check (waist is null or waist > 0),
  hips         numeric(5, 1) check (hips is null or hips > 0),
  arms         numeric(5, 1) check (arms is null or arms > 0),
  thighs       numeric(5, 1) check (thighs is null or thighs > 0),

  notes        text,
  -- Progress photos, stored as (compressed) data URLs directly on the row.
  photos       text[] not null default '{}',

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index body_measurements_user_id_idx
  on public.body_measurements (user_id, measured_at desc);

alter table public.body_measurements enable row level security;

create policy "body_measurements_select_own" on public.body_measurements
  for select using (auth.uid() = user_id);
create policy "body_measurements_insert_own" on public.body_measurements
  for insert with check (auth.uid() = user_id);
create policy "body_measurements_update_own" on public.body_measurements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body_measurements_delete_own" on public.body_measurements
  for delete using (auth.uid() = user_id);

create trigger body_measurements_set_updated_at
  before update on public.body_measurements
  for each row execute function public.set_updated_at();
