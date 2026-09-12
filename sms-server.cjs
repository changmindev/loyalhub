/**
 * 🔴 참고 구현 — 실행되지 않습니다. 데모 범위 밖입니다.
 *
 * 이 파일은 "문자 발송을 붙인다면 이렇게 붙는다"를 보여주는 설계 흔적입니다.
 * 실제로 돌려본 적이 없고, 돌아가지도 않습니다:
 *
 *   · express · coolsms-node-sdk · dotenv 가 package.json 에 없습니다.
 *     `node sms-server.cjs` 를 실행하면 MODULE_NOT_FOUND 로 즉시 종료됩니다.
 *   · 실제 발송에는 건당 비용 + 발신번호 사전등록(통신사 심사)이 필요합니다.
 *
 * 프런트엔드(`src/lib/sms.ts`)는 데모 모드에서 이 서버를 **호출하지 않습니다.**
 * 네트워크 요청 자체를 만들지 않으므로, 실수로 문자가 나갈 경로가 없습니다.
 *
 * 되살리려면: 위 3개 패키지를 설치하고, COOLSMS_* 환경변수를 채우고,
 * `VITE_SUPABASE_*` 를 설정해 데모 모드를 해제해야 합니다.
 */

const express = require("express");
const { config, msg } = require("coolsms-node-sdk");
require("dotenv").config();

config.init({
  apiKey: process.env.COOLSMS_API_KEY,
  apiSecret: process.env.COOLSMS_API_SECRET,
});

const app = express();
app.use(express.json());

app.post("/api/send-sms", async (req, res) => {
  const { text, customers } = req.body || {};
  const from = process.env.COOLSMS_FROM_NUMBER;

  if (!text || !Array.isArray(customers)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  if (!from) {
    return res.status(400).json({ error: "COOLSMS_FROM_NUMBER is not set" });
  }

  try {
    const messages = customers.map((c) => ({
      to: String(c.phone || "").replace(/-/g, ""),
      from,
      text,
    }));

    const result = await msg.send({ messages });
    res.json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("SMS send error:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

const port = process.env.SMS_SERVER_PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SMS server listening on http://localhost:${port}`);
});

