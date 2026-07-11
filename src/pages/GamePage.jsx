import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Coins, Home, RotateCcw, Sparkles, WifiOff } from "lucide-react";
import { useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GameBoard } from "../components/game/GameBoard";
import { VirtualKeyboard } from "../components/game/VirtualKeyboard";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { GAME_CONFIG, GAME_STATUS } from "../constants/game";
import { useGame } from "../hooks/useGame";
import { useInventory } from "../hooks/useInventory";

function ResultModal({
  isOpen,
  tone,
  title,
  subtitle,
  pointsEarned,
  xpEarned,
  correctWord,
  onPrimary,
  primaryLabel,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-premium dark:border-white/10 dark:bg-slate-950 sm:p-6"
          >
            <div
              className={
                tone === "success"
                  ? "mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-success/15 text-success"
                  : "mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-danger/15 text-danger"
              }
            >
              {tone === "success" ? <Sparkles className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{subtitle}</p>

            {tone === "success" ? (
              <div className="my-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4">
                  <p className="text-sm font-bold text-gold">النقاط</p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">+{pointsEarned}</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                  <p className="text-sm font-bold text-primary">XP</p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">+{xpEarned}</p>
                </div>
              </div>
            ) : (
              <div className="my-6 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">الكلمة الصحيحة</p>
                <p className="mt-2 text-4xl font-black tracking-[0.12em] text-slate-950 dark:text-white">
                  {correctWord}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onPrimary}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white shadow-glow transition hover:bg-violet-500"
              >
                {primaryLabel}
              </button>
              <Link
                to="/stages"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-slate-200 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                <Home className="h-4 w-4" />
                العودة للخريطة
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PowerUpsPanel({ items, isLoading, error }) {
  const ownedItems = items.filter((item) => item.quantity > 0);

  return (
    <aside className="w-full rounded-3xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] lg:max-w-[220px]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-black text-slate-950 dark:text-white">العناصر</h2>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-black text-primary">
          {ownedItems.length}
        </span>
      </div>

      {isLoading ? (
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">جاري تحميل العناصر...</p>
      ) : error ? (
        <p className="text-xs font-bold text-danger">تعذر تحميل العناصر</p>
      ) : ownedItems.length === 0 ? (
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">لا توجد عناصر حالياً</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {ownedItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="relative flex min-w-28 items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.07] lg:min-w-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-black text-slate-800 dark:text-white">
                  {item.name}
                </span>
                <span className="absolute -left-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full border border-gold/40 bg-gold px-1.5 text-xs font-black text-slate-950 shadow-sm">
                  {item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export function GamePage() {
  const { stageNumber } = useParams();
  const navigate = useNavigate();
  const selectedStageNumber = useMemo(() => Number(stageNumber) || null, [stageNumber]);
  const inventory = useInventory();
  const game = useGame(GAME_CONFIG, selectedStageNumber);
  const visibleStageNumber = useMemo(
    () => game.stage?.stage_number || selectedStageNumber || game.progress?.current_stage || 1,
    [game.progress?.current_stage, game.stage?.stage_number, selectedStageNumber]
  );
  const points = useMemo(
    () => game.profileStats.totalPoints + (game.status === GAME_STATUS.won ? game.pointsEarned : 0),
    [game.pointsEarned, game.profileStats.totalPoints, game.status]
  );

  const goToNextStage = useCallback(() => {
    const nextStage = (game.completedStage?.stage_number || visibleStageNumber) + 1;
    navigate(`/game/${nextStage}`);
  }, [game.completedStage?.stage_number, navigate, visibleStageNumber]);

  return (
    <main className="min-h-[calc(100svh-73px)] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 px-3 py-3 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:min-h-[calc(100vh-81px)] sm:px-4 sm:py-5">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute left-1/2 top-16 h-52 w-52 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl sm:h-64 sm:w-64" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-97px)] max-w-4xl flex-col gap-3 sm:min-h-[calc(100vh-121px)] sm:gap-5">
        <header className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/85 px-2.5 py-2 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:rounded-3xl sm:px-3 sm:py-3">
          <Link
            to="/stages"
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-900/5 dark:text-white dark:hover:bg-white/10 sm:h-11 sm:w-11 sm:rounded-2xl"
            aria-label="العودة للخريطة"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="text-center">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">المرحلة</p>
            <h1 className="text-lg font-black text-slate-950 dark:text-white sm:text-xl">{visibleStageNumber}</h1>
          </div>

          <div className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gold/10 px-2.5 text-sm font-black text-gold sm:h-11 sm:gap-2 sm:rounded-2xl sm:px-3">
            <Coins className="h-4 w-4" />
            {points}
          </div>
        </header>

        <section className="grid flex-1 place-items-center rounded-3xl border border-slate-200/70 bg-white/80 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:rounded-[2rem] sm:p-6">
          {game.isLoading ? (
            <LoadingSpinner label="جاري تجهيز المرحلة" />
          ) : game.status === GAME_STATUS.error ? (
            <div className="max-w-sm text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-danger/10 text-danger">
                <WifiOff className="h-7 w-7" />
              </span>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">تعذر تحميل المرحلة</h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{game.message}</p>
            </div>
          ) : (
            <div className="grid w-full items-center gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-5">
              <div className="min-w-0 space-y-2 sm:space-y-4">
                <GameBoard
                  rows={game.boardRows}
                  shakeRowId={game.shakeRowId}
                  status={game.status}
                  wordLength={game.wordLength}
                />
                {game.message ? (
                  <p className="mx-auto max-w-md text-center text-xs font-bold text-slate-500 dark:text-slate-400 sm:text-sm">
                    {game.message}
                  </p>
                ) : null}
              </div>

              <PowerUpsPanel
                items={inventory.inventorySummary}
                isLoading={inventory.isLoading}
                error={inventory.error}
              />
            </div>
          )}
        </section>

        <VirtualKeyboard
          colors={game.keyboardColors}
          onLetter={game.addLetter}
          onBackspace={game.removeLetter}
          onSubmit={game.submitGuess}
          disabled={game.status !== GAME_STATUS.ready || game.isSubmitting}
        />
      </div>

      <ResultModal
        isOpen={game.status === GAME_STATUS.won && Boolean(game.completedStage)}
        tone="success"
        title="أحسنت!"
        subtitle={`اكتملت المرحلة ${game.completedStage?.stage_number || visibleStageNumber}.`}
        pointsEarned={game.pointsEarned}
        xpEarned={game.xpEarned}
        onPrimary={goToNextStage}
        primaryLabel="المرحلة التالية"
      />

      <ResultModal
        isOpen={game.status === GAME_STATUS.lost}
        tone="danger"
        title="انتهت المحاولات"
        subtitle="لا بأس، جرب مرة أخرى بهدوء."
        correctWord={game.targetWord}
        onPrimary={game.resetGame}
        primaryLabel="إعادة المحاولة"
      />
    </main>
  );
}
