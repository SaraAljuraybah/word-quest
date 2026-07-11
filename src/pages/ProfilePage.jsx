import { Award, Crown, Gamepad2, Percent, Sparkles, Trophy } from "lucide-react";
import { DailyRewardCard } from "../components/economy/DailyRewardCard";
import { InventorySummary } from "../components/economy/InventorySummary";
import { LevelProgress } from "../components/economy/LevelProgress";
import { PointsBadge } from "../components/economy/PointsBadge";
import { PageContainer } from "../components/PageContainer";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { useDailyReward } from "../hooks/useDailyReward";
import { useInventory } from "../hooks/useInventory";
import { useProfile } from "../hooks/useProfile";
import { getLevelProgress } from "../utils/level";

function StatCard({ label, value, icon: Icon, tone = "primary" }) {
  const toneClass = tone === "gold" ? "bg-gold/15 text-gold" : "bg-primary/10 text-primary";

  return (
    <Card className="rounded-3xl p-4 shadow-none">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function ProfilePage() {
  const profileState = useProfile();
  const inventory = useInventory();
  const dailyReward = useDailyReward({ onProfileChange: profileState.setProfile });
  const profile = profileState.profile;
  const winRate = profile?.games_played ? Math.round((profile.wins / profile.games_played) * 100) : 0;
  const levelProgress = getLevelProgress(profile?.total_xp || 0);

  if (profileState.isLoading) {
    return (
      <PageContainer className="grid min-h-[calc(100vh-81px)] place-items-center py-12">
        <LoadingSpinner label="جار تحميل الملف الشخصي" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="relative overflow-hidden py-8 lg:py-12">
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative space-y-6">
        <Card className="rounded-[2rem]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gradient-to-br from-primary to-violet-500 text-3xl font-black text-white shadow-glow">
                {(profile?.username || "و").slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-black text-primary">ملف اللاعب</p>
                <h1 className="mt-1 text-4xl font-black text-slate-950 dark:text-white">{profile?.username}</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">المستوى {levelProgress.level}</p>
              </div>
            </div>
            <div className="w-full max-w-md space-y-3">
              <PointsBadge points={profile?.total_points || 0} />
              <LevelProgress totalXp={profile?.total_xp || 0} />
            </div>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="إجمالي النقاط" value={profile?.total_points || 0} icon={Trophy} tone="gold" />
          <StatCard label="إجمالي XP" value={profile?.total_xp || 0} icon={Sparkles} />
          <StatCard label="الألعاب" value={profile?.games_played || 0} icon={Gamepad2} />
          <StatCard label="الانتصارات" value={profile?.wins || 0} icon={Crown} tone="gold" />
          <StatCard label="نسبة الفوز" value={`${winRate}%`} icon={Percent} />
          <StatCard label="المستوى" value={levelProgress.level} icon={Award} />
          <StatCard label="السلسلة الحالية" value={profile?.current_streak || 0} icon={Sparkles} tone="gold" />
          <StatCard label="أفضل سلسلة" value={profile?.best_streak || 0} icon={Trophy} tone="gold" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
          <InventorySummary items={inventory.inventorySummary} />
          <DailyRewardCard
            profile={profile}
            reward={dailyReward.reward}
            canClaim={dailyReward.canClaim}
            nextAvailableMessage={dailyReward.nextAvailableMessage}
            isLoading={dailyReward.isLoading}
            isClaiming={dailyReward.isClaiming}
            toast={dailyReward.toast}
            onClaim={dailyReward.claimReward}
          />
        </div>
      </div>
    </PageContainer>
  );
}
