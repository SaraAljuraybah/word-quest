-- Leaderboard view for safe public rankings.
-- Run this in the Supabase SQL Editor before opening /leaderboard.

create or replace view public.leaderboard_view as
select
  row_number() over (
    order by
      coalesce(p.total_points, 0) desc,
      coalesce(up.highest_stage, 1) desc,
      coalesce(p.wins, 0) desc,
      coalesce(p.created_at, now()) asc
  )::bigint as rank,
  p.id as user_id,
  coalesce(nullif(trim(p.username), ''), 'لاعب مجهول') as username,
  coalesce(p.total_points, 0)::int as total_points,
  coalesce(p.level, 1)::int as level,
  coalesce(p.wins, 0)::int as wins,
  coalesce(p.games_played, 0)::int as games_played,
  coalesce(up.highest_stage, 1)::int as highest_stage
from public.profiles p
left join public.user_progress up
  on up.user_id = p.id;

grant select on public.leaderboard_view to authenticated;

notify pgrst, 'reload schema';
