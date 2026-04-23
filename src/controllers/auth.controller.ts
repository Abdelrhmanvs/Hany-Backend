import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { AppError } from "../utils/app-error";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    throw new AppError("name, email, and password are required", 400);
  }

  const result = await authService.signup({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: result.user,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token: result.token,
      user: result.user,
    },
  });
};
