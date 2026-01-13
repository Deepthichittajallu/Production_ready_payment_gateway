import { Worker } from "bullmq";
import connection from "../config/redis.js";
import pool from "../config/db.js";
import { webhookQueue } from "../jobs/webhook.queue.js";

const webhookUrl = "http://host.docker.internal:4000/webhook";
const webhookSecret = "whsec_test_abc123";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

new Worker(
  "payments",
  async (job) => {
    const { paymentId } = job.data;

    console.log("🔄 Processing payment:", paymentId);

    // simulate delay
    const delay =
      process.env.TEST_MODE === "true"
        ? Number(process.env.TEST_PROCESSING_DELAY || 1000)
        : Math.floor(Math.random() * 5000) + 5000;

    await sleep(delay);

    // determine success
    const success =
      process.env.TEST_MODE === "true"
        ? process.env.TEST_PAYMENT_SUCCESS !== "false"
        : Math.random() < 0.9;

    // update payment status
    if (success) {
      await pool.query(
        `UPDATE payments SET status='success', updated_at=NOW() WHERE id=$1`,
        [paymentId]
      );
    } else {
      await pool.query(
        `UPDATE payments
         SET status='failed',
             error_code='PAYMENT_FAILED',
             error_description='Payment failed'
         WHERE id=$1`,
        [paymentId]
      );
    }

    // create webhook log
    const result = await pool.query(
      `INSERT INTO webhook_logs
       (merchant_id, event, payload, status, webhook_url, webhook_secret)
       VALUES ($1,$2,$3,'pending',$4,$5)
       RETURNING id`,
      [
        "00000000-0000-0000-0000-000000000001",
        success ? "payment.success" : "payment.failed",
        {
          event: success ? "payment.success" : "payment.failed",
          data: { paymentId },
          timestamp: Math.floor(Date.now() / 1000),
        },
        webhookUrl,
        webhookSecret,
      ]
    );

    // enqueue webhook delivery
    await webhookQueue.add("deliver-webhook", {
      webhookLogId: result.rows[0].id,
    });
  },
  { connection }
);

console.log("🚀 Payment worker started");