import { supabase } from "../lib/supabase";
import { calculateLevel, getDailyRewardXp } from "../utils/level";
import { getNextLocalMidnight, isToday, isYesterday } from "../utils/date";
import { normalizeProfile } from "./profileService";

const PROFILE_COLUMNS =
  "id,username,total_points,total_xp,level,games_played,wins,current_streak,best_streak,last_daily_reward_at";

export const DAILY_REWARD = {
  points: 20,
  xp: getDailyRewardXp(),
};

function getLoginError() {
  const error = new Error("يرجى تسجيل الدخول للحصول على المكافأة");
  error.reason = "no_user";
  return error;
}

function getAlreadyClaimedError() {
  const error = new Error("لقد استلمت مكافأة اليوم");
  error.reason = "already_claimed";
  return error;
}

function normalizeRewardProfile(profile, user) {
  return normalizeProfile(profile, user);
}

async function getProfileForUser(user) {
  if (!user?.id) {
    return { profile: normalizeRewardProfile(null, user), error: getLoginError() };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  return { profile: normalizeRewardProfile(data, user), error };
}

async function updateRewardProfile(user, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single();

  return { profile: normalizeRewardProfile(data, user), error };
}

export async function getDailyRewardStatus(user) {
  if (!user?.id) {
    return {
      profile: normalizeRewardProfile(null, user),
      canClaim: false,
      nextAvailableAt: null,
      error: getLoginError(),
    };
  }

  const { profile, error } = await getProfileForUser(user);
  const canClaim = !error && !isToday(profile.last_daily_reward_at);

  return {
    profile,
    canClaim,
    nextAvailableAt: canClaim ? null : getNextLocalMidnight(),
    error,
  };
}

export async function claimDailyReward(user) {
  if (!user?.id) {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  }

  if (!user?.id) {
    return { profile: normalizeRewardProfile(null, user), error: getLoginError() };
  }

  const { profile, error } = await getProfileForUser(user);

  if (error || !profile.id) {
    return { profile, error: error || getLoginError() };
  }

  if (isToday(profile.last_daily_reward_at)) {
    return { profile, error: getAlreadyClaimedError() };
  }

  const nextStreak = isYesterday(profile.last_daily_reward_at) ? profile.current_streak + 1 : 1;
  const nextXp = profile.total_xp + DAILY_REWARD.xp;
  const updates = {
    total_points: profile.total_points + DAILY_REWARD.points,
    total_xp: nextXp,
    level: calculateLevel(nextXp),
    current_streak: nextStreak,
    best_streak: Math.max(profile.best_streak, nextStreak),
    last_daily_reward_at: new Date().toISOString(),
  };

  const result = await updateRewardProfile(user, updates);

  if (result.error) {
    console.error("[dailyReward] Supabase update failed", {
      message: result.error?.message,
      code: result.error?.code,
      details: result.error?.details,
      hint: result.error?.hint,
    });
  }

  return { profile: result.profile, error: result.error };
}
