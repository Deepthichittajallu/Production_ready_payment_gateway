import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import crypto from "crypto";
import { paymentQueue } from "../jobs/payment.queue.js";

export const createPayment = async (req, res) => {
  const { order_id, method, vpa, amount } = req.body;
  
  const merchantId = "00000000-0000-0000-0000-000000000001";
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: "Invalid amount",
    });
  }

  const idemKey = req.headers["idempotency-key"];

  // STEP 1: Compute request hash
  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (idemKey) {
    // STEP 2: Check existing idempotency key
    const existing = await pool.query(
      `SELECT response
       FROM idempotency_keys
       WHERE key=$1 AND merchant_id=$2
         AND expires_at > NOW()`,
      [idemKey, merchantId]
    );

    if (existing.rows.length > 0) {
      return res.json(existing.rows[0].response);
    }
  }

  // STEP 3: Normal payment creation
  const paymentId = "pay_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

  const result = await pool.query(
    `INSERT INTO payments
    (id, merchant_id, order_id, method, vpa, amount, status)
    VALUES ($1,$2,$3,$4,$5,$6,'pending')
    RETURNING id, status`,
    [paymentId, merchantId, order_id, method, vpa, amount]
  );


  // enqueue payment job (already exists in your code)
  await paymentQueue.add("process-payment", {
    paymentId,
  });

  const response = {
    id: result.rows[0].id,
    status: result.rows[0].status,
  };

  // STEP 4: Store idempotency response
  if (idemKey) {
    await pool.query(
      `INSERT INTO idempotency_keys
       (key, merchant_id, response, expires_at)
       VALUES ($1,$2,$3,NOW() + INTERVAL '24 hours')
       ON CONFLICT (key, merchant_id) DO NOTHING`,
      [idemKey, merchantId, response]
    );
  }

  res.status(201).json(response);
};
