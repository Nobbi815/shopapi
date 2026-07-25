import { Worker } from "bullmq";
import "dotenv/config";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
};

new Worker(
  "digitalshop-jobs",
  async (job) => {
    console.log(`[worker] processing ${job.name}`, job.data);
    return { ok: true };
  },
  { connection }
);
