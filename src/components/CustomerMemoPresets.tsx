const DEFAULT_PRESETS = [
  "알레르기",
  "선호 스타일",
  "주의사항",
  "대화 주제",
  "직업",
  "단골 포인트",
];

type Props = {
  onInsert: (text: string) => void;
  presets?: string[];
};

// 메모 작성 시 자주 쓰는 키워드를 빠르게 넣어주는 프리셋 버튼 모음
export const CustomerMemoPresets = ({ onInsert, presets }: Props) => {
  const items = presets && presets.length > 0 ? presets : DEFAULT_PRESETS;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onInsert(p)}
          className="rounded-full border bg-muted px-2.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/80 active:scale-[0.97] transition-transform"
        >
          {p}
        </button>
      ))}
    </div>
  );
};

