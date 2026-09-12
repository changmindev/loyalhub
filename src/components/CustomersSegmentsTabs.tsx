import { useSearchParams } from "react-router-dom";

export type CustomerSegmentKey = "all" | "vip" | "churn" | "this-week";

const SEGMENTS: { key: CustomerSegmentKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "vip", label: "VIP" },
  { key: "churn", label: "이탈 위험" },
  { key: "this-week", label: "이번 주 방문" },
];

type Props = {
  value?: CustomerSegmentKey;
  onChange?: (seg: CustomerSegmentKey) => void;
};

// 고객 리스트 상단에서 빠르게 세그먼트를 바꾸기 위한 탭
export const CustomersSegmentsTabs = ({ value, onChange }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const current: CustomerSegmentKey =
    value || (searchParams.get("seg") as CustomerSegmentKey) || "all";

  const handleClick = (key: CustomerSegmentKey) => {
    const next = key;
    const nextParams = new URLSearchParams(searchParams);
    if (next === "all") {
      nextParams.delete("seg");
    } else {
      nextParams.set("seg", next);
    }
    setSearchParams(nextParams, { replace: true });
    onChange?.(next);
  };

  return (
    // 선택 상태를 aria-pressed 로도 내보낸다.
    // 예전에는 활성 여부가 Tailwind 클래스(bg-primary vs bg-secondary)에만 있어서
    // 스크린리더는 무엇이 선택됐는지 알 수 없었고, 자동화는 클래스 이름에
    // 기대야 했다 — 디자인을 손대는 순간 조용히 깨지는 종류의 의존이다.
    <div
      role="group"
      aria-label="고객 세그먼트"
      className="flex gap-2 mb-3 overflow-x-auto"
    >
      {SEGMENTS.map((s) => {
        const isActive = current === s.key;
        return (
          <button
            key={s.key}
            data-testid={`segment-tab-${s.key}`}
            type="button"
            aria-pressed={isActive}
            onClick={() => handleClick(s.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

