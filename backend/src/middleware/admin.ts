import { Request, Response, NextFunction } from "express";

export function admin(req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user as { role?: string } | undefined;

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Admin access required" });
  }

  next();
}
