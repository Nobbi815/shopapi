import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { auth } from "../middlewares/auth";
import { deleteCachedKey, getCachedJson, setCachedJson } from "../lib/redis";

export const router = express.Router();

const flagSchema = z.object({
  key: z.string().trim().min(2),
  enabled: z.boolean().optional(),
  description: z.string().trim().optional(),
});

const cacheKey = "feature-flags:all";

const isDev = process.env.NODE_ENV !== 'production';

router.get("/feature-flags", async (_req, res) => {
  try {
    const flags = await getCachedJson("feature-flags:all", async () => {
      return prisma.featureFlag.findMany({ orderBy: { createdAt: "desc" } });
    }, 120);

    return res.json({ success: true, data: flags });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Unable to load feature flags" });
  }
});

router.get("/feature-flags/:key", async (req, res) => {
  try {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) {
      return res.status(400).json({ success: false, error: "Feature flag key is required" });
    }

    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      return res.status(404).json({ success: false, error: "Feature flag not found" });
    }
    return res.json({ success: true, data: flag });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Unable to load feature flag" });
  }
});

router.post("/feature-flags", auth, async (req, res) => {
  try {
    const user = res.locals.user as { id: number; role?: string };
    if (user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const parsed = flagSchema.parse(req.body);
    const flag = await prisma.featureFlag.create({ data: { ...parsed, enabled: parsed.enabled ?? false } });
    await deleteCachedKey(cacheKey);
    return res.status(201).json({ success: true, data: flag });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Unable to create feature flag" });
  }
});

router.patch("/feature-flags/:key", auth, async (req, res) => {
  try {
    const user = res.locals.user as { id: number; role?: string };
    if (user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) {
      return res.status(400).json({ success: false, error: "Feature flag key is required" });
    }

    const parsed = flagSchema.partial().parse(req.body);
    const flag = await prisma.featureFlag.update({
      where: { key },
      data: parsed,
    });
    await deleteCachedKey(cacheKey);
    return res.json({ success: true, data: flag });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Unable to update feature flag" });
  }
});

router.delete("/feature-flags/:key", auth, async (req, res) => {
  try {
    const user = res.locals.user as { id: number; role?: string };
    if (user.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    if (!key) {
      return res.status(400).json({ success: false, error: "Feature flag key is required" });
    }

    await prisma.featureFlag.delete({ where: { key } });
    await deleteCachedKey(cacheKey);
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Unable to delete feature flag" });
  }
});

// DEV-only routes: allow local development to manage flags without auth.
if (isDev) {
  router.post('/dev/feature-flags', async (req, res) => {
    try {
      const parsed = flagSchema.parse(req.body);
      const flag = await prisma.featureFlag.create({ data: { ...parsed, enabled: parsed.enabled ?? false } });
      await deleteCachedKey(cacheKey);
      return res.status(201).json({ success: true, data: flag });
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Unable to create feature flag (dev)' });
    }
  });

  router.patch('/dev/feature-flags/:key', async (req, res) => {
    try {
      const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
      if (!key) {
        return res.status(400).json({ success: false, error: 'Feature flag key is required' });
      }

      const parsed = flagSchema.partial().parse(req.body);
      const flag = await prisma.featureFlag.update({ where: { key }, data: parsed });
      await deleteCachedKey(cacheKey);
      return res.json({ success: true, data: flag });
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Unable to update feature flag (dev)' });
    }
  });

  router.delete('/dev/feature-flags/:key', async (req, res) => {
    try {
      const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
      if (!key) {
        return res.status(400).json({ success: false, error: 'Feature flag key is required' });
      }

      await prisma.featureFlag.delete({ where: { key } });
      await deleteCachedKey(cacheKey);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Unable to delete feature flag (dev)' });
    }
  });
}
