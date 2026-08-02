import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>, handler: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
