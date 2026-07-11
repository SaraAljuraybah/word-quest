-- Word Quest rewards economy schema suggestion.
-- Review policies for your app before running in Supabase.

alter table public.profiles
  add column if not exists total_points integer not null default 0,
  add column if not exists total_xp integer not null default 0,
  add column if not exists level integer not null default 1,
  add column if not exists games_played integer not null default 0,
  add column if not exists wins integer not null default 0,
  add column if not exists current_streak integer not null default 0,
  add column if not exists best_streak integer not null default 0,
  add column if not exists last_daily_reward_at timestamptz;

create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_key)
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  cost integer not null check (cost >= 0),
  currency text not null default 'points',
  created_at timestamptz not null default now()
);

alter table public.user_inventory enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "Users can read their own inventory" on public.user_inventory;
drop policy if exists "Users can insert their own inventory" on public.user_inventory;
drop policy if exists "Users can update their own inventory" on public.user_inventory;
drop policy if exists "Users can read their own purchases" on public.purchases;
drop policy if exists "Users can insert their own purchases" on public.purchases;

create policy "Users can read their own inventory"
on public.user_inventory for select
using (auth.uid() = user_id);

create policy "Users can insert their own inventory"
on public.user_inventory for insert
with check (auth.uid() = user_id);

create policy "Users can update their own inventory"
on public.user_inventory for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own purchases"
on public.purchases for select
using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
on public.purchases for insert
with check (auth.uid() = user_id);
