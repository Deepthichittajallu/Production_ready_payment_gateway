import axios from "axios";
import crypto from "crypto";
import pool from "../config/db.js";

const TEST_RETRY_DELAYS = [0, 5, 10, 15, 20]; // seconds
const MAX_ATTEMPTS = TEST_RETRY_DELAYS.length;

const signPayload = (payload, secret) => {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const processWebhook = async (log) => {
  const {
    id,
    webhook_url,
    webhook_secret,
    payload,
    attempts,
  } = log;

  const signature = signPayload(JSON.stringify(payload), webhook_secret);

  try {
    const res = await axios.post(webhook_url, payload, {
      headers: {
        "X-Signature": signature,
      },
      timeout: 5000,
    });

    await pool.query(
      `UPDATE webhook_logs
       SET status='delivered',
           response_code=$1,
           response_body=$2,
           last_attempt_at=NOW()
       WHERE id=$3`,
      [res.status, JSON.stringify(res.data), id]
    );

  } catch (err) {
    const nextAttempt = attempts + 1;

    if (nextAttempt >= MAX_ATTEMPTS) {
      await pool.query(
        `UPDATE webhook_logs
         SET status='failed',
             response_code=$1,
             response_body=$2,
             attempts=$3,
             last_attempt_at=NOW()
         WHERE id=$4`,
        [
          err.response?.status || 500,
          err.message,
          nextAttempt,
          id,
        ]
      );
      return;
    }

    const delay = TEST_RETRY_DELAYS[nextAttempt] * 1000;
    await sleep(delay);

    await pool.query(
      `UPDATE webhook_logs
       SET attempts=$1,
           last_attempt_at=NOW(),
           next_retry_at=NOW() + ($2 || ' seconds')::interval
       WHERE id=$3`,
      [nextAttempt, `${TEST_RETRY_DELAYS[nextAttempt]} seconds`, id]
    );

    await processWebhook({
      ...log,
      attempts: nextAttempt,
    });
  }
};

(async () => {
  console.log("🚀 Webhook retry worker started");

  const { rows } = await pool.query(
    `SELECT *
     FROM webhook_logs
     WHERE status='pending'
     ORDER BY created_at ASC`
  );

  for (const log of rows) {
    await processWebhook(log);
  }
})();