import { PackageOpen } from "lucide-react";
import { STORE_ITEMS } from "../../constants/store";
import { Card } from "../ui/Card";

export function InventorySummary({ items = [], compact = false }) {
  const mergedItems = STORE_ITEMS.map((storeItem) => {
    const found = items.find((item) => item.key === storeItem.key || item.item_key === storeItem.key);
    return {
      ...storeItem,
      quantity: found?.quantity || 0,
    };
  });

  return (
    <Card className={compact ? "rounded-3xl p-4 shadow-none" : "rounded-[2rem]"}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-primary">المخزون</p>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">العناصر المتاحة</h2>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <PackageOpen className="h-5 w-5" />
        </span>
      </div>

      <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-3 sm:grid-cols-2"}>
        {mergedItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.05]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <item.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-bold text-slate-700 dark:text-slate-200">{item.name}</span>
            </div>
            <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-black text-gold">
              {item.quantity}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
