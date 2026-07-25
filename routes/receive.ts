
import express from "express";
import {prisma} from '../lib/prisma';

export const router=express.Router()

router.post("/transfer",async(req,res)=>{
   const amount=req.body?.amount;
   
})

