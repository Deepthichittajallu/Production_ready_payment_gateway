import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { refundQueue } from "../jobs/refund.queue.js";

export const createRefund = async (req, res) => {
  const { payment_id, amount, reason } = req.body;

  const refundId = "rfnd_" + uuidv4().replace(/-/g, "").slice(0, 16);

  await pool.query(
    `INSERT INTO refunds
     (id, payment_id, merchant_id, amount, reason, status)
     VALUES ($1,$2,$3,$4,$5,'pending')`,
    [
      refundId,
      payment_id,
      "00000000-0000-0000-0000-000000000001",
      amount,
      reason,
    ]
  );

  await refundQueue.add("process-refund", {
    refundId,
    paymentId: payment_id,
    amount,
  });

  res.status(201).json({
    id: refundId,
    status: "pending",
  });
};