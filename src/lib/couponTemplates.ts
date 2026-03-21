export type CouponTemplate = {
  id: string;
  name: string;
  description: string;
  message: string;
  expectedConversion: string;
};

export const couponTemplates: CouponTemplate[] = [
  {
    id: "revisit",
    name: "재방문 유도",
    description: "7일 이상 안 온 손님에게 조용히 한번 더 초대",
    message:
      "[{매장명}] 오랜만이에요! 이번 주 방문 시 음료 1잔 50% 쿠폰 드릴게요. 언제든 편하게 들러주세요 ☕",
    expectedConversion: "5~15% (추정)",
  },
  {
    id: "birthday",
    name: "생일 쿠폰",
    description: "생일 주간에만 사용하는 축하 쿠폰",
    message:
      "[{매장명}] 생일 진심으로 축하드립니다! 이번 주 안에 방문 주시면 디저트 1개 무료로 드릴게요 🎂",
    expectedConversion: "10~20% (추정)",
  },
  {
    id: "noshow",
    name: "노쇼 방지 안내",
    description: "예약 전날 상냥하게 리마인드",
    message:
      "[{매장명}] 내일 예약이 잡혀있어요! 일정 변경이 필요하시면 편하게 답장 또는 전화 주세요 :)",
    expectedConversion: "— (안내용)",
  },
  {
    id: "welcome",
    name: "신규 웰컴",
    description: "첫 방문 후 7일 이내 재방문 유도",
    message:
      "[{매장명}] 첫 방문 감사드려요! 7일 이내 재방문 시 아메리카노 1잔 무료 쿠폰 드립니다 ☕",
    expectedConversion: "8~18% (추정)",
  },
  {
    id: "vip-thanks",
    name: "단골 감사",
    description: "VIP·단골 고객 전용 감사 쿠폰",
    message:
      "[{매장명}] 항상 찾아주셔서 감사합니다. 이번 주 VIP/단골 고객님께는 전 메뉴 1+1 혜택을 드립니다.",
    expectedConversion: "12~25% (추정)",
  },
];

