import { useCallback, useEffect, useState } from "react";
import { completeStageForUser, getUserProgress } from "../services/progressService";

export function useProgress() {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProgress = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const result = await getUserProgress();

    setProgress(result.progress);
    setError(result.error?.message || "");
    setIsLoading(false);

    return result.progress;
  }, []);

  const completeStage = useCallback(async (stageNumber) => {
    const result = await completeStageForUser(stageNumber);

    setProgress(result.progress);
    setError(result.error?.message || "");

    return result;
  }, []);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    progress,
    isLoading,
    error,
    refreshProgress,
    completeStage,
  };
}
