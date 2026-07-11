-- Setup required before running:
--   npm run words:approved
--
-- Run this once in the Supabase SQL Editor if the approved word importer
-- reports missing columns such as category/source/is_active.

create table if not exists public.words (
  id bigint generated always as identity primary key,
  word text not null,
  normalized_word text unique not null,
  length int not null,
  difficulty text default 'easy',
  category text default 'عام',
  source text default 'manual_approved',
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.words
  add column if not exists normalized_word text,
  add column if not exists length int,
  add column if not exists difficulty text default 'easy',
  add column if not exists category text default 'عام',
  add column if not exists source text default 'manual_approved',
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now();

update public.words
set
  normalized_word = coalesce(normalized_word, word),
  length = coalesce(length, char_length(coalesce(normalized_word, word))),
  difficulty = coalesce(difficulty, 'easy'),
  category = coalesce(category, 'عام'),
  source = coalesce(source, 'manual_approved'),
  is_active = coalesce(is_active, true)
where normalized_word is null
   or length is null
   or difficulty is null
   or category is null
   or source is null
   or is_active is null;

create unique index if not exists words_normalized_word_key
on public.words(normalized_word);

create index if not exists words_length_idx on public.words(length);
create index if not exists words_is_active_idx on public.words(is_active);
create index if not exists words_source_idx on public.words(source);

create table if not exists public.worlds (
  id bigint generated always as identity primary key,
  world_number int unique not null,
  name text not null,
  description text,
  theme text default 'classic',
  unlock_stage int default 1,
  created_at timestamptz default now()
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
  created_at timestamptz default now()
);

alter table public.stages
  add column if not exists world_id bigint references public.worlds(id) on delete cascade,
  add column if not exists word_id bigint references public.words(id) on delete cascade,
  add column if not exists stage_type text default 'word_guess',
  add column if not exists difficulty text default 'easy',
  add column if not exists reward_points int default 100,
  add column if not exists reward_xp int default 50,
  add column if not exists created_at timestamptz default now();

create index if not exists stages_stage_number_idx on public.stages(stage_number);
create index if not exists stages_world_id_idx on public.stages(world_id);
create index if not exists stages_word_id_idx on public.stages(word_id);

notify pgrst, 'reload schema';
