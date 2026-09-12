-- Ascend Tracker — vial expiry status + reconstitution history
--
-- 1) A treatment whose vial has passed its expiry date is marked 'expired'
--    (swept client-side). Extend the treatments status check to allow it.
-- 2) Every time a vial is re-mixed, a snapshot is stored so the treatment keeps
--    a history of its reconstitutions.

-- Extend the treatment status check to allow 'expired'. The original inline
-- check constraint is named treatments_status_check; drop-if-exists keeps this
-- idempotent.
alter table public.treatments drop constraint if exists treatments_status_check;
alter table public.treatments
  add constraint treatments_status_check
  check (status in ('active', 'paused', 'completed', 'archived', 'expired'));

-- ---------------------------------------------------------------------------
-- treatment_reconstitutions
-- One row per time the user re-mixed a vial for a treatment. The treatment's
-- own columns always hold the *current* vial; these rows are the audit trail.
-- ---------------------------------------------------------------------------
create table if not exists public.treatment_reconstitutions (
  id                uuid primary key default gen_random_uuid(),
  treatment_id      uuid not null references public.treatments (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,
  vial_quantity     numeric(10, 3) check (vial_quantity is null or vial_quantity > 0),
  vial_unit         text not null default 'mg',
  bac_water_ml      numeric(8, 3) check (bac_water_ml is null or bac_water_ml > 0),
  syringe_type      text check (syringe_type is null or syringe_type in ('U-100', 'U-40', 'U-500')),
  reconstituted_at  date,
  vial_expires_at   date,
  note              text,
  created_at        timestamptz not null default now()
);

create index if not exists treatment_reconstitutions_treatment_idx
  on public.treatment_reconstitutions (treatment_id, created_at desc);
create index if not exists treatment_reconstitutions_user_idx
  on public.treatment_reconstitutions (user_id);

alter table public.treatment_reconstitutions enable row level security;

create policy "treatment_reconstitutions_select_own" on public.treatment_reconstitutions
  for select using (auth.uid() = user_id);
create policy "treatment_reconstitutions_insert_own" on public.treatment_reconstitutions
  for insert with check (auth.uid() = user_id);
create policy "treatment_reconstitutions_update_own" on public.treatment_reconstitutions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "treatment_reconstitutions_delete_own" on public.treatment_reconstitutions
  for delete using (auth.uid() = user_id);
