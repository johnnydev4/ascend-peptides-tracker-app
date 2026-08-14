-- Peptide Tracker — development seed data
--
-- Usage: replace the UUID below with a real user id from auth.users
-- (create a user first via the app's sign-up form or the Supabase dashboard),
-- then run this file with `supabase db execute --file supabase/seed.sql`
-- or paste it into the SQL editor.

do $$
declare
  demo_user uuid;
  t_id uuid;
  site_abd_lu uuid;
  site_abd_ru uuid;
  site_abd_ll uuid;
  d record;
  i integer := 0;
begin
  -- Pick the first user in the project as the demo user.
  select id into demo_user from auth.users order by created_at limit 1;
  if demo_user is null then
    raise notice 'No users found — sign up first, then re-run the seed.';
    return;
  end if;

  -- Injection sites (default set)
  insert into public.injection_sites (user_id, name, body_region) values
    (demo_user, 'Abdomen — upper left',  'abdomen_upper_left'),
    (demo_user, 'Abdomen — upper right', 'abdomen_upper_right'),
    (demo_user, 'Abdomen — lower left',  'abdomen_lower_left'),
    (demo_user, 'Abdomen — lower right', 'abdomen_lower_right'),
    (demo_user, 'Thigh — left',          'thigh_left'),
    (demo_user, 'Thigh — right',         'thigh_right'),
    (demo_user, 'Glute — left',          'glute_left'),
    (demo_user, 'Glute — right',         'glute_right'),
    (demo_user, 'Upper arm — left',      'arm_left'),
    (demo_user, 'Upper arm — right',     'arm_right')
  on conflict (user_id, body_region) do nothing;

  select id into site_abd_lu from public.injection_sites where user_id = demo_user and body_region = 'abdomen_upper_left';
  select id into site_abd_ru from public.injection_sites where user_id = demo_user and body_region = 'abdomen_upper_right';
  select id into site_abd_ll from public.injection_sites where user_id = demo_user and body_region = 'abdomen_lower_left';

  -- Demo treatment: daily 0.5 mg for 12 weeks, started 3 weeks ago
  insert into public.treatments
    (user_id, name, vial_quantity, vial_unit, start_date, end_date, duration_weeks,
     frequency, scheduled_time, dose_amount, dose_unit, notes, status)
  values
    (demo_user, 'Retatrutide', 10, 'mg',
     current_date - interval '21 days',
     current_date + interval '63 days',
     12, 'daily', '20:00', 0.5, 'mg', 'Demo treatment seeded for development.', 'active')
  returning id into t_id;

  -- Generate the full daily schedule (84 doses)
  insert into public.doses (treatment_id, user_id, scheduled_at, dose_amount, dose_unit, status)
  select t_id, demo_user,
         (current_date - interval '21 days' + (n || ' days')::interval)::date + time '20:00',
         0.5, 'mg',
         'scheduled'
  from generate_series(0, 83) as n;

  -- Mark the past three weeks as mostly completed, rotating sites
  for d in
    select id, scheduled_at from public.doses
    where treatment_id = t_id and scheduled_at < now()
    order by scheduled_at
  loop
    i := i + 1;
    if i % 7 = 0 then
      update public.doses set status = 'missed' where id = d.id;
    else
      update public.doses
      set status = 'completed',
          administered_at = d.scheduled_at + interval '12 minutes',
          injection_site_id = case i % 3
            when 0 then site_abd_lu
            when 1 then site_abd_ru
            else site_abd_ll
          end
      where id = d.id;

      insert into public.injection_site_usage (user_id, dose_id, injection_site_id, used_at)
      values (demo_user, d.id,
              case i % 3 when 0 then site_abd_lu when 1 then site_abd_ru else site_abd_ll end,
              d.scheduled_at + interval '12 minutes');
    end if;
  end loop;

  -- Side effects
  insert into public.side_effects (user_id, treatment_id, name, severity, started_at, ended_at, notes) values
    (demo_user, t_id, 'Nausea',   'mild',     now() - interval '2 days', now() - interval '2 days' + interval '4 hours', 'Shortly after the evening dose.'),
    (demo_user, t_id, 'Headache', 'mild',     now() - interval '4 days', now() - interval '4 days' + interval '2 hours', null),
    (demo_user, t_id, 'Fatigue',  'moderate', now() - interval '6 days', now() - interval '5 days', 'Lasted most of the next day.');

  -- Calculator history
  insert into public.calculator_history
    (user_id, vial_quantity, vial_unit, desired_concentration, concentration_unit, calculated_volume, volume_unit)
  values
    (demo_user, 10, 'mg', 2, 'mg/mL', 5, 'mL'),
    (demo_user, 5,  'mg', 1, 'mg/mL', 5, 'mL');

  raise notice 'Seed complete for user %', demo_user;
end;
$$;
