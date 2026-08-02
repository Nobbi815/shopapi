import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../services/authService";

export interface AuthPayload extends Record<string, unknown> {
  id: number;
  role: "USER" | "ADMIN" | string;
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Missing authorization token" });
  }

  try {
    const payload = verifyJwt<AuthPayload>(token);
    res.locals.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
