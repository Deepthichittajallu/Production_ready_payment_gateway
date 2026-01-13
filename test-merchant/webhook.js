import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = "whsec_test_abc123";

app.post("/webhook", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    console.log("❌ Invalid signature");
    return res.status(401).send("Invalid signature");
  }

  console.log("✅ Webhook verified");
  console.log("Event:", req.body.event);
  console.log("Payload:", req.body);

  res.sendStatus(200);
});

app.listen(4000, () => {
  console.log("🟢 Test merchant webhook running on port 4000");
});