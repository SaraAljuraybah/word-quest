import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "جار التحميل" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
