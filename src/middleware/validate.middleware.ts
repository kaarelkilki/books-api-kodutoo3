// Üldine request validation helper Zodile
import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      res.status(400).json({
        error: "Validation Error",
        details: err instanceof ZodError ? err.errors : [],
      });
    }
  };
}
