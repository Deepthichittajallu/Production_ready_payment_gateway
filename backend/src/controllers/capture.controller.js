import pool from "../config/db.js";

export const capturePayment = async (req, res) => {
  const { payment_id } = req.params;

  // fetch payment
  const result = await pool.query(
    `SELECT status, captured
     FROM payments
     WHERE id = $1`,
    [payment_id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const payment = result.rows[0];

  if (payment.status !== "success") {
    return res.status(400).json({
      error: "Payment not successful yet",
    });
  }

  if (payment.captured) {
    return res.status(400).json({
      error: "Payment already captured",
    });
  }

  await pool.query(
    `UPDATE payments
     SET captured = true, updated_at = NOW()
     WHERE id = $1`,
    [payment_id]
  );

  res.json({
    id: payment_id,
    status: "captured",
  });
};