import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import paymentsRoutes from "./routes/payments.routes.js";
import refundsRoutes from "./routes/refunds.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import captureRoutes from "./routes/capture.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/payments", paymentsRoutes);
app.use("/api/v1/refunds", refundsRoutes);
app.use("/api/v1/payments", captureRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/sdk",
  express.static(path.join(__dirname, "../public/sdk"))
);
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "not connected" });
  }
});

export default app;