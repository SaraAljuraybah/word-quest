import { useCallback, useState } from "react";
import { completeStageForUser, getUserProgress } from "../services/progressService";
import { getStageByNumber } from "../services/stageService";

const NO_STAGE_MESSAGE = "لا توجد مرحلة متاحة حالياً.";

export function useStage() {
  const [stage, setStage] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoadingStage, setIsLoadingStage] = useState(false);
  const [stageError, setStageError] = useState("");

  const loadCurrentStage = useCallback(async (requestedStageNumber) => {
    setIsLoadingStage(true);
    setStageError("");

    const progressResult = await getUserProgress();
    const nextProgress = progressResult.progress;
    const currentStage = Number(nextProgress?.current_stage) || 1;
    const selectedStage = Number(requestedStageNumber) || currentStage;

    setProgress(nextProgress);

    if (progressResult.error) {
      console.warn("[useStage] Progress load/create failed; continuing with fallback progress", {
        progress: nextProgress,
        error: progressResult.error,
      });
    }

    let playableProgress = nextProgress;
    let stageResult = await getStageByNumber(selectedStage);

    if ((stageResult.error || !stageResult.stage?.word) && !requestedStageNumber && currentStage !== 1) {
      console.warn("[useStage] Current stage was not playable; trying Stage 1 fallback", {
        currentStage,
        progress: nextProgress,
        stageResult,
      });

      stageResult = await getStageByNumber(1);
      playableProgress = { ...nextProgress, current_stage: 1 };
      setProgress(playableProgress);
    }

    if (stageResult.error || !stageResult.stage?.word) {
      const message = stageResult.error?.message || NO_STAGE_MESSAGE;

      console.error("[useStage] No playable stage found", {
        requestedStageNumber,
        selectedStage,
        progress: playableProgress,
        stageResult,
      });

      setStage(null);
      setStageError(message);
      setIsLoadingStage(false);
      return { stage: null, progress: playableProgress, error: stageResult.error || new Error(message) };
    }

    setStage(stageResult.stage);
    setIsLoadingStage(false);
    return { stage: stageResult.stage, progress: playableProgress, error: null };
  }, []);

  const completeCurrentStage = useCallback(async (stageNumber) => {
    const result = await completeStageForUser(stageNumber);
    setProgress(result.progress);
    return result;
  }, []);

  return {
    stage,
    progress,
    isLoadingStage,
    stageError,
    loadCurrentStage,
    completeCurrentStage,
  };
}
