/**
 * 데모 모드 저장소.
 *
 * Supabase 환경변수가 없을 때 supabaseApi 가 대신 호출하는 구현이다.
 * 화면·컴포넌트는 데모 여부를 몰라도 되고, 분기는 supabaseApi 한 곳에만 있다.
 *
 * localStorage 에 쓰는 이유: 고객을 추가하고 새로고침했더니 사라지면
 * 데모가 아니라 고장으로 보인다. 화면을 다녀와도 상태가 유지돼야 한다.
 */

import { couponHistory as seedCoupons, customers as seedCustomers } from "@/lib/mockData";
import type {
  AppSettings,
  CouponHistoryItem,
  CustomerSummary,
} from "@/lib/supabaseApi";
import type { CustomerGrade } from "@/lib/mockData";

const STORAGE_KEY = "loyalhub:demo";

type DemoState = {
  customers: CustomerSummary[];
  coupons: CouponHistoryItem[];
  settings: AppSettings;
};

function seed(): DemoState {
  return {
    customers: seedCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      grade: c.grade,
      visitCount: c.visitCount,
      lastVisit: c.lastVisit,
      memo: c.memo,
    })),
    coupons: seedCoupons.map((c) => ({
      id: c.id,
      title: c.title,
      sentAt: c.sentAt,
      targetGrade: c.targetGrade,
      sentCount: c.sentCount,
    })),
    settings: { naverApiKey: "", kakaoChannelId: "" },
  };
}

function load(): DemoState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Partial<DemoState>;
    // 저장된 형태가 깨졌으면 시드로 되돌린다. 반쯤 비어 있는 화면보다 낫다.
    if (!Array.isArray(parsed.customers) || !Array.isArray(parsed.coupons)) return seed();
    return {
      customers: parsed.customers,
      coupons: parsed.coupons,
      settings: parsed.settings ?? { naverApiKey: "", kakaoChannelId: "" },
    };
  } catch {
    return seed();
  }
}

let state: DemoState = load();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장이 안 돼도 화면은 계속 돈다. 데모 데이터라 잃어도 되는 값이다.
  }
}

/** 데모 데이터를 시드 상태로 되돌린다. 테스트가 각 케이스를 독립적으로 시작할 때 쓴다. */
export function resetDemoData() {
  state = seed();
  persist();
}

const byRecentVisit = (a: CustomerSummary, b: CustomerSummary) =>
  (b.lastVisit || "").localeCompare(a.lastVisit || "");

export const demoStore = {
  async fetchCustomers(): Promise<CustomerSummary[]> {
    return [...state.customers].sort(byRecentVisit);
  },

  async fetchCustomerById(id: string): Promise<CustomerSummary | null> {
    return state.customers.find((c) => c.id === id) ?? null;
  },

  async createCustomer(input: { name: string; phone: string }): Promise<CustomerSummary> {
    const created: CustomerSummary = {
      id: `demo-${state.customers.length + 1}-${input.phone.slice(-4)}`,
      name: input.name,
      phone: input.phone,
      grade: "일반",
      visitCount: 0,
      lastVisit: "",
      memo: "",
    };
    state.customers = [created, ...state.customers];
    persist();
    return created;
  },

  async updateCustomerVisit(id: string): Promise<void> {
    state.customers = state.customers.map((c) =>
      c.id === id
        ? { ...c, visitCount: c.visitCount + 1, lastVisit: new Date().toISOString() }
        : c,
    );
    persist();
  },

  async updateCustomerProfile(input: {
    id: string;
    grade: CustomerGrade;
    memo: string;
  }): Promise<void> {
    state.customers = state.customers.map((c) =>
      c.id === input.id ? { ...c, grade: input.grade, memo: input.memo } : c,
    );
    persist();
  },

  async createCouponLog(input: {
    message: string;
    target: CustomerGrade | "전체";
    sentCount: number;
    scheduledAt: string | null;
  }): Promise<void> {
    state.coupons = [
      {
        id: `demo-coupon-${state.coupons.length + 1}`,
        title: input.message,
        sentAt: input.scheduledAt ?? new Date().toISOString(),
        targetGrade: input.target,
        sentCount: input.sentCount,
      },
      ...state.coupons,
    ];
    persist();
  },

  async fetchCouponHistory(): Promise<CouponHistoryItem[]> {
    return [...state.coupons];
  },

  async fetchSettings(): Promise<AppSettings> {
    return { ...state.settings };
  },

  async saveSettings(input: AppSettings): Promise<void> {
    state.settings = { ...input };
    persist();
  },
};
