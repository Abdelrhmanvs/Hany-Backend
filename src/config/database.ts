import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });
};
