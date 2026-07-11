import { cn } from "../../utils/cn";

export function Input({ label, hint, className, ...props }) {
  return (
    <label className="block space-y-2 text-right">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className={cn(
          "min-h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-right text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-slate-500",
          className
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  );
}
