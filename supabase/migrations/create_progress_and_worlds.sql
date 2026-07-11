-- Required setup for Word Quest Arabic words, worlds, stages, and user progress.
-- Run this in Supabase SQL Editor before importing words or generating stages.

create table if not exists public.words (
  id bigint generated always as identity primary key,
  word text not null,
  normalized_word text unique not null,
  length int not null,
  difficulty text default 'easy',
  category text default 'عام',
  source text default 'arabic_open_dictionary',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.words
  add column if not exists normalized_word text,
  add column if not exists length int,
  add column if not exists difficulty text default 'easy',
  add column if not exists category text default 'عام',
  add column if not exists source text default 'arabic_open_dictionary',
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamp with time zone default now();

create unique index if not exists words_normalized_word_key on public.words(normalized_word);
create index if not exists words_length_idx on public.words(length);
create index if not exists words_is_active_idx on public.words(is_active);

create table if not exists public.worlds (
  id bigint generated always as identity primary key,
  world_number int unique not null,
  name text not null,
  description text,
  theme text,
  unlock_stage int default 1,
  created_at timestamp with time zone default now()
);

create table if not exists public.stages (
  id bigint generated always as identity primary key,
  stage_number int unique not null,
  world_id bigint references public.worlds(id) on delete cascade,
  word_id bigint references public.words(id) on delete cascade,
  stage_type text default 'word_guess',
  difficulty text default 'easy',
  reward_points int default 100,
  reward_xp int default 50,
  created_at timestamp with time zone default now()
);

alter table public.stages
  add column if not exists world_id bigint references public.worlds(id) on delete cascade,
  add column if not exists stage_type text default 'word_guess',
  add column if not exists difficulty text default 'easy',
  add column if not exists reward_points int default 100,
  add column if not exists reward_xp int default 50,
  add column if not exists created_at timestamp with time zone default now();

create table if not exists public.user_progress (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  current_stage int default 1,
  highest_stage int default 1,
  last_completed_stage int default 0,
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

alter table public.worlds enable row level security;
alter table public.stages enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Authenticated users can read worlds" on public.worlds;
drop policy if exists "Authenticated users can read stages" on public.stages;
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

create policy "Authenticated users can read worlds"
on public.worlds
for select
to authenticated
using (true);

create policy "Authenticated users can read stages"
on public.stages
for select
to authenticated
using (true);

create policy "Users can read their own progress"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into public.worlds (world_number, name, description, theme, unlock_stage)
values
  (1, 'عالم البداية', 'كلمات قصيرة وسهلة لتبدأ رحلتك', 'emerald', 1),
  (2, 'عالم التحدي', 'كلمات أكثر تنوعًا وصعوبة', 'gold', 101),
  (3, 'عالم الذكاء', 'اختبر ذاكرتك ومعرفتك بالكلمات', 'violet', 201)
on conflict (world_number) do update set
  name = excluded.name,
  description = excluded.description,
  theme = excluded.theme,
  unlock_stage = excluded.unlock_stage;
