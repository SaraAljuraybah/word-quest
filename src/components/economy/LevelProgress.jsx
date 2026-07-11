import { getLevelProgress } from "../../utils/level";

export function LevelProgress({ totalXp }) {
  const progress = getLevelProgress(totalXp);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
        <span>المستوى {progress.level}</span>
        <span>
          {progress.progress} / {progress.required} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-l from-primary to-gold transition-all duration-500"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
