import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/app-error";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const toAuthUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  createdAt: Date;
}): AuthUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const signToken = (userId: string): string => {
  if (!env.jwtSecret) {
    throw new AppError("JWT_SECRET is required", 500);
  }

  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "7d" });
};

export const authService = {
  async signup(input: SignupInput): Promise<{ user: AuthUser }> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError("Email is already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return { user: toAuthUser(user) };
  },

  async login(input: LoginInput): Promise<{ token: string; user: AuthUser }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    return {
      token: signToken(String(user._id)),
      user: toAuthUser(user),
    };
  },
};
