import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { DailyRewardCard } from "../components/economy/DailyRewardCard";
import { InventorySummary } from "../components/economy/InventorySummary";
import { LevelProgress } from "../components/economy/LevelProgress";
import { PointsBadge } from "../components/economy/PointsBadge";
import { PageContainer } from "../components/PageContainer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Toast } from "../components/ui/Toast";
import { useDailyReward } from "../hooks/useDailyReward";
import { useInventory } from "../hooks/useInventory";
import { useProfile } from "../hooks/useProfile";
import { useStore } from "../hooks/useStore";

export function StorePage() {
  const profile = useProfile();
  const inventory = useInventory();
  const store = useStore({
    onProfileChange: profile.setProfile,
    onInventoryChange: inventory.refreshInventory,
  });
  const dailyReward = useDailyReward({ onProfileChange: profile.setProfile });

  return (
    <PageContainer className="relative overflow-hidden py-8 lg:py-12">
      <div className="absolute left-8 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative space-y-6">
        <Card className="rounded-[2rem]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-primary">متجر ورد كويست</p>
              <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">اشتر العناصر واحفظها للمراحل القادمة</h1>
              <p className="mt-3 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
                العناصر تضاف إلى المخزون فقط الآن. تفعيل القوى داخل اللعبة سيأتي في مرحلة لاحقة.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <PointsBadge points={profile.profile?.total_points || 0} />
              <LevelProgress totalXp={profile.profile?.total_xp || 0} />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
          <section className="space-y-4">
            <Toast message={store.toast?.message} tone={store.toast?.tone} />

            <div className="grid gap-4 md:grid-cols-2">
              {store.items.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="h-full rounded-[2rem] transition hover:-translate-y-1 hover:border-primary/30">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <span className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/10 text-primary">
                        <item.icon className="h-7 w-7" />
                      </span>
                      <span className="rounded-full bg-gold/15 px-4 py-2 text-sm font-black text-gold">
                        {item.cost} نقطة
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">{item.name}</h2>
                    <p className="mt-3 min-h-16 leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
                    <Button
                      type="button"
                      className="mt-6 w-full"
                      disabled={store.isPurchasing || profile.isLoading}
                      onClick={() => store.buyItem(item.key)}
                    >
                      {store.activeItemKey === item.key ? (
                        <LoadingSpinner label="جار الشراء" />
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          شراء
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <DailyRewardCard
              profile={profile.profile}
              reward={dailyReward.reward}
              canClaim={dailyReward.canClaim}
              nextAvailableMessage={dailyReward.nextAvailableMessage}
              isLoading={dailyReward.isLoading}
              isClaiming={dailyReward.isClaiming}
              toast={dailyReward.toast}
              onClaim={dailyReward.claimReward}
            />
            <InventorySummary items={inventory.inventorySummary} />
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
