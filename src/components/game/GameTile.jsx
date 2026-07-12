import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const stateClasses = {
  empty:
    "border-slate-300/80 bg-white/70 text-slate-900 dark:border-white/10 dark:bg-white/[0.05] dark:text-white",
  correct: "border-success bg-success text-white shadow-[0_16px_40px_rgba(34,197,94,0.28)]",
  present: "border-gold bg-gold text-slate-950 shadow-[0_16px_40px_rgba(245,197,66,0.25)]",
  absent: "border-slate-400 bg-slate-400 text-white dark:border-slate-700 dark:bg-slate-700",
};

export function GameTile({ tile, rowStatus }) {
  const hasLetter = Boolean(tile.letter);
  const isSubmitted = rowStatus === "submitted";

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        scale: hasLetter && !isSubmitted ? [1, 1.08, 1] : 1,
        rotateX: isSubmitted ? [0, -90, 0] : 0,
      }}
      transition={{
        duration: isSubmitted ? 0.55 : 0.18,
        delay: isSubmitted ? tile.index * 0.08 : 0,
        ease: "easeOut",
      }}
      className={cn(
        "game-tile grid aspect-square place-items-center rounded-xl border-2 text-xl font-black shadow-md transition-colors sm:rounded-2xl sm:text-3xl sm:shadow-lg",
        stateClasses[tile.state]
      )}
    >
      {tile.letter}
    </motion.div>
  );
}
