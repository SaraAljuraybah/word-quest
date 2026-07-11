-- Game sessions schema repair for stage-based gameplay.
-- Run this in the Supabase SQL Editor if creating game sessions returns 400 errors.

create table if not exists public.game_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  stage_id bigint references public.stages(id) on delete set null,
  word_id bigint references public.words(id) on delete set null,
  attempts_used int default 0,
  status text default 'playing',
  points_earned int default 0,
  xp_earned int default 0,
  created_at timestamp with time zone default now(),
  finished_at timestamp with time zone
);

alter table public.game_sessions
  add column if not exists stage_id bigint references public.stages(id) on delete set null,
  add column if not exists word_id bigint references public.words(id) on delete set null,
  add column if not exists attempts_used int default 0,
  add column if not exists status text default 'playing',
  add column if not exists points_earned int default 0,
  add column if not exists xp_earned int default 0,
  add column if not exists created_at timestamp with time zone default now(),
  add column if not exists finished_at timestamp with time zone;

update public.game_sessions
set
  attempts_used = coalesce(attempts_used, 0),
  status = coalesce(status, 'playing'),
  points_earned = coalesce(points_earned, 0),
  xp_earned = coalesce(xp_earned, 0),
  created_at = coalesce(created_at, now())
where attempts_used is null
   or status is null
   or points_earned is null
   or xp_earned is null
   or created_at is null;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.game_sessions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.game_sessions drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.game_sessions
  add constraint game_sessions_status_check
  check (status in ('playing', 'won', 'lost'));

create index if not exists game_sessions_user_id_idx on public.game_sessions(user_id);
create index if not exists game_sessions_stage_id_idx on public.game_sessions(stage_id);
create index if not exists game_sessions_word_id_idx on public.game_sessions(word_id);

alter table public.game_sessions enable row level security;

drop policy if exists "Users can read their own game sessions" on public.game_sessions;
drop policy if exists "Users can insert their own game sessions" on public.game_sessions;
drop policy if exists "Users can update their own game sessions" on public.game_sessions;

create policy "Users can read their own game sessions"
on public.game_sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own game sessions"
on public.game_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own game sessions"
on public.game_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

notify pgrst, 'reload schema';
