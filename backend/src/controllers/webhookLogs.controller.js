import pool from "../config/db.js";

export const listWebhookLogs = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, event, status, attempts, created_at
     FROM webhook_logs
     ORDER BY created_at DESC
     LIMIT 50`
  );

  res.json(rows);
};