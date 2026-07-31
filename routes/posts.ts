import express from "express";
import { prisma, Prisma } from '../lib/prisma';
import { z } from "zod";

export const router = express.Router();

// postApi for games
router.post("/games", async (req, res) => {
  try {
    const gameSchema = z.object({
      name: z.string().trim().min(1, "Name is required"),
      description: z.string().trim().optional(),
      image: z.string().trim().url(),
      logo: z.string().trim().url(),
      badge: z.string().trim().optional(),
    });

    const gamedata = gameSchema.parse(req.body);

    const game = await prisma.game.create({
      data: gamedata as Prisma.GameCreateInput,
    });

    return res.status(201).json({
      success: true,
      data: game,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

router.post("/apps", async (req, res) => {
  try {
    const appSchema = z.object({
      name: z.string().trim().min(1, "Appname is required"),
      description: z.string().trim().optional(),
      image: z.string().trim().url(),
      badge: z.string().trim().optional(),
      logo: z.string().trim().url(),
    });
    const appdata = appSchema.parse(req.body);

    const app = await prisma.app.create({
      data: appdata as Prisma.AppCreateInput,
    });

    return res.status(201).json({
      success: true,
      data: app,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

router.post("/powerpoints", async (req, res) => {
  try {
    const powerpointSchema = z.object({
      name: z.string().trim().min(1, "Appname is required"),
      description: z.string().trim().optional(),
      image: z.string().trim().url(),
      badge: z.string().trim().optional(),
      logo: z.string().trim().url(),
    });
    const powerpointData = powerpointSchema.parse(req.body);

    const powerpoint = await prisma.powerpoint.create({
      data: powerpointData as Prisma.PowerpointCreateInput,
    });

    return res.status(201).json({
      success: true,
      data: powerpoint,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error,
    });
  }
});

router.get("/games", async (req,res)=>{
    
    const games= await prisma.game.findMany({
      orderBy:{id:"desc"}});
    res.json(games)})

router.get("/games/:id", async(req,res)=>{
    const id =req.params?.id;
    const game= await prisma.game.findUnique({
        where:{
            id:Number(id),
        }    
    });
    res.json(game)
})