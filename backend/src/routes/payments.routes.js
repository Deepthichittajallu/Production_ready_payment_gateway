import express from "express";
import { createPayment } from "../controllers/payments.controller.js";

const router = express.Router();
router.post("/", createPayment);

export default router;