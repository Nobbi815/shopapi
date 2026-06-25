import express from "express";
import {prisma} from '../lib/prisma';

export const router=express.Router()

router.get("/posts",async (req,res)=>{
    const posts=await prisma.post.findMany({
        orderBy:{id:"desc"},
        take:20,
        include:{
            user:true,
            comments:true
        }
    })
    res.json(posts)
})

