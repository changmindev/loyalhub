import type { RiskLevel } from "@/lib/analytics";
import { getRiskLabel } from "@/lib/analytics";

const styles: Record<RiskLevel, string> = {
  ok: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export const RiskBadge = ({ level }: { level: RiskLevel }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[level]}`}
    >
      {getRiskLabel(level)}
    </span>
  );
};

