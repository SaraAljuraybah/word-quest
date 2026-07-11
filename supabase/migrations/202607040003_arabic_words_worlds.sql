-- Arabic campaign vocabulary and world/stage schema.
-- Run after the previous rewards and campaign migrations.

alter table public.words
  add column if not exists normalized_word text,
  add column if not exists length integer,
  add column if not exists difficulty text not null default 'easy',
  add column if not exists category text not null default 'general',
  add column if not exists is_active boolean not null default true;

update public.words
set
  normalized_word = coalesce(normalized_word, word),
  length = coalesce(length, char_length(coalesce(normalized_word, word))),
  is_active = coalesce(is_active, true)
where normalized_word is null or length is null;

create unique index if not exists words_normalized_word_key
on public.words(normalized_word);

create index if not exists words_length_idx on public.words(length);
create index if not exists words_is_active_idx on public.words(is_active);
create index if not exists words_difficulty_idx on public.words(difficulty);

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  world_number integer not null unique check (world_number > 0),
  name text not null,
  description text,
  theme text not null default 'classic',
  unlock_stage integer not null default 1 check (unlock_stage > 0),
  created_at timestamptz not null default now()
);

insert into public.worlds (world_number, name, description, theme, unlock_stage)
values
  (1, 'وادي الحروف', 'كلمات عربية قصيرة وسهلة لبداية الرحلة.', 'emerald', 1),
  (2, 'سوق الكلمات', 'كلمات أطول قليلا وتحديات أكثر تنوعا.', 'gold', 101),
  (3, 'قلعة المعاني', 'مراحل متوسطة بكلمات من خمسة وستة أحرف.', 'violet', 201),
  (4, 'أفق التحدي', 'كلمات أصعب للمراحل المتقدمة.', 'midnight', 301)
on conflict (world_number) do nothing;

alter table public.stages
  add column if not exists world_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stages_world_id_fkey'
  ) then
    alter table public.stages
      add constraint stages_world_id_fkey
      foreign key (world_id)
      references public.worlds(id)
      on delete restrict;
  end if;
end $$;

update public.stages s
set world_id = w.id
from public.worlds w
where s.world_id is null
  and w.world_number = floor((s.stage_number - 1) / 100) + 1;

create index if not exists stages_world_id_idx on public.stages(world_id);

alter table public.worlds enable row level security;

drop policy if exists "Anyone can read worlds" on public.worlds;

create policy "Anyone can read worlds"
on public.worlds for select
using (true);

-- Rebuild stages from active Arabic words if you want a deterministic campaign.
-- Comment this block out if you already curated stages manually.
insert into public.stages (stage_number, world_id, word_id, difficulty, reward_points, reward_xp)
select
  ranked.stage_number,
  worlds.id as world_id,
  ranked.word_id,
  ranked.difficulty,
  100 + ((ranked.stage_number - 1) * 10) as reward_points,
  50 + ((ranked.stage_number - 1) * 5) as reward_xp
from (
  select
    row_number() over (
      order by
        case
          when length in (3, 4) then 1
          when length = 5 then 2
          when length = 6 then 3
          else 4
        end,
        length,
        normalized_word
    )::integer as stage_number,
    id as word_id,
    case
      when length in (3, 4) then 'easy'
      when length in (5, 6) then 'medium'
      else 'hard'
    end as difficulty
  from public.words
  where is_active = true
    and length between 3 and 7
) ranked
join public.worlds
  on worlds.world_number = floor((ranked.stage_number - 1) / 100) + 1
on conflict (stage_number) do update set
  world_id = excluded.world_id,
  word_id = excluded.word_id,
  difficulty = excluded.difficulty,
  reward_points = excluded.reward_points,
  reward_xp = excluded.reward_xp;
