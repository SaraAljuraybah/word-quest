import { calculateLevel, getDailyRewardXp } from "../utils/level";
import { getNextLocalMidnight, isToday, isYesterday } from "../utils/date";
import { getProfile, updateProfileEconomy } from "./profileService";

export const DAILY_REWARD = {
  points: 20,
  xp: getDailyRewardXp(),
};

export async function getDailyRewardStatus() {
  const { profile, error } = await getProfile();
  const canClaim = !isToday(profile.last_daily_reward_at);

  return {
    profile,
    canClaim,
    nextAvailableAt: canClaim ? null : getNextLocalMidnight(),
    error,
  };
}

export async function claimDailyReward() {
  const { profile, error } = await getProfile();

  if (error || !profile.id) {
    return { profile, error: error || new Error("يجب تسجيل الدخول أولا.") };
  }

  if (isToday(profile.last_daily_reward_at)) {
    return { profile, error: new Error("تم استلام مكافأة اليوم بالفعل.") };
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

  const result = await updateProfileEconomy(updates);
  return { profile: result.profile, error: result.error };
}
