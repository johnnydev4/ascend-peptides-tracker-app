-- Ascend Tracker — pause a treatment until a date
--
-- Adds an optional "paused until" date to treatments and a new 'paused' dose
-- status. Doses that fall inside a pause window are marked 'paused' so they show
-- as paused (not missed) on the calendar and are skipped rather than recovered.

alter table public.treatments
  add column if not exists paused_until date;

-- Extend the dose status check to allow 'paused'. The original inline check
-- constraint is named doses_status_check; drop-if-exists keeps this idempotent.
alter table public.doses drop constraint if exists doses_status_check;
alter table public.doses
  add constraint doses_status_check
  check (status in ('scheduled', 'completed', 'missed', 'skipped', 'paused'));
