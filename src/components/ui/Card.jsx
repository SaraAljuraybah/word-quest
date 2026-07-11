import { cn } from "../../utils/cn";

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-slate-200/70 bg-white/75 p-6 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]",
        className
      )}
    >
      {children}
    </div>
  );
}
