import { CalendarCheck, Flame } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Toast } from "../ui/Toast";

export function DailyRewardCard({ profile, reward, canClaim, nextAvailableMessage, isLoading, isClaiming, toast, onClaim }) {
  return (
    <Card className="relative overflow-hidden rounded-[2rem]">
      <div className="absolute left-0 top-0 h-28 w-28 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-gold">المكافأة اليومية</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              +{reward.points} نقطة و +{reward.xp} XP
            </h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
              عد كل يوم للحفاظ على سلسلتك ورفع مستواك أسرع.
            </p>
          </div>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-gold/15 text-gold">
            <CalendarCheck className="h-7 w-7" />
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              <Flame className="h-4 w-4 text-gold" />
              السلسلة الحالية
            </div>
            <p className="text-2xl font-black text-slate-950 dark:text-white">{profile?.current_streak || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.05]">
            <p className="mb-2 text-sm font-bold text-slate-500 dark:text-slate-400">أفضل سلسلة</p>
            <p className="text-2xl font-black text-slate-950 dark:text-white">{profile?.best_streak || 0}</p>
          </div>
        </div>

        <Toast message={toast?.message} tone={toast?.tone} />

        <Button type="button" className="mt-4 w-full" disabled={!canClaim || isLoading || isClaiming} onClick={onClaim}>
          {isClaiming ? <LoadingSpinner label="جار الاستلام" /> : canClaim ? "استلام المكافأة" : nextAvailableMessage || "تم استلام مكافأة اليوم"}
        </Button>
      </div>
    </Card>
  );
}
