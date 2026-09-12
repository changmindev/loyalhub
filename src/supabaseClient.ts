import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * 환경변수가 없으면 데모 모드로 뜬다.
 *
 * 예전에는 여기서 throw 했다. 그러면 저장소를 클론한 사람이 README 대로
 * `npm run dev` 를 해도 흰 화면만 본다 — 앱이 import 시점에 죽기 때문이다.
 *
 * 대신 데모 모드로 전환하고 화면 상단에 그 사실을 띄운다.
 * 조용히 폴백하지 않는 이유는 아래 isDemoMode 주석 참고.
 */
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

/**
 * 데모 모드에서는 null 이다.
 *
 * ⚠️ 데모 모드는 "환경변수가 없다" 하나만 가리킨다.
 * 환경변수가 있는데 요청이 실패하는 경우는 데모 데이터로 덮지 않고 에러를 그대로 보여준다.
 * 연결 실패를 가짜 데이터로 가리면, 운영에서 DB가 죽어도 화면이 멀쩡해 보인다.
 */
export const supabase: SupabaseClient | null = isDemoMode
  ? null
  : createClient(supabaseUrl as string, supabaseAnonKey as string);

/** 실제 연결이 필요한 지점에서 쓴다. 데모 모드면 호출부가 먼저 걸러야 한다. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase 클라이언트가 없습니다. 데모 모드에서는 demoStore 를 거쳐야 합니다.",
    );
  }
  return supabase;
}
