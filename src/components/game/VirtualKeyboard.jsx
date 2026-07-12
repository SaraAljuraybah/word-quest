import { Delete, CornerDownLeft } from "lucide-react";
import { ARABIC_KEYBOARD_ROWS } from "../../constants/game";
import { cn } from "../../utils/cn";
import { normalizeWord } from "../../utils/gameLogic";

const keyStateClasses = {
  correct: "bg-success text-white border-success",
  present: "bg-gold text-slate-950 border-gold",
  absent:
    "border-slate-300 bg-slate-300/80 text-slate-500 opacity-50 shadow-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500",
};

function KeyboardButton({ children, className, state, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "game-key grid min-h-10 place-items-center rounded-xl border border-slate-200 bg-white/80 px-1 text-base font-black text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/10 dark:bg-white/[0.08] dark:text-white dark:hover:bg-white/[0.14] sm:min-h-14 sm:rounded-2xl sm:px-2 sm:text-lg",
        disabled ? "cursor-not-allowed hover:bg-white dark:hover:bg-white/[0.08]" : "cursor-pointer",
        state ? keyStateClasses[state] : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function VirtualKeyboard({ colors, onLetter, onBackspace, onSubmit, disabled }) {
  return (
    <div className="game-keyboard mx-auto w-full max-w-3xl space-y-1.5 rounded-3xl border border-slate-200/70 bg-white/80 p-2 shadow-premium backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] sm:space-y-2 sm:p-3">
      {ARABIC_KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={row.join("")} className="game-keyboard-row grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
          {row.map((letter) => {
            const normalizedLetter = normalizeWord(letter);
            const state = colors[normalizedLetter];
            const isDisabled = disabled || state === "absent";

            return (
              <KeyboardButton
                key={letter}
                state={state}
                disabled={isDisabled}
                onClick={() => onLetter(letter)}
              >
                {letter}
              </KeyboardButton>
            );
          })}
          {rowIndex === 2 ? (
            <>
              <KeyboardButton className="col-span-2" disabled={disabled} onClick={onBackspace}>
                <Delete className="h-5 w-5" />
              </KeyboardButton>
              <KeyboardButton className="col-span-2 bg-primary text-white" disabled={disabled} onClick={onSubmit}>
                <CornerDownLeft className="h-5 w-5" />
              </KeyboardButton>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}
