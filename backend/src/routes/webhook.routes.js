import express from "express";
import { retryWebhook } from "../controllers/webhookRetry.controller.js";
import { listWebhookLogs } from "../controllers/webhookLogs.controller.js";


const router = express.Router();
router.get("/", listWebhookLogs);
router.post("/:webhook_id/retry", retryWebhook);

export default router;