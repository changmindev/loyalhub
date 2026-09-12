export type RiskLevel = "ok" | "warn" | "danger";

export const AVERAGE_TICKET_STORAGE_KEY = "loyalhub:avgTicket";
export const CONVERSION_RATE_STORAGE_KEY = "loyalhub:conversionRate";

/**
 * 날짜를 `YYYY-MM-DD` 로 자른다. **저장될 날짜는 전부 이 형태를 거친다.**
 *
 * 예전에는 시드가 `2026-09-12`, 앱이 새로 쓰는 값이 `2026-09-12T05:10:15.074Z` 라
 * 같은 필드에 두 가지 형식이 섞여 있었다. 화면에 날것으로 뿌리는 곳이 있어
 * 대시보드 한 화면에서 `2026-09-12` 와 `2026.09.12` 가 나란히 보였고,
 * 형식을 단언하는 자동화는 무엇을 기대해야 할지 알 수 없었다.
 *
 * ⚠️ 기준은 **UTC** 다. Dashboard 의 '오늘 방문' 판정(`toISOString().slice(0,10)`)과
 * mockData 의 `daysAgo` 가 모두 UTC 라, 여기서 로컬 기준으로 자르면
 * KST 오전 9시 이전에만 하루 어긋나는 종류의 버그가 된다.
 */
export function toISODate(value: Date | string = new Date()): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// 한국식 날짜 포맷 (YYYY.MM.DD)
export function formatKoreanDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

// 특정 날짜로부터 경과일 계산
export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

// 방문 경과일 기준 위험도 레벨 계산
export function getRiskLevel(days: number | null): RiskLevel {
  if (days == null) return "warn";
  if (days <= 14) return "ok";
  if (days <= 30) return "warn";
  return "danger";
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "ok":
      return "안정";
    case "warn":
      return "주의";
    case "danger":
      return "이탈 위험";
    default:
      return "";
  }
}

export function getAverageTicket(): number {
  if (typeof window === "undefined") return 10000;
  const stored = window.localStorage.getItem(AVERAGE_TICKET_STORAGE_KEY);
  const n = stored ? Number(stored) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 10000;
  return Math.round(n);
}

export function estimateCustomerValue(visitCount: number) {
  const avgTicket = getAverageTicket();
  const total = visitCount * avgTicket;
  const averagePerVisit = visitCount > 0 ? total / visitCount : 0;
  // 현재는 개별 방문일자를 알 수 없어, 최근 90일 매출도 전체 매출에서 단순 추정
  const recent90Days = Math.round(total * 0.4);

  return {
    averageTicket: avgTicket,
    totalRevenue: total,
    averagePerVisit,
    recent90Days,
  };
}

// 상대시간 표현 (예: "3일 전", "방금 전")
export function formatRelativeKR(dateStr: string | null | undefined): string {
  const d = dateStr ? new Date(dateStr) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}

export function getConversionRate(): number {
  if (typeof window === "undefined") return 0.08;
  const stored = window.localStorage.getItem(CONVERSION_RATE_STORAGE_KEY);
  const n = stored ? Number(stored) : NaN;
  if (!Number.isFinite(n) || n <= 0 || n > 1) return 0.08;
  return n;
}

// 쿠폰 캠페인 효과 추정
export function estimateCampaignImpact(sentCount: number) {
  const avgTicket = getAverageTicket();
  const conversionRate = getConversionRate();
  const estimatedReturn = Math.round(sentCount * conversionRate);
  const estimatedRevenue = estimatedReturn * avgTicket;

  return {
    avgTicket,
    conversionRate,
    estimatedReturn,
    estimatedRevenue,
  };
}

// 날짜 기준으로 오늘의 팁 선택 (동일 날짜에는 항상 같은 인덱스)
export function pickDailyTip(date: Date, tips: string[]): string {
  if (!tips.length) return "";
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const seed = y * 10000 + m * 100 + d;
  const idx = Math.abs(seed) % tips.length;
  return tips[idx];
}
