import { Schema, Types, model, type InferSchemaType } from "mongoose";

const chatSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type ChatDocument = InferSchemaType<typeof chatSchema>;
export const ChatModel = model<ChatDocument>("Chat", chatSchema);
