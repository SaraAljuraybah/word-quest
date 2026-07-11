-- Word Quest campaign mode schema suggestion.
-- This creates stages and per-player progress without hardcoding credentials.

create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  stage_number integer not null unique check (stage_number > 0),
  word_id uuid not null references public.words(id) on delete restrict,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard', 'future')),
  reward_points integer not null default 100 check (reward_points >= 0),
  reward_xp integer not null default 50 check (reward_xp >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_stage integer not null default 1 check (current_stage > 0),
  highest_stage integer not null default 1 check (highest_stage > 0),
  last_completed_stage integer not null default 0 check (last_completed_stage >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists stages_stage_number_idx on public.stages(stage_number);
create index if not exists stages_word_id_idx on public.stages(word_id);
create index if not exists user_progress_user_id_idx on public.user_progress(user_id);

alter table public.stages enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Anyone can read stages" on public.stages;
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Anyone can read stages"
on public.stages for select
using (true);

create policy "Users can read their own progress"
on public.user_progress for select
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.user_progress for insert
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional seed: creates stages from existing active 5-letter words.
-- It does not overwrite existing stages.
insert into public.stages (stage_number, word_id, difficulty, reward_points, reward_xp)
select
  row_number() over (order by w.id)::integer as stage_number,
  w.id as word_id,
  case
    when row_number() over (order by w.id) <= 10 then 'easy'
    when row_number() over (order by w.id) <= 25 then 'medium'
    when row_number() over (order by w.id) <= 45 then 'hard'
    else 'future'
  end as difficulty,
  (100 + ((row_number() over (order by w.id)::integer - 1) * 10)) as reward_points,
  (50 + ((row_number() over (order by w.id)::integer - 1) * 5)) as reward_xp
from public.words w
where w.active = true and w.length = 5
on conflict (stage_number) do nothing;
