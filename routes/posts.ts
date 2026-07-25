import express from "express";
import {prisma} from '../lib/prisma';

export const router=express.Router()

// postApi for games
 router.post("/games", async(req,res)=>{
     
    const gameSchema = z.object({
        name: z.string().trim().min(1, "Name is required"),
        description: z.string().trim().optional(),
        image: z.string().trim().pipe(z.url()),
        logo: z.string().trim().pipe(z.url()),
        badge: z.string().trim().pipe(z.url())
    })
    const gamedata =gameSchema.parse(req.body);
     const id=res.locals.game.id;
   const game = await prisma.post.create({
      data: {
    name: gamedata.name,
    image: gamedata.image,
    logo: gamedata.logo,
    badge: gamedata.badge,
    description: gamedata.description,
}
    });
})

