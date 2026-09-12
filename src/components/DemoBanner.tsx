import { isDemoMode } from "@/supabaseClient";

/**
 * 데모 모드임을 화면에 밝힌다.
 *
 * 데모 데이터를 조용히 보여주면, 보는 사람은 이게 진짜 가게 데이터라고 믿는다.
 * 데이터의 출처는 화면이 스스로 말해야 한다.
 */
const DemoBanner = () => {
  if (!isDemoMode) return null;

  return (
    <div
      role="status"
      data-testid="demo-banner"
      className="bg-amber-100 text-amber-900 text-xs px-4 py-2 text-center border-b border-amber-200"
    >
      <strong className="font-semibold">데모 데이터</strong>로 실행 중입니다 — 실제 가게 데이터가 아닙니다.
      <span className="hidden sm:inline">
        {" "}
        Supabase 환경변수(<code className="font-mono">.env</code>)를 설정하면 실제 데이터로 연결됩니다.
      </span>
    </div>
  );
};

export default DemoBanner;
