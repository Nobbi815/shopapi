import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { hashPassword } from "../services/authService";
import { sanitizeUser } from "../utils/sanitize";

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  bio: z.string().trim().optional(),
  password: z.string().trim().min(6).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required to update the user",
});

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid user id" });
    }

    const requester = res.locals.user as { id: number; role?: string };
    if (!requester || (requester.id !== id && requester.role !== "ADMIN")) {
      return res.status(403).json({ success: false, error: "Not allowed to view this user" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user id" });
    }

    const requester = res.locals.user as { id: number; role?: string };
    if (!requester || (requester.id !== userId && requester.role !== "ADMIN")) {
      return res.status(403).json({ success: false, error: "Not allowed to update this user" });
    }

    const data = updateUserSchema.parse(req.body);

    if (data.role && requester.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Only admins can update user roles" });
    }

    const safeData: Record<string, unknown> = {
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.role ? { role: data.role } : {}),
    };

    if (data.password) {
      safeData.password = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: safeData,
    });

    return res.json({ success: true, user: sanitizeUser(updatedUser as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ success: false, error: "Invalid user id" });
    }

    await prisma.user.delete({ where: { id: userId } });
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
