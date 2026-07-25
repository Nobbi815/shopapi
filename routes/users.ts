import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const router = express.Router();

import { auth } from "../middlewares/auth";

const sanitizeUser = (user: Record<string, unknown>) => {
  const { password, ...rest } = user;
  return rest;
};

router.get("/verify", auth, async (_req, res) => {
  const id = res.locals.user.id as number;
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  return res.json({ success: true, user: sanitizeUser(user as Record<string, unknown>) });
});

router.post("/login", async (req, res) => {
  const loginSchema = z.object({
    username: z.string().trim().min(1),
    password: z.string().trim().min(1),
  });

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "username and password are required" });
  }

  const { username, password } = parsed.data;
  // Some generated Prisma clients may not mark `username` as a unique field
  // (client types can become out of sync with schema). Use findFirst to
  // locate the user by username or email to ensure login works regardless
  // of the generated type expectations.
  const user = await prisma.user.findFirst({ where: { username } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
    return res.json({ success: true, user: sanitizeUser(user as Record<string, unknown>), token });
  }

  return res.status(401).json({ success: false, error: "invalid username or password" });
});

router.post("/users", async (req, res) => {
  const registrationSchema = z.object({
    name: z.string().trim().min(1),
    username: z.string().trim().min(3),
    email: z.string().trim().email(),
    password: z.string().trim().min(6),
    bio: z.string().trim().optional(),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
  });

  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "name, username, email, password and role are required" });
  }

  const { name, username, email, password, bio, role } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) {
    return res.status(409).json({ success: false, error: "username or email already exists" });
  }

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      bio,
      role,
      password: await bcrypt.hash(password, 10),
    },
  });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
  return res.status(201).json({ success: true, user: sanitizeUser(user as Record<string, unknown>), token });
});

router.delete('/users/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, error: 'Invalid user id' });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  await prisma.user.delete({ where: { id } });
  return res.json({ success: true });
});
