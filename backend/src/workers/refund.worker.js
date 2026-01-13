import { Worker } from "bullmq";
import connection from "../config/redis.js";
import pool from "../config/db.js";
import { webhookQueue } from "../jobs/webhook.queue.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

new Worker(
  "refunds",
  async (job) => {
    const { refundId, paymentId, amount } = job.data;

    console.log("🔄 Processing refund:", refundId);

    await sleep(1000);

    await pool.query(
      `UPDATE refunds
       SET status='success', processed_at=NOW()
       WHERE id=$1`,
      [refundId]
    );

    const result = await pool.query(
      `INSERT INTO webhook_logs
       (merchant_id, event, payload, status, webhook_url, webhook_secret)
       VALUES ($1,$2,$3,'pending',$4,$5)
       RETURNING id`,
      [
        "00000000-0000-0000-0000-000000000001",
        "refund.success",
        {
          event: "refund.success",
          data: { refundId, paymentId, amount },
          timestamp: Math.floor(Date.now() / 1000),
        },
        "http://host.docker.internal:4000/webhook",
        "whsec_test_abc123",
      ]
    );

    await webhookQueue.add("deliver-webhook", {
      webhookLogId: result.rows[0].id,
    });
  },
  { connection }
);

console.log("🚀 Refund worker started");