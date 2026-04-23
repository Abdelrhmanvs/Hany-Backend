import { Schema, Types, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type MessageDocument = InferSchemaType<typeof messageSchema>;
export const MessageModel = model<MessageDocument>("Message", messageSchema);
