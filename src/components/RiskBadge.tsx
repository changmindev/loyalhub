import type { RiskLevel } from "@/lib/analytics";
import { getRiskLabel } from "@/lib/analytics";

// none 은 경고가 아니라 '아직 정보가 없음'이다.
// 노랑·빨강을 주면 이탈 위험처럼 읽히므로 중립 회색으로 둔다.
const styles: Record<RiskLevel, string> = {
  none: "bg-slate-100 text-slate-600",
  ok: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export const RiskBadge = ({ level }: { level: RiskLevel }) => {
  return (
    <span
      data-testid="risk-badge"
      data-risk-level={level}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles[level]}`}
    >
      {getRiskLabel(level)}
    </span>
  );
};

