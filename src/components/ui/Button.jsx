import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-primary text-white shadow-glow hover:-translate-y-0.5 hover:bg-violet-500 focus-visible:ring-primary",
  secondary:
    "border border-white/15 bg-white/10 text-slate-900 backdrop-blur hover:bg-white/20 dark:text-white",
  ghost: "text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10",
  gold: "bg-gold text-slate-950 shadow-[0_18px_45px_rgba(245,197,66,0.25)] hover:-translate-y-0.5",
};

export function Button({
  as: Component = "button",
  variant = "primary",
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
