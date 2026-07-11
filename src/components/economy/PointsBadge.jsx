import { Coins } from "lucide-react";

export function PointsBadge({ points = 0 }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-black text-gold">
      <Coins className="h-4 w-4" />
      {points} نقطة
    </span>
  );
}
