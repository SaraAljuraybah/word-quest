import { RefreshCw, RotateCcw } from "lucide-react";
import { GAME_STATUS } from "../../constants/game";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Toast } from "../ui/Toast";

export function GameStatusPanel({
  status,
  message,
  isLoading,
  isSubmitting,
  pointsEarned,
  onReset,
  onNextGame,
}) {
  const isEnded = status === GAME_STATUS.won || status === GAME_STATUS.lost;
  const tone = status === GAME_STATUS.error || status === GAME_STATUS.lost ? "error" : "success";

  return (
    <Card className="rounded-3xl p-5 shadow-none">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black text-primary">حالة الجولة</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
            {status === GAME_STATUS.won
              ? "فوز مستحق"
              : status === GAME_STATUS.lost
                ? "انتهت الجولة"
                : status === GAME_STATUS.error
                  ? "تعذر بدء اللعبة"
                  : "خمّن الكلمة"}
          </h1>
          {pointsEarned ? (
            <p className="mt-2 text-sm font-bold text-gold">+{pointsEarned} نقطة</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading || isSubmitting}>
            <RotateCcw className="h-4 w-4" />
            إعادة
          </Button>
          <Button type="button" onClick={onNextGame} disabled={isLoading || isSubmitting}>
            {isLoading ? <LoadingSpinner label="جار التحميل" /> : <RefreshCw className="h-4 w-4" />}
            {isEnded ? "جولة جديدة" : "كلمة جديدة"}
          </Button>
        </div>
      </div>

      {message ? <div className="mt-4"><Toast message={message} tone={tone} /></div> : null}
    </Card>
  );
}
