import { Queue } from "bullmq";
import connection from "../config/redis.js";

export const paymentQueue = new Queue("payments", {
  connection,
});