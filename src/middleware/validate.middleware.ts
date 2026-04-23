import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type ValidationTarget = "body" | "params" | "query";

export const validate =
  <T>(schema: ZodSchema<T>, target: ValidationTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const error = new Error("Validation failed");
      (error as Error & { statusCode?: number; details?: unknown }).statusCode = 400;
      (error as Error & { statusCode?: number; details?: unknown }).details =
        result.error.flatten();
      next(error);
      return;
    }

    req[target] = result.data as Request[ValidationTarget];
    next();
  };
