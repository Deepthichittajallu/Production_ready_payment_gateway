import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";
import { paymentQueue } from "../jobs/payment.queue.js";

export const createPayment = async (req, res) => {
  const { order_id, method, vpa } = req.body;

  const paymentId = "pay_" + uuidv4().replace(/-/g, "").slice(0, 16);

  await pool.query(
    `INSERT INTO payments 
     (id, order_id, merchant_id, amount, method, vpa, status)
     VALUES ($1,$2,$3,$4,$5,$6,'pending')`,
    [paymentId, order_id, "00000000-0000-0000-0000-000000000001", 50000, method, vpa]
  );

  await paymentQueue.add("process-payment", {
    paymentId,
  });

  res.status(201).json({
    id: paymentId,
    status: "pending",
  });
};