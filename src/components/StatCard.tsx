import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
  /** E2E 셀렉터. 값 부분에 붙는다 — 라벨 문구가 바뀌어도 테스트가 안 깨지도록. */
  testId?: string;
  /** 벤토 그리드에서 한 칸만 강조할 때. 나머지는 기본(카드) 톤을 유지한다. */
  variant?: 'default' | 'highlight';
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  className = '',
  testId,
  variant = 'default',
}: StatCardProps) => {
  const isHighlight = variant === 'highlight';

  return (
    <div
      className={`rounded-2xl p-4 ${
        isHighlight
          ? 'bg-highlight text-highlight-foreground'
          : 'border bg-card'
      } ${className}`}
    >
      <div
        className={`flex items-center justify-between mb-2 ${
          isHighlight ? 'text-highlight-foreground/80' : 'text-accent-strong'
        }`}
      >
        <span className="text-xs font-semibold">{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="font-display text-2xl font-extrabold tracking-tight">
        <span data-testid={testId}>{value}</span>
        <span
          className={`text-sm font-normal ml-0.5 ${
            isHighlight ? 'text-highlight-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {sub}
        </span>
      </p>
    </div>
  );
};

export default StatCard;
