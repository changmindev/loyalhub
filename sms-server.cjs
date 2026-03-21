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

