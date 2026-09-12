/**
 * 문자 발송 — 🔴 데모 버전에서는 실제로 보내지 않는다.
 *
 * 실제 발송은 이 프로젝트의 범위 밖이다:
 *   · 건당 비용이 든다
 *   · 발신번호 사전등록(통신사 심사)을 통과해야 한다
 *   · 남의 번호로 잘못 나가면 되돌릴 수 없다
 *
 * `sms-server.cjs` 는 "이렇게 붙인다"를 보여주는 참고 구현이고,
 * 의존성(express·coolsms-node-sdk)이 설치돼 있지 않아 **실행되지 않는다.**
 *
 * 그래서 데모 모드에서는 네트워크 요청 자체를 만들지 않는다.
 * 예전에는 여기서 `/api/send-sms` 로 요청이 나갔고, 404 를 받아
 * 발송이 실패하면서 **발송 이력조차 남지 않았다.**
 *
 * ⚠️ 자동화(E2E)가 실제 발송 경로를 밟지 않도록 막는 것도 이 함수의 역할이다.
 * 수동 플래그 하나에 의존하면 플래그를 빠뜨린 날 진짜 문자가 나간다.
 */

import { isDemoMode } from "@/supabaseClient";

const isTestMode = import.meta.env.VITE_SMS_TEST_MODE === "true";

/** 실제 발송을 시도하지 않는 조건. 데모이거나 테스트 모드이면 가로챈다. */
export const isSmsBlocked = isDemoMode || isTestMode;

export type SmsResult =
  /** 실제로 발송을 시도해 성공했다 */
  | { delivered: true }
  /** 발송하지 않았다. 화면은 이 사실을 사용자에게 밝혀야 한다 */
  | { delivered: false; reason: "demo" | "test-mode" };

type SmsTarget = {
  name: string;
  phone: string;
};

export async function sendSmsToCustomers(params: {
  text: string;
  customers: SmsTarget[];
}): Promise<SmsResult> {
  const { text, customers } = params;

  if (isSmsBlocked) {
    const reason = isDemoMode ? "demo" : "test-mode";
    // 무엇이 나갔을 뻔했는지는 남긴다. 조용히 삼키면 디버깅이 불가능해진다.
    console.info(
      `[SMS ${reason}] 실제 발송 없음 — 대상 ${customers.length}명 / 내용: ${text}`,
    );
    return { delivered: false, reason };
  }

  const response = await fetch("/api/send-sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      customers,
    }),
  });

  if (!response.ok) {
    throw new Error("SMS 발송에 실패했습니다");
  }

  return { delivered: true };
}
