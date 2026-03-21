import { supabase } from "@/supabaseClient";
import type { CustomerGrade } from "@/lib/mockData";

export type DbCustomer = {
  id: string;
  name: string;
  phone: string | null;
  grade: string | null;
  visit_count: number | null;
  last_visit: string | null;
  memo: string | null;
  created_at: string;
};

export type DbCoupon = {
  id: string;
  message: string;
  target_grade: string | null;
  sent_count: number | null;
  scheduled_at: string | null;
  created_at: string;
};

export type CustomerSummary = {
  id: string;
  name: string;
  phone: string;
  grade: CustomerGrade;
  visitCount: number;
  lastVisit: string;
  memo: string;
};

export type CouponHistoryItem = {
  id: string;
  title: string;
  sentAt: string;
  targetGrade: CustomerGrade | "전체";
  sentCount: number;
};

export type AppSettings = {
  naverApiKey: string;
  kakaoChannelId: string;
};

const toCustomerGrade = (grade: string | null): CustomerGrade => {
  if (grade === "VIP" || grade === "단골" || grade === "일반") return grade;
  return "일반";
};

export async function fetchCustomers(): Promise<CustomerSummary[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, grade, visit_count, last_visit, memo, created_at")
    .order("last_visit", { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data || []).map((c: DbCustomer) => ({
    id: c.id,
    name: c.name,
    phone: c.phone ?? "",
    grade: toCustomerGrade(c.grade),
    visitCount: c.visit_count ?? 0,
    lastVisit: c.last_visit ?? "",
    memo: c.memo ?? "",
  }));
}

export async function fetchCustomerById(id: string): Promise<CustomerSummary | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, grade, visit_count, last_visit, memo, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  const c = data as DbCustomer;

  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? "",
    grade: toCustomerGrade(c.grade),
    visitCount: c.visit_count ?? 0,
    lastVisit: c.last_visit ?? "",
    memo: c.memo ?? "",
  };
}

export async function createCustomer(input: {
  name: string;
  phone: string;
}): Promise<CustomerSummary> {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone: input.phone,
      grade: "일반",
      visit_count: 0,
      last_visit: null,
      memo: "",
    })
    .select("id, name, phone, grade, visit_count, last_visit, memo, created_at")
    .single();

  if (error) {
    throw error;
  }

  const c = data as DbCustomer;

  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? "",
    grade: toCustomerGrade(c.grade),
    visitCount: c.visit_count ?? 0,
    lastVisit: c.last_visit ?? "",
    memo: c.memo ?? "",
  };
}

export async function updateCustomerVisit(id: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("customers")
    .select("visit_count")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  const currentVisitCount = (existing as { visit_count: number | null } | null)?.visit_count ?? 0;

  const { error } = await supabase
    .from("customers")
    .update({
      visit_count: currentVisitCount + 1,
      last_visit: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function updateCustomerProfile(input: {
  id: string;
  grade: CustomerGrade;
  memo: string;
}): Promise<void> {
  const { error } = await supabase
    .from("customers")
    .update({
      grade: input.grade,
      memo: input.memo,
    })
    .eq("id", input.id);

  if (error) {
    throw error;
  }
}

export async function createCouponLog(input: {
  message: string;
  target: CustomerGrade | "전체";
  sentCount: number;
  scheduledAt: string | null;
}): Promise<void> {
  const { error } = await supabase.from("coupons").insert({
    message: input.message,
    target_grade: input.target === "전체" ? null : input.target,
    sent_count: input.sentCount,
    scheduled_at: input.scheduledAt,
  });

  if (error) {
    throw error;
  }
}

export async function fetchCouponHistory(): Promise<CouponHistoryItem[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("id, message, target_grade, sent_count, scheduled_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((c: DbCoupon) => ({
    id: c.id,
    title: c.message,
    sentAt: c.scheduled_at ?? c.created_at,
    targetGrade: (c.target_grade as CustomerGrade | null) ?? "전체",
    sentCount: c.sent_count ?? 0,
  }));
}

const SETTINGS_ID = "default";

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("naver_api_key, kakao_channel_id")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    // 테이블이 없거나 첫 실행인 경우를 위해 기본값 반환
    return {
      naverApiKey: "",
      kakaoChannelId: "",
    };
  }

  return {
    naverApiKey: (data?.naver_api_key as string | null) ?? "",
    kakaoChannelId: (data?.kakao_channel_id as string | null) ?? "",
  };
}

export async function saveSettings(input: AppSettings): Promise<void> {
  const { error } = await supabase.from("settings").upsert(
    {
      id: SETTINGS_ID,
      naver_api_key: input.naverApiKey,
      kakao_channel_id: input.kakaoChannelId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}


