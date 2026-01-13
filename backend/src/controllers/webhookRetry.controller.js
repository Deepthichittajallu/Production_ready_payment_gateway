import pool from "../config/db.js";
import axios from "axios";
import crypto from "crypto";

const signPayload = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

export const retryWebhook = async (req, res) => {
  const { webhook_id } = req.params;

  const { rows } = await pool.query(
    `SELECT *
     FROM webhook_logs
     WHERE id=$1`,
    [webhook_id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Webhook not found" });
  }

  const log = rows[0];

  if (log.status !== "failed") {
    return res.status(400).json({
      error: "Only failed webhooks can be retried",
    });
  }

  const signature = signPayload(
    JSON.stringify(log.payload),
    log.webhook_secret
  );

  try {
    const response = await axios.post(log.webhook_url, log.payload, {
      headers: { "X-Signature": signature },
      timeout: 5000,
    });

    await pool.query(
      `UPDATE webhook_logs
       SET status='delivered',
           attempts=attempts+1,
           response_code=$1,
           response_body=$2,
           last_attempt_at=NOW()
       WHERE id=$3`,
      [response.status, JSON.stringify(response.data), webhook_id]
    );

    res.json({ status: "delivered" });

  } catch (err) {
    await pool.query(
      `UPDATE webhook_logs
       SET attempts=attempts+1,
           response_code=$1,
           response_body=$2,
           last_attempt_at=NOW()
       WHERE id=$3`,
      [
        err.response?.status || 500,
        err.message,
        webhook_id,
      ]
    );

    res.status(500).json({ status: "retry_failed" });
  }
};