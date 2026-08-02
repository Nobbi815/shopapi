import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: Record<string, unknown>) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyJwt<T extends Record<string, unknown>>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as T;
}
