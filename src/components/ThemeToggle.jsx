import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/Button";

export function ThemeToggle({ isDark, onToggle }) {
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      type="button"
      variant="secondary"
      className="min-h-11 w-11 shrink-0 rounded-full border-2 border-primary/35 bg-white px-0 text-primary shadow-[0_10px_28px_rgba(124,58,237,0.18)] hover:border-primary/60 hover:bg-violet-50 hover:text-violet-700 dark:border-primary/40 dark:bg-slate-900 dark:text-gold dark:shadow-[0_0_28px_rgba(124,58,237,0.28)] dark:hover:border-primary/70 dark:hover:bg-slate-800"
      onClick={onToggle}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      <Icon className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
    </Button>
  );
}
