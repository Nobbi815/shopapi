import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { hashPassword, signJwt, verifyPassword } from "../services/authService";
import { sanitizeUser } from "../utils/sanitize";

const registrationSchema = z.object({
  name: z.string().trim().min(1),
  username: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
  bio: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registrationSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: "Email or username already exists" });
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        bio: data.bio,
        password: await hashPassword(data.password),
      },
    });

    const token = signJwt({ id: user.id, role: user.role });
    return res.status(201).json({ success: true, user: sanitizeUser(user as Record<string, unknown>), token });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !(await verifyPassword(data.password, user.password))) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = signJwt({ id: user.id, role: user.role });
    return res.json({ success: true, user: sanitizeUser(user as Record<string, unknown>), token });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (res.locals.user as { id: number }).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
}
