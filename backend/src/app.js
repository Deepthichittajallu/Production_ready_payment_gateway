import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import paymentsRoutes from "./routes/payments.routes.js";
import refundsRoutes from "./routes/refunds.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/refunds", refundsRoutes);

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

export default app;