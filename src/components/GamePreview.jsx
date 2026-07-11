import { motion } from "framer-motion";
import { previewRows } from "../constants/landing";
import { cn } from "../utils/cn";

const tileStyles = {
  correct: "border-success bg-success text-white",
  present: "border-gold bg-gold text-slate-950",
  absent: "border-slate-500 bg-slate-500 text-white",
  empty: "border-white/15 bg-white/8 text-white",
};

export function GamePreview() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-premium">
      <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-primary/35 blur-3xl" />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm text-slate-300">جولة اليوم</p>
            <h3 className="text-2xl font-black">خمّن الكلمة</h3>
          </div>
          <span className="rounded-full bg-gold px-4 py-2 text-sm font-black text-slate-950">+80 نقطة</span>
        </div>

        <div className="grid gap-3">
          {previewRows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-3">
              {row.map((tile, tileIndex) => (
                <motion.div
                  key={`${rowIndex}-${tileIndex}`}
                  initial={{ opacity: 0, y: 14, rotateX: -20 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: rowIndex * 0.08 + tileIndex * 0.03 }}
                  className={cn(
                    "grid aspect-square place-items-center rounded-2xl border text-2xl font-black shadow-lg",
                    tileStyles[tile.state]
                  )}
                >
                  {tile.letter}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {["ن", "و", "ر", "ا", "ت", "س"].map((letter) => (
            <span key={letter} className="rounded-xl bg-white/10 px-3 py-2 font-black text-white">
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
