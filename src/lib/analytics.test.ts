import { describe, it, expect, beforeEach } from "vitest";
import {
  toISODate,
  formatKoreanDate,
  daysSince,
  getRiskLevel,
  getRiskLabel,
  getAverageTicket,
  getConversionRate,
  estimateCustomerValue,
  estimateCampaignImpact,
  pickDailyTip,
  AVERAGE_TICKET_STORAGE_KEY,
  CONVERSION_RATE_STORAGE_KEY,
} from "./analytics";

beforeEach(() => {
  window.localStorage.clear();
});

describe("toISODate — 저장되는 날짜는 전부 이 형태여야 한다", () => {
  it("Date를 YYYY-MM-DD로 자른다", () => {
    expect(toISODate(new Date("2026-09-12T05:10:15.074Z"))).toBe("2026-09-12");
  });

  it("이미 날짜 문자열이면 그대로 돌려준다 (멱등)", () => {
    expect(toISODate("2026-09-12")).toBe("2026-09-12");
    expect(toISODate(toISODate("2026-09-12"))).toBe("2026-09-12");
  });

  it("ISO 타임스탬프 문자열도 날짜로 자른다", () => {
    expect(toISODate("2026-09-12T23:59:59.999Z")).toBe("2026-09-12");
  });

  it("파싱 불가능한 값은 빈 문자열 — 잘못된 날짜를 저장하느니 비운다", () => {
    expect(toISODate("어제")).toBe("");
  });

  it("인자가 없으면 오늘(UTC)", () => {
    expect(toISODate()).toBe(new Date().toISOString().slice(0, 10));
  });

  it("결과는 formatKoreanDate가 그대로 받을 수 있다", () => {
    expect(formatKoreanDate(toISODate("2026-09-12T05:10:15.074Z"))).toBe("2026.09.12");
  });
});

describe("formatKoreanDate", () => {
  it("null/undefined는 '-'를 반환한다", () => {
    expect(formatKoreanDate(null)).toBe("-");
    expect(formatKoreanDate(undefined)).toBe("-");
  });

  it("파싱 불가능한 문자열은 '-'를 반환한다", () => {
    expect(formatKoreanDate("not-a-date")).toBe("-");
  });

  it("유효한 날짜는 YYYY.MM.DD 로 포맷한다", () => {
    expect(formatKoreanDate("2026-03-05T00:00:00")).toBe("2026.03.05");
  });
});

describe("daysSince", () => {
  it("null/undefined는 null을 반환한다", () => {
    expect(daysSince(null)).toBeNull();
    expect(daysSince(undefined)).toBeNull();
  });

  it("파싱 불가능한 문자열은 null을 반환한다", () => {
    expect(daysSince("not-a-date")).toBeNull();
  });

  it("음수가 나오지 않도록 0으로 클램프한다(미래 날짜)", () => {
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    expect(daysSince(future)).toBe(0);
  });
});

describe("getRiskLevel — 경계값", () => {
  it("null이면 none — 한 번도 안 온 사람은 '주의'가 아니다", () => {
    expect(getRiskLevel(null)).toBe("none");
  });

  it("14일은 ok, 15일은 warn (경계 바로 위/아래)", () => {
    expect(getRiskLevel(14)).toBe("ok");
    expect(getRiskLevel(15)).toBe("warn");
  });

  it("30일은 warn, 31일은 danger (경계 바로 위/아래)", () => {
    expect(getRiskLevel(30)).toBe("warn");
    expect(getRiskLevel(31)).toBe("danger");
  });

  it("0일은 ok", () => {
    expect(getRiskLevel(0)).toBe("ok");
  });
});

describe("getRiskLabel", () => {
  it("각 레벨에 맞는 한글 라벨을 반환한다", () => {
    expect(getRiskLabel("none")).toBe("방문 전");
    expect(getRiskLabel("ok")).toBe("안정");
    expect(getRiskLabel("warn")).toBe("주의");
    expect(getRiskLabel("danger")).toBe("이탈 위험");
  });
});

describe("getAverageTicket / getConversionRate — localStorage 기반 설정값", () => {
  it("저장된 값이 없으면 기본값을 반환한다", () => {
    expect(getAverageTicket()).toBe(10000);
    expect(getConversionRate()).toBe(0.08);
  });

  it("유효한 저장값은 그대로 사용한다", () => {
    window.localStorage.setItem(AVERAGE_TICKET_STORAGE_KEY, "15000");
    window.localStorage.setItem(CONVERSION_RATE_STORAGE_KEY, "0.2");
    expect(getAverageTicket()).toBe(15000);
    expect(getConversionRate()).toBe(0.2);
  });

  it("잘못된 값(0 이하, 숫자 아님, 범위 밖)은 기본값으로 폴백한다", () => {
    window.localStorage.setItem(AVERAGE_TICKET_STORAGE_KEY, "-500");
    expect(getAverageTicket()).toBe(10000);

    window.localStorage.setItem(AVERAGE_TICKET_STORAGE_KEY, "not-a-number");
    expect(getAverageTicket()).toBe(10000);

    // 전환율은 0~1 사이여야 한다 — 범위를 벗어나면 기본값
    window.localStorage.setItem(CONVERSION_RATE_STORAGE_KEY, "1.5");
    expect(getConversionRate()).toBe(0.08);
  });
});

describe("estimateCustomerValue", () => {
  it("방문 0회면 평균/총액 모두 0이다", () => {
    const result = estimateCustomerValue(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.averagePerVisit).toBe(0);
  });

  it("방문 횟수 × 평균 객단가로 총매출을 계산한다", () => {
    const result = estimateCustomerValue(5);
    expect(result.totalRevenue).toBe(5 * result.averageTicket);
    expect(result.averagePerVisit).toBe(result.averageTicket);
  });
});

describe("estimateCampaignImpact", () => {
  it("발송 0건이면 예상 재방문·매출도 0이다", () => {
    const result = estimateCampaignImpact(0);
    expect(result.estimatedReturn).toBe(0);
    expect(result.estimatedRevenue).toBe(0);
  });

  it("발송 건수 × 전환율로 예상 재방문을 반올림 계산한다", () => {
    window.localStorage.setItem(CONVERSION_RATE_STORAGE_KEY, "0.1");
    const result = estimateCampaignImpact(25);
    expect(result.estimatedReturn).toBe(Math.round(25 * 0.1));
  });
});

describe("pickDailyTip", () => {
  it("빈 배열이면 빈 문자열을 반환한다", () => {
    expect(pickDailyTip(new Date("2026-01-01"), [])).toBe("");
  });

  it("같은 날짜에는 항상 같은 팁을 반환한다(결정론적)", () => {
    const tips = ["A", "B", "C", "D", "E"];
    const date = new Date("2026-05-20");
    const first = pickDailyTip(date, tips);
    const second = pickDailyTip(new Date("2026-05-20"), tips);
    expect(first).toBe(second);
    expect(tips).toContain(first);
  });
});
