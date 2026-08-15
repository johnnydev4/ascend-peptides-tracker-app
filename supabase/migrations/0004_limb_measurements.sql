-- Ascend Tracker — per-side limb circumferences
--
-- The existing `arms` / `thighs` columns stay as the "both/average" figure so
-- older entries keep their data; these add left and right separately for people
-- tracking asymmetry.

alter table public.body_measurements
  add column if not exists arm_left    numeric(5, 1) check (arm_left is null or arm_left > 0),
  add column if not exists arm_right   numeric(5, 1) check (arm_right is null or arm_right > 0),
  add column if not exists thigh_left  numeric(5, 1) check (thigh_left is null or thigh_left > 0),
  add column if not exists thigh_right numeric(5, 1) check (thigh_right is null or thigh_right > 0);
