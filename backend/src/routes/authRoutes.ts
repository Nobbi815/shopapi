import express from "express";
import { login, me, register } from "../controllers/authController";
import { auth } from "../middleware/auth";

export const authRouter = express.Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.get("/auth/me", auth, me);
