import express from "express";
import app from "../backend/src/app";

const server = express();
server.use(express.json());
server.use("/api", app);

server.get("/", (_req, res) => {
  res.json({ success: true, message: "Backend API is running. Use /api/auth, /api/users, /api/products." });
});

export default server;
