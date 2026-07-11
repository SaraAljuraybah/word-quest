import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

export function StageCompletionModal({ stage, pointsEarned, xpEarned, isOpen, onNextStage, onReplay }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 190, damping: 18 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white p-6 text-center shadow-premium dark:bg-slate-950"
          >
            <div className="absolute inset-x-10 top-0 h-32 rounded-full bg-primary/25 blur-3xl" />
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
                className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gold/15 text-4xl"
              >
                🎉
              </motion.div>

              <p className="text-sm font-black text-primary">Stage Completed</p>
              <h2 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
                اكتملت المرحلة {stage?.stage_number}
              </h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                أداء رائع. تم فتح المرحلة التالية وإضافة المكافآت إلى حسابك.
              </p>

              <div className="my-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4">
                  <p className="text-sm font-bold text-gold">النقاط</p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">+{pointsEarned}</p>
                </div>
                <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                  <p className="text-sm font-bold text-primary">XP</p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">+{xpEarned}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" className="flex-1" onClick={onNextStage}>
                  <Sparkles className="h-4 w-4" />
                  المرحلة التالية
                </Button>
                <Button type="button" variant="secondary" className="flex-1" onClick={onReplay}>
                  <RotateCcw className="h-4 w-4" />
                  إعادة اللعب
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
