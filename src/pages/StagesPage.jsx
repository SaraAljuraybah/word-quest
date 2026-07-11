import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Crown, Lock, Play, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useProfile } from "../hooks/useProfile";
import { useProgress } from "../hooks/useProgress";
import { getStages } from "../services/stageService";
import { cn } from "../utils/cn";

const worldNames = [
  "جزيرة البدايات",
  "مملكة الغابة",
  "مملكة الصحراء",
  "جبال الثلج",
  "العربية القديمة",
  "مدينة المستقبل",
  "عالم الفضاء",
];

function getWorldNumber(stageNumber) {
  return Math.floor((stageNumber - 1) / 100) + 1;
}

function getWorldName(stageNumber) {
  return worldNames[(getWorldNumber(stageNumber) - 1) % worldNames.length];
}

function getStageState(stage, progress) {
  const lastCompleted = progress?.last_completed_stage || 0;
  const currentStage = progress?.current_stage || 1;

  if (lastCompleted >= stage.stage_number) {
    return "completed";
  }

  if (currentStage === stage.stage_number) {
    return "current";
  }

  return "locked";
}

function StageNode({ stage, state, currentRef }) {
  const isPlayable = state === "completed" || state === "current";
  const isMilestone = stage.stage_number % 10 === 0;
  const isWorldGate = (stage.stage_number - 1) % 100 === 0;

  const node = (
    <div ref={state === "current" ? currentRef : null} className="relative flex flex-col items-center gap-2">
      {isWorldGate ? (
        <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-black text-gold">
          عالم {getWorldNumber(stage.stage_number)}
        </span>
      ) : null}

      <div
        className={cn(
          "relative grid place-items-center rounded-full border-4 text-white shadow-premium transition",
          isMilestone || isWorldGate ? "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20" : "h-16 w-16",
          state === "completed" && "border-emerald-100 bg-success shadow-[0_16px_40px_rgba(34,197,94,0.32)]",
          state === "current" && "border-white bg-primary shadow-[0_0_0_8px_rgba(124,58,237,0.18),0_20px_60px_rgba(124,58,237,0.5)]",
          state === "locked" && "border-slate-400 bg-slate-500 text-slate-100 opacity-90 shadow-[0_10px_28px_rgba(71,85,105,0.22)] dark:border-slate-500/40 dark:bg-slate-700 dark:text-slate-300",
          isMilestone && state !== "locked" && "border-gold bg-gradient-to-br from-gold to-primary",
          isWorldGate && state !== "locked" && "border-gold bg-gradient-to-br from-cyan-400 to-primary"
        )}
      >
        {state === "completed" ? (
          <Check className="h-7 w-7" />
        ) : state === "current" ? (
          <Play className="h-7 w-7" />
        ) : state === "locked" ? (
          <Lock className="h-6 w-6" />
        ) : isMilestone ? (
          <Crown className="h-7 w-7" />
        ) : (
          <Trophy className="h-7 w-7" />
        )}
      </div>

      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white dark:bg-slate-950/70">
        {stage.stage_number}
      </span>
    </div>
  );

  if (!isPlayable) {
    return node;
  }

  return (
    <Link to={`/game/${stage.stage_number}`} aria-label={`فتح المرحلة ${stage.stage_number}`}>
      {node}
    </Link>
  );
}

function SummarySidebar({ currentStage, currentWorld, worldName, progressPercent }) {
  return (
    <aside className="hidden w-72 shrink-0 self-start rounded-3xl border border-slate-300 bg-white p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-950/75 dark:text-white lg:block">
      <p className="text-xs font-black text-slate-500 dark:text-slate-300">العالم الحالي</p>
      <h2 className="mt-2 text-2xl font-black">عالم {currentWorld}</h2>
      <p className="mt-1 text-lg font-black text-gold">{worldName}</p>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs font-black text-slate-500 dark:text-slate-300">
          <span>التقدم</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-l from-success via-gold to-primary" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 p-4 dark:bg-white/10">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-300">المرحلة الحالية</p>
        <p className="mt-1 text-4xl font-black">{currentStage}</p>
      </div>

      <Link
        to={`/game/${currentStage}`}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-glow transition hover:bg-violet-500"
      >
        <Play className="h-4 w-4" />
        العب المرحلة الحالية
      </Link>
    </aside>
  );
}

export function StagesPage() {
  const progressState = useProgress();
  const profileState = useProfile();
  const currentStageRef = useRef(null);
  const hasCenteredCurrentStage = useRef(false);
  const [stages, setStages] = useState([]);
  const [isLoadingStages, setIsLoadingStages] = useState(true);
  const [error, setError] = useState("");

  const loadStages = useCallback(async () => {
    setIsLoadingStages(true);
    setError("");

    const result = await getStages();

    setStages(result.stages);
    setError(result.error?.message || "");
    setIsLoadingStages(false);
  }, []);

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  const progress = progressState.progress;
  const currentStage = progress?.current_stage || 1;
  const completedCount = progress?.last_completed_stage || 0;
  const visibleCompletedCount = Math.min(completedCount, stages.length);
  const currentWorld = getWorldNumber(currentStage);
  const worldName = getWorldName(currentStage);
  const points = profileState.profile?.total_points || 0;
  const progressPercent = stages.length ? Math.round((visibleCompletedCount / stages.length) * 100) : 0;

  const visibleStages = useMemo(() => stages.slice(0, Math.max(60, currentStage + 24)), [currentStage, stages]);

  useEffect(() => {
    if (hasCenteredCurrentStage.current || isLoadingStages || progressState.isLoading || !currentStageRef.current) {
      return;
    }

    hasCenteredCurrentStage.current = true;
    window.setTimeout(() => {
      currentStageRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 250);
  }, [currentStage, isLoadingStages, progressState.isLoading, visibleStages.length]);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-gradient-to-b from-violet-100 via-slate-50 to-slate-200 px-3 pb-32 pt-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-4 sm:pb-8 sm:pt-6">
      <div className="mx-auto flex max-w-7xl gap-5">
        <section className="min-w-0 flex-1">
          {isLoadingStages || progressState.isLoading || profileState.isLoading ? (
            <div className="grid min-h-[70vh] place-items-center">
              <LoadingSpinner label="جاري تحميل الخريطة" />
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-danger/20 bg-danger/10 p-8 text-center">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">تعذر تحميل الخريطة</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-200">{error}</p>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-300 bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300">النقاط</p>
                  <p className="mt-1 text-3xl font-black text-gold sm:text-2xl">{points}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300">العالم</p>
                  <p className="mt-1 text-3xl font-black sm:text-2xl">{currentWorld}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300">المرحلة الحالية</p>
                  <p className="mt-1 text-3xl font-black sm:text-2xl">{currentStage}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-300">التقدم</p>
                  <p className="mt-1 text-3xl font-black sm:text-2xl">{progressPercent}%</p>
                </div>
              </div>

              <div className="relative mx-auto max-w-4xl py-6 sm:py-8">
                <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary via-gold to-success opacity-70 dark:opacity-40" />

                <div className="relative grid gap-y-10">
                  {visibleStages.map((stage, index) => {
                    const state = getStageState(stage, progress);
                    const side = index % 2 === 0 ? "sm:justify-start sm:pr-[52%]" : "sm:justify-end sm:pl-[52%]";

                    return (
                      <div key={stage.id} className={cn("relative flex justify-center", side)}>
                        <span className="absolute left-1/2 top-8 hidden h-1 w-16 -translate-x-1/2 bg-slate-200 dark:bg-white/10 sm:block" />
                        <StageNode stage={stage} state={state} currentRef={currentStageRef} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  to={`/game/${currentStage}`}
                  className="inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-white shadow-glow transition hover:bg-violet-500 sm:w-auto"
                >
                  العب المرحلة الحالية
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </section>

        <SummarySidebar
          currentStage={currentStage}
          currentWorld={currentWorld}
          worldName={worldName}
          progressPercent={progressPercent}
        />
      </div>
    </main>
  );
}
