import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: error.issues.map((issue) => issue.message).join(", "),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, error: "A record with that value already exists" });
    }
  }

  if (error instanceof Error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }

  res.status(500).json({ success: false, error: "Unexpected server error" });
}
