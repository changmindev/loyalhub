import { estimateCampaignImpact, formatKoreanDate } from "@/lib/analytics";
import type { CouponHistoryItem } from "@/lib/supabaseApi";

type Props = {
  campaigns: CouponHistoryItem[];
};

// 최근 발송한 쿠폰 캠페인의 예상 효과를 간단한 카드 + 막대로 보여줌
export const CampaignImpactCards = ({ campaigns }: Props) => {
  const top = campaigns.slice(0, 3);
  if (!top.length) return null;

  const maxSent = Math.max(...top.map((c) => c.sentCount || 0), 1);

  return (
    <div className="rounded-2xl border bg-card p-4 mt-4">
      <h2 className="text-sm font-semibold mb-3">최근 캠페인 효과 (추정)</h2>
      <div className="space-y-2">
        {top.map((c) => {
          const impact = estimateCampaignImpact(c.sentCount);
          const ratio = Math.min(1, c.sentCount / maxSent);
          return (
            <div
              key={c.id}
              className="rounded-xl border bg-background px-3 py-2 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold truncate max-w-[60%]">
                  {c.title}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {formatKoreanDate(c.sentAt)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                <div
                  className="h-full bg-primary/80 transition-all"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                발송 {c.sentCount}명 · (추정) 재방문{" "}
                {impact.estimatedReturn.toLocaleString()}명 · 예상 매출{" "}
                {impact.estimatedRevenue.toLocaleString()}원
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        전환율과 객단가는 설정에서 바꿀 수 있으며, 현재 값 기준으로 단순
        추정한 수치입니다.
      </p>
    </div>
  );
};

