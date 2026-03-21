import { useNavigate } from "react-router-dom";

type Props = {
  targetCount: number;
};

// 대시보드 최상단에서 오늘 해야 할 행동을 한 줄로 알려주는 배너
export const DashboardTopBanner = ({ targetCount }: Props) => {
  const navigate = useNavigate();

  if (targetCount <= 0) return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/coupon", { state: { autoSegment: "churn" } })}
      className="w-full mb-3 rounded-2xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-left flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
    >
      <div>
        <p className="text-xs font-semibold text-primary">
          오늘 재방문 유도 대상 {targetCount}명 있어요.
        </p>
        <p className="text-[11px] text-primary/80">
          지금 간단한 쿠폰 한 번만 보내도 도움이 됩니다.
        </p>
      </div>
      <span className="text-[11px] font-semibold text-primary underline">
        지금 보내기
      </span>
    </button>
  );
};

