import { useCallback, useEffect, useMemo, useState } from "react";
import { claimDailyReward, DAILY_REWARD, getDailyRewardStatus } from "../services/rewardService";
import { formatArabicTimeUntil } from "../utils/date";
import { useAuth } from "./useAuth";

export function useDailyReward({ onProfileChange } = {}) {
  const { user, session, loading: authLoading } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [nextAvailableAt, setNextAvailableAt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [toast, setToast] = useState(null);

  const refreshRewardStatus = useCallback(async () => {
    if (authLoading) {
      setIsLoading(true);
      return { canClaim: false, nextAvailableAt: null, error: null };
    }

    if (!user) {
      setCanClaim(false);
      setNextAvailableAt(null);
      setIsLoading(false);
      return { canClaim: false, nextAvailableAt: null, error: null };
    }

    setIsLoading(true);

    const result = await getDailyRewardStatus(user);

    setCanClaim(result.canClaim);
    setNextAvailableAt(result.nextAvailableAt);
    setIsLoading(false);

    if (result.error && result.error.reason !== "no_user") {
      setToast({ tone: "error", message: "تعذر تحميل المكافأة اليومية" });
    }

    return result;
  }, [authLoading, user]);

  useEffect(() => {
    refreshRewardStatus();
  }, [refreshRewardStatus]);

  async function claimReward() {
    if (authLoading || isLoading || isClaiming) {
      return { profile: null, error: null };
    }

    if (!user) {
      setToast({ tone: "error", message: "يرجى تسجيل الدخول للحصول على المكافأة" });
      return { profile: null, error: new Error("يرجى تسجيل الدخول للحصول على المكافأة") };
    }

    setIsClaiming(true);
    setToast(null);

    const result = await claimDailyReward(user);

    if (result.error) {
      console.error("[dailyReward] Claim failed", {
        authLoading,
        contextUserId: user?.id,
        sessionUserId: session?.user?.id,
        error: {
          message: result.error?.message,
          code: result.error?.code,
          details: result.error?.details,
          hint: result.error?.hint,
          reason: result.error?.reason,
        },
      });

      const message =
        result.error.reason === "no_user"
          ? "يرجى تسجيل الدخول للحصول على المكافأة"
          : result.error.reason === "already_claimed"
            ? "لقد استلمت مكافأة اليوم"
            : "تعذر استلام المكافأة، حاول مرة أخرى";

      setToast({ tone: "error", message });
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
    authLoading,
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
