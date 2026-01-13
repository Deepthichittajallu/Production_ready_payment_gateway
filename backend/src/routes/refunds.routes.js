import express from "express";
import { createRefund } from "../controllers/refunds.controller.js";

const router = express.Router();
router.post("/", createRefund);

export default router;