import type { NextFunction, Request, Response } from "express";

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const sanitizedObject: Record<string, unknown> = {};

    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      if (key.startsWith("$") || key.includes(".")) {
        return;
      }

      sanitizedObject[key] = sanitizeValue(entry);
    });

    return sanitizedObject;
  }

  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  req.body = sanitizeValue(req.body) as Request["body"];
  req.params = sanitizeValue(req.params) as Request["params"];
  req.query = sanitizeValue(req.query) as Request["query"];
  next();
};
