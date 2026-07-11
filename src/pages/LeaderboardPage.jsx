import { motion } from "framer-motion";
import {
  Award,
  Crown,
  Medal,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUserRank, getLeaderboard } from "../services/leaderboardService";
import { cn } from "../utils/cn";

const podiumMeta = {
  1: {
    label: "المركز الأول",
    icon: Crown,
    className: "border-gold/50 bg-gold/15 text-gold lg:order-2 lg:-mt-8",
    avatar: "from-gold to-amber-500 text-slate-950",
  },
  2: {
    label: "المركز الثاني",
    icon: Medal,
    className: "border-slate-300/70 bg-slate-200/55 text-slate-500 dark:border-slate-500/30 dark:bg-slate-400/10 dark:text-slate-300 lg:order-1",
    avatar: "from-slate-200 to-slate-400 text-slate-950",
  },
  3: {
    label: "المركز الثالث",
    icon: Award,
    className: "border-orange-400/45 bg-orange-400/12 text-orange-500 lg:order-3",
    avatar: "from-orange-300 to-orange-600 text-white",
  },
};

function getInitial(username) {
  return (username || "لاعب مجهول").slice(0, 1);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar").format(value || 0);
}

function RankAvatar({ username, className }) {
  return (
    <span
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-fuchsia-500 text-lg font-black text-white shadow-glow",
        className
      )}
    >
      {getInitial(username)}
    </span>
  );
}

function CurrentRankCard({ rankInfo, isLoading }) {
  const entry = rankInfo?.entry;

  return (
    <Card className="rounded-[2rem] border-primary/25 bg-primary/10 p-5 dark:bg-primary/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white shadow-glow">
            <Target className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-black text-primary">ترتيبك الحالي</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
              {isLoading ? "..." : entry ? `#${formatNumber(entry.rank)}` : "غير مصنف"}
            </h2>
          </div>
        </div>

        <div className="grid gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 sm:text-left">
          <span>النقاط: {formatNumber(entry?.total_points)}</span>
          <span>أعلى مرحلة: {formatNumber(entry?.highest_stage)}</span>
          {rankInfo?.above ? (
            <span className="text-primary">
              يفصلك {formatNumber(rankInfo.distanceToAbove)} نقطة عن اللاعب فوقك
            </span>
          ) : entry?.rank === 1 ? (
            <span className="text-gold">أنت في الصدارة</span>
          ) : (
            <span>العب أكثر لتظهر في الترتيب</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function PodiumCard({ player }) {
  const meta = podiumMeta[player.rank] || podiumMeta[3];
  const Icon = meta.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-[2rem] border p-5 text-center shadow-premium backdrop-blur-xl",
        meta.className,
        player.rank === 1 ? "lg:scale-105" : ""
      )}
    >
      <Icon className="mx-auto h-8 w-8" />
      <p className="mt-2 text-sm font-black">{meta.label}</p>
      <RankAvatar username={player.username} className={cn("mx-auto mt-4 h-16 w-16 rounded-3xl text-2xl", meta.avatar)} />
      <h3 className="mt-4 truncate text-2xl font-black text-slate-950 dark:text-white">{player.username}</h3>
      <p className="mt-2 text-lg font-black">{formatNumber(player.total_points)} نقطة</p>

      <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
        <span className="rounded-2xl bg-white/60 p-2 dark:bg-white/10">مرحلة {formatNumber(player.highest_stage)}</span>
        <span className="rounded-2xl bg-white/60 p-2 dark:bg-white/10">مستوى {formatNumber(player.level)}</span>
      </div>
    </motion.article>
  );
}

function LeaderboardRow({ player, isCurrentUser }) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-3xl border border-slate-200/70 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05] md:grid-cols-[70px_minmax(0,1fr)_120px_120px_120px_100px] md:items-center",
        isCurrentUser ? "border-primary/50 bg-primary/10 dark:bg-primary/10" : ""
      )}
    >
      <span className="text-xl font-black text-primary">#{formatNumber(player.rank)}</span>
      <div className="flex min-w-0 items-center gap-3">
        <RankAvatar username={player.username} />
        <span className="truncate text-base font-black text-slate-950 dark:text-white">{player.username}</span>
      </div>
      <span className="text-sm font-black text-gold">{formatNumber(player.total_points)} نقطة</span>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">مرحلة {formatNumber(player.highest_stage)}</span>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{formatNumber(player.wins)} انتصار</span>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">مستوى {formatNumber(player.level)}</span>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="hidden rounded-3xl bg-slate-900 px-4 py-3 text-sm font-black text-white dark:bg-white/10 md:grid md:grid-cols-[70px_minmax(0,1fr)_120px_120px_120px_100px]">
      <span>المركز</span>
      <span>اللاعب</span>
      <span>النقاط</span>
      <span>أعلى مرحلة</span>
      <span>الانتصارات</span>
      <span>المستوى</span>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-3xl border border-slate-200/70 bg-slate-200/70 dark:border-white/10 dark:bg-white/10"
        />
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [rankInfo, setRankInfo] = useState({ entry: null, above: null, distanceToAbove: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refreshLeaderboard = useCallback(async () => {
    setIsRefreshing(true);
    setError("");

    const [leaderboardResult, rankResult] = await Promise.all([
      getLeaderboard(100),
      getCurrentUserRank(user?.id),
    ]);

    setPlayers(leaderboardResult.leaderboard);
    setRankInfo({
      entry: rankResult.entry,
      above: rankResult.above,
      distanceToAbove: rankResult.distanceToAbove,
    });

    if (leaderboardResult.error || rankResult.error) {
      console.error("[LeaderboardPage] Failed to load leaderboard", {
        leaderboardError: leaderboardResult.error,
        rankError: rankResult.error,
      });
      setError("تعذر تحميل لوحة الصدارة");
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, [user?.id]);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const topThree = useMemo(() => players.slice(0, 3), [players]);
  const rankedList = useMemo(() => players.slice(3), [players]);

  return (
    <PageContainer className="relative overflow-hidden py-8 pb-28 lg:py-12">
      <div className="pointer-events-none absolute left-8 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-8 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative space-y-6">
        <Card className="rounded-[2rem]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-primary">ورد كويست</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">المتصدرون</h1>
              <p className="mt-3 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
                تنافس مع اللاعبين وتقدم في المراكز
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={refreshLeaderboard} disabled={isRefreshing}>
              {isRefreshing ? <LoadingSpinner label="تحديث" /> : <RefreshCw className="h-4 w-4" />}
              تحديث
            </Button>
          </div>
        </Card>

        <CurrentRankCard rankInfo={rankInfo} isLoading={isLoading} />

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : error ? (
          <Card className="grid min-h-64 place-items-center text-center">
            <Trophy className="mb-4 h-12 w-12 text-danger" />
            <p className="text-xl font-black text-slate-950 dark:text-white">تعذر تحميل لوحة الصدارة</p>
          </Card>
        ) : players.length === 0 ? (
          <Card className="grid min-h-64 place-items-center text-center">
            <Sparkles className="mb-4 h-12 w-12 text-primary" />
            <p className="text-xl font-black text-slate-950 dark:text-white">لا توجد بيانات كافية للمتصدرين بعد</p>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-3 lg:items-end">
              {topThree.map((player) => (
                <PodiumCard key={player.user_id} player={player} />
              ))}
            </section>

            <Card className="rounded-[2rem] p-3 sm:p-4">
              <div className="mb-4 flex items-center gap-2 px-2">
                <UserRound className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black text-slate-950 dark:text-white">قائمة اللاعبين</h2>
              </div>
              <div className="space-y-3">
                <TableHeader />
                {rankedList.map((player) => (
                  <LeaderboardRow
                    key={player.user_id}
                    player={player}
                    isCurrentUser={player.user_id === user?.id}
                  />
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
