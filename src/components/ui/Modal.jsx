import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-white p-6 shadow-premium dark:bg-slate-950">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
          <Button type="button" variant="ghost" className="min-h-10 px-3" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
