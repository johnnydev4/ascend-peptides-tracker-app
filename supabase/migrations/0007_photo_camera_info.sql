-- Ascend Tracker — camera / technical info for progress photos
--
-- Stored once per measurement entry, since a progress-photo session normally
-- uses one consistent camera setup. All free-text so any format works
-- ("f/2.8", "1/125", "5600K", "1.5 m", "50 mm"); `flash` is yes/no/empty.

alter table public.body_measurements
  add column if not exists camera           text,
  add column if not exists lens             text,
  add column if not exists focal_length     text,
  add column if not exists subject_distance text,
  add column if not exists flash            text check (flash is null or flash in ('yes', 'no')),
  add column if not exists flash_power      text,
  add column if not exists aperture         text,
  add column if not exists diaphragm        text,
  add column if not exists shutter_speed    text,
  add column if not exists iso              text,
  add column if not exists white_balance    text,
  add column if not exists camera_elevation text;
