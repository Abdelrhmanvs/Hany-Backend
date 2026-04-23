import { z } from "zod";

export const createChatSchema = z.object({
  title: z.string().min(1).max(120),
  firstMessage: z.string().min(1).max(5000).optional(),
});

export const chatIdParamSchema = z.object({
  id: z.string().min(1),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const sendMessageWithChatSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().min(1).max(5000),
});
