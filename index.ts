import express from "express";
import app from "./backend/src/app";
import { env } from "./backend/src/config/env";

const server = express();
server.use("/api", app);

if (!process.env.VERCEL) {
  server.listen(env.port, () => {
    console.log(`Backend running locally at http://localhost:${env.port}`);
  });
}

export default server;