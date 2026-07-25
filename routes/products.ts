import express from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth } from '../middlewares/auth';

export const router = express.Router();

const createProductSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  image: z.string().trim().url().optional(),
  logo: z.string().trim().url().optional(),
  badge: z.string().trim().optional()
});

const editProductSchema = createProductSchema.partial();

router.get('/games', async (_req, res) => {
  const games = await prisma.game.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: games });
});

router.get('/games/:id', async (req, res) => {
  const game = await prisma.game.findUnique({ where: { id: Number(req.params.id) } });
  if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
  return res.json({ success: true, data: game });
});

router.get('/apps', async (_req, res) => {
  const apps = await prisma.app.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: apps });
});

router.get('/powerpoints', async (_req, res) => {
  const slides = await prisma.powerpoint.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: slides });
});

router.post('/games', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = createProductSchema.parse(req.body);
  const game = await prisma.game.create({ data: { name: parsed.name, description: parsed.description, badge: parsed.badge, image: parsed.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', logo: parsed.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80' } });
  return res.status(201).json({ success: true, data: game });
});

router.patch('/games/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = editProductSchema.parse(req.body);
  const game = await prisma.game.update({ where: { id: Number(req.params.id) }, data: parsed });
  return res.json({ success: true, data: game });
});

router.delete('/games/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  await prisma.game.delete({ where: { id: Number(req.params.id) } });
  return res.json({ success: true });
});

router.post('/apps', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = createProductSchema.parse(req.body);
  const app = await prisma.app.create({ data: { name: parsed.name, description: parsed.description, badge: parsed.badge, image: parsed.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', logo: parsed.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80' } });
  return res.status(201).json({ success: true, data: app });
});

router.patch('/apps/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = editProductSchema.parse(req.body);
  const app = await prisma.app.update({ where: { id: Number(req.params.id) }, data: parsed });
  return res.json({ success: true, data: app });
});

router.delete('/apps/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  await prisma.app.delete({ where: { id: Number(req.params.id) } });
  return res.json({ success: true });
});

router.post('/powerpoints', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = createProductSchema.parse(req.body);
  const powerpoint = await prisma.powerpoint.create({ data: { name: parsed.name, description: parsed.description, badge: parsed.badge, image: parsed.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', logo: parsed.logo || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80' } });
  return res.status(201).json({ success: true, data: powerpoint });
});

router.patch('/powerpoints/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  const parsed = editProductSchema.parse(req.body);
  const powerpoint = await prisma.powerpoint.update({ where: { id: Number(req.params.id) }, data: parsed });
  return res.json({ success: true, data: powerpoint });
});

router.delete('/powerpoints/:id', auth, async (req, res) => {
  const user = res.locals.user as { role?: string };
  if (user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Admin access required' });
  await prisma.powerpoint.delete({ where: { id: Number(req.params.id) } });
  return res.json({ success: true });
});
