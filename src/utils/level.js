export const XP_PER_LEVEL = 500;

export function calculateLevel(totalXp = 0) {
  return Math.floor(Number(totalXp || 0) / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(totalXp = 0) {
  const normalizedXp = Number(totalXp || 0);
  const progress = normalizedXp % XP_PER_LEVEL;

  return {
    level: calculateLevel(normalizedXp),
    progress,
    required: XP_PER_LEVEL,
    percent: Math.min(100, Math.round((progress / XP_PER_LEVEL) * 100)),
  };
}

export function getGameXp(hasWon) {
  return hasWon ? 50 : 10;
}

export function getDailyRewardXp() {
  return 20;
}
