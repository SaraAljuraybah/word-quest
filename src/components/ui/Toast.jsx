import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function Toast({ message, tone = "success" }) {
  if (!message) {
    return null;
  }

  const Icon = tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold",
        tone === "error"
          ? "border-danger/25 bg-danger/10 text-danger"
          : "border-success/25 bg-success/10 text-success"
      )}
      role="status"
    >
      <Icon className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}
