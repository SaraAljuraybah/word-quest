import { useCallback, useEffect, useMemo, useState } from "react";
import { claimDailyReward, DAILY_REWARD, getDailyRewardStatus } from "../services/rewardService";
import { formatArabicTimeUntil } from "../utils/date";

export function useDailyReward({ onProfileChange } = {}) {
  const [canClaim, setCanClaim] = useState(false);
  const [nextAvailableAt, setNextAvailableAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [toast, setToast] = useState(null);

  const refreshRewardStatus = useCallback(async () => {
    setIsLoading(true);

    const result = await getDailyRewardStatus();

    setCanClaim(result.canClaim);
    setNextAvailableAt(result.nextAvailableAt);
    setIsLoading(false);

    if (result.error) {
      setToast({ tone: "error", message: result.error.message });
    }

    return result;
  }, []);

  useEffect(() => {
    refreshRewardStatus();
  }, [refreshRewardStatus]);

  async function claimReward() {
    setIsClaiming(true);
    setToast(null);

    const result = await claimDailyReward();

    if (result.error) {
      setToast({ tone: "error", message: result.error.message });
    } else {
      setToast({ tone: "success", message: "تم استلام مكافأة اليوم: +20 نقطة و +20 XP." });
      setCanClaim(false);
      setNextAvailableAt(new Date(new Date().setHours(24, 0, 0, 0)));
      onProfileChange?.(result.profile);
    }

    setIsClaiming(false);
    return result;
  }

  const nextAvailableMessage = useMemo(() => {
    if (canClaim || !nextAvailableAt) {
      return "";
    }

    return `المكافأة التالية بعد ${formatArabicTimeUntil(nextAvailableAt)}.`;
  }, [canClaim, nextAvailableAt]);

  return {
    reward: DAILY_REWARD,
    canClaim,
    nextAvailableAt,
    nextAvailableMessage,
    isLoading,
    isClaiming,
    toast,
    setToast,
    claimReward,
    refreshRewardStatus,
  };
}
