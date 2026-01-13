import express from "express";
import { capturePayment } from "../controllers/capture.controller.js";

const router = express.Router();

router.post("/:payment_id/capture", capturePayment);

export default router;