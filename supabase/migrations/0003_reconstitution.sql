-- Ascend Tracker — reconstitution details & vial expiry on treatments
--
-- Lets a treatment record how its vial was mixed (BAC water added, syringe
-- used, date reconstituted) so the concentration and the dose in syringe units
-- can be shown alongside the protocol, and marks when the vial expires.

alter table public.treatments
  add column if not exists bac_water_ml    numeric(8, 3)
    check (bac_water_ml is null or bac_water_ml > 0),
  add column if not exists syringe_type    text
    check (syringe_type is null or syringe_type in ('U-100', 'U-40', 'U-500')),
  add column if not exists reconstituted_at date,
  add column if not exists vial_expires_at  date;

-- Vial-expiry lookups are always scoped to the signed-in user.
create index if not exists treatments_vial_expiry_idx
  on public.treatments (user_id, vial_expires_at)
  where vial_expires_at is not null;
