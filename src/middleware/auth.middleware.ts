import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

type JwtPayload = {
  sub: string;
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = Request & {
  user?: { userId: string };
};

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  if (!env.jwtSecret) {
    throw new AppError("JWT_SECRET is required", 500);
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    if (!payload.sub) {
      throw new AppError("Invalid token payload", 401);
    }

    req.user = { userId: payload.sub };
    next();
  } catch (_error) {
    throw new AppError("Invalid or expired token", 401);
  }
};
