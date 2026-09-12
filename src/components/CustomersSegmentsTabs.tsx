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
    <div className="flex gap-2 mb-3 overflow-x-auto">
      {SEGMENTS.map((s) => (
        <button
          key={s.key}
          data-testid={`segment-tab-${s.key}`}
          type="button"
          onClick={() => handleClick(s.key)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
            current === s.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

