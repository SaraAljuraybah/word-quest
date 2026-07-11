import { supabase } from "../lib/supabase";
import { calculateLevel, getGameXp } from "../utils/level";

const PROFILE_COLUMNS =
  "id,username,total_points,total_xp,level,games_played,wins,current_streak,best_streak,last_daily_reward_at";

export const emptyProfile = {
  id: null,
  total_points: 0,
  total_xp: 0,
  level: 1,
  games_played: 0,
  wins: 0,
  current_streak: 0,
  best_streak: 0,
  last_daily_reward_at: null,
};

export async function getActiveUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user || null, error };
}

export function normalizeProfile(profile, user = null) {
  const merged = { ...emptyProfile, ...(profile || {}) };
  const username = merged.username || user?.user_metadata?.full_name || "لاعب ورد كويست";

  return {
    ...merged,
    username,
    total_points: merged.total_points || 0,
    total_xp: merged.total_xp || 0,
    level: merged.level || calculateLevel(merged.total_xp),
    games_played: merged.games_played || 0,
    wins: merged.wins || 0,
    current_streak: merged.current_streak || 0,
    best_streak: merged.best_streak || 0,
  };
}

export async function getProfile() {
  const { user, error: userError } = await getActiveUser();

  if (userError) {
    return { profile: normalizeProfile(null), user: null, error: userError };
  }

  if (!user) {
    return { profile: normalizeProfile(null), user: null, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  return { profile: normalizeProfile(data, user), user, error };
}

export async function updateProfileEconomy(updates) {
  const { user } = await getActiveUser();

  if (!user) {
    return { profile: normalizeProfile(null), error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single();

  return { profile: normalizeProfile(data, user), error };
}

export async function applyGameResultStats({ pointsEarned, hasWon, xpEarned }) {
  const { profile, error } = await getProfile();

  if (error || !profile.id) {
    return { data: null, profile, error };
  }

  const nextXpEarned = typeof xpEarned === "number" ? xpEarned : getGameXp(hasWon);
  const nextXp = profile.total_xp + nextXpEarned;
  const updates = {
    total_points: profile.total_points + pointsEarned,
    total_xp: nextXp,
    level: calculateLevel(nextXp),
    games_played: profile.games_played + 1,
    wins: profile.wins + (hasWon ? 1 : 0),
  };

  const result = await updateProfileEconomy(updates);
  return { data: result.profile, profile: result.profile, error: result.error };
}

export async function deductProfilePoints(cost) {
  const { profile, error } = await getProfile();

  if (error || !profile.id) {
    return { profile, error: error || new Error("يجب تسجيل الدخول أولا.") };
  }

  if (profile.total_points < cost) {
    return { profile, error: new Error("نقاطك غير كافية لشراء هذا العنصر") };
  }

  return updateProfileEconomy({ total_points: profile.total_points - cost });
}
