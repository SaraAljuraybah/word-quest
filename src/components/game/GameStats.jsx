import { Award, Flame, Layers, Trophy } from "lucide-react";
import { Card } from "../ui/Card";

export function GameStats({ points, level, stage, attempt, maxAttempts }) {
  const items = [
    { label: "النقاط", value: points, icon: Trophy },
    { label: "المستوى", value: level, icon: Award },
    { label: "المرحلة", value: stage, icon: Layers },
    { label: "المحاولة", value: `${attempt}/${maxAttempts}`, icon: Flame },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-3xl p-4 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
