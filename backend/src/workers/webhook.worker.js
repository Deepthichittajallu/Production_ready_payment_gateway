import { Worker } from "bullmq";
import axios from "axios";
import connection from "../config/redis.js";
import pool from "../config/db.js";
import { generateSignature } from "../utils/webhookSignature.js";

function getRetryDelay(attempt) {
  if (process.env.WEBHOOK_RETRY_INTERVALS_TEST === "true") {
    return [0, 5000, 10000, 15000, 20000][attempt - 1] || null;
  }
  return [0, 60000, 300000, 1800000, 7200000][attempt - 1] || null;
}

new Worker(
  "webhooks",
  async (job) => {
    const { webhookLogId } = job.data;

    const { rows } = await pool.query(
      "SELECT * FROM webhook_logs WHERE id=$1",
      [webhookLogId]
    );
    if (!rows.length) return;

    const log = rows[0];
    const attempts = log.attempts + 1;

    try {
      const payloadStr = JSON.stringify(log.payload);
      const signature = generateSignature(
        payloadStr,
        log.webhook_secret
      );

      const response = await axios.post(log.webhook_url, payloadStr, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        timeout: 5000,
      });

      await pool.query(
        `UPDATE webhook_logs
         SET status='success',
             attempts=$1,
             response_code=$2,
             last_attempt_at=NOW()
         WHERE id=$3`,
        [attempts, response.status, webhookLogId]
      );
    } catch (err) {
      const delay = getRetryDelay(attempts);

      if (attempts >= 5 || delay === null) {
        await pool.query(
          `UPDATE webhook_logs
           SET status='failed',
               attempts=$1,
               last_attempt_at=NOW()
           WHERE id=$2`,
          [attempts, webhookLogId]
        );
        return;
      }

      const nextRetry = new Date(Date.now() + delay);

      await pool.query(
        `UPDATE webhook_logs
         SET attempts=$1,
             last_attempt_at=NOW(),
             next_retry_at=$2
         WHERE id=$3`,
        [attempts, nextRetry, webhookLogId]
      );

      throw err;
    }
  },
  { connection }
);

console.log("🚀 Webhook worker started");