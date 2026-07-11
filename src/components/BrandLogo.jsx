import logoImage from "../assets/logos/word-quest-logo.png";
import { cn } from "../utils/cn";

export function BrandLogo({ className, imageClassName, textClassName, showText = true }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2 sm:gap-3", className)}>
      <img
        src={logoImage}
        alt="ورد كويست"
        className={cn("h-10 w-10 shrink-0 object-contain drop-shadow-lg sm:h-12 sm:w-12", imageClassName)}
      />
      {showText ? <span className={cn("truncate text-base font-black sm:text-lg", textClassName)}>ورد كويست</span> : null}
    </span>
  );
}
