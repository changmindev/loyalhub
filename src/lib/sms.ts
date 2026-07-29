const isTestMode = import.meta.env.VITE_SMS_TEST_MODE === "true";

type SmsTarget = {
  name: string;
  phone: string;
};

export async function sendSmsToCustomers(params: {
  text: string;
  customers: SmsTarget[];
}) {
  const { text, customers } = params;

  if (isTestMode) {
    // 테스트 모드: 실제 발송 없이 콘솔 출력만 수행
    console.log("[SMS TEST MODE] 메시지:", text, "대상:", customers);
    return;
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
}

