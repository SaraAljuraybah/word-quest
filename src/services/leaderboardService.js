import { supabase } from "../lib/supabase";

const LEADERBOARD_COLUMNS =
  "rank,user_id,username,total_points,level,wins,games_played,highest_stage";

function normalizeEntry(entry) {
  if (!entry) {
    return null;
  }

  return {
    ...entry,
    username: entry.username || "لاعب مجهول",
    rank: Number(entry.rank) || 0,
    total_points: Number(entry.total_points) || 0,
    level: Number(entry.level) || 1,
    wins: Number(entry.wins) || 0,
    games_played: Number(entry.games_played) || 0,
    highest_stage: Number(entry.highest_stage) || 1,
  };
}

export async function getLeaderboard(limit = 100) {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select(LEADERBOARD_COLUMNS)
    .order("rank", { ascending: true })
    .limit(limit);

  return {
    leaderboard: (data || []).map(normalizeEntry),
    error,
  };
}

export async function getCurrentUserRank(userId) {
  if (!userId) {
    return { entry: null, above: null, distanceToAbove: null, error: null };
  }

  const { data, error } = await supabase
    .from("leaderboard_view")
    .select(LEADERBOARD_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return { entry: normalizeEntry(data), above: null, distanceToAbove: null, error };
  }

  const entry = normalizeEntry(data);

  if (entry.rank <= 1) {
    return { entry, above: null, distanceToAbove: 0, error: null };
  }

  const { data: aboveData, error: aboveError } = await supabase
    .from("leaderboard_view")
    .select(LEADERBOARD_COLUMNS)
    .eq("rank", entry.rank - 1)
    .maybeSingle();

  const above = normalizeEntry(aboveData);

  return {
    entry,
    above,
    distanceToAbove: above ? Math.max(above.total_points - entry.total_points, 0) : null,
    error: aboveError,
  };
}
