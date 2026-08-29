-- Ascend Tracker — syringe stock inventory
-- A single per-user record tracking how many syringes are on hand, their type,
-- an optional note, and a low-stock reminder threshold. One row per user so the
-- count syncs across the user's devices. Protected with Row Level Security like
-- every other user-owned table.

create table public.syringe_inventory (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  count                integer not null default 0 check (count >= 0),
  syringe_type         text not null default '',
  note                 text not null default '',
  low_stock_threshold  integer not null default 5
    check (low_stock_threshold >= 1 and low_stock_threshold <= 100),
  reminder_enabled     boolean not null default false,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.syringe_inventory enable row level security;

create policy "syringe_inventory_select_own" on public.syringe_inventory
  for select using (auth.uid() = user_id);
create policy "syringe_inventory_insert_own" on public.syringe_inventory
  for insert with check (auth.uid() = user_id);
create policy "syringe_inventory_update_own" on public.syringe_inventory
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "syringe_inventory_delete_own" on public.syringe_inventory
  for delete using (auth.uid() = user_id);

create trigger syringe_inventory_set_updated_at
  before update on public.syringe_inventory
  for each row execute function public.set_updated_at();
