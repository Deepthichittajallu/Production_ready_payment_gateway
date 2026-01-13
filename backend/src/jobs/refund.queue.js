import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const refundQueue = new Queue("refunds", { connection });