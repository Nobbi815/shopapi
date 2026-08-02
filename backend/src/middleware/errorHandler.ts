import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: error.issues.map((issue) => issue.message).join(", "),
    });
  }

  // Prisma types or exports may vary between versions; avoid importing Prisma types
  // and detect known Prisma errors by shape.
  if (typeof error === "object" && error !== null && "code" in error) {
    const anyErr = error as any;
    if (anyErr.code === "P2002") {
      return res.status(409).json({ success: false, error: "A record with that value already exists" });
    }
  }

  if (error instanceof Error) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }

  res.status(500).json({ success: false, error: "Unexpected server error" });
}
