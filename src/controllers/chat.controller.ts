import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { chatService } from "../services/chat.service";
import { AppError } from "../utils/app-error";

const getUserIdFromRequest = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  return userId;
};

const normalizeChatId = (value: string | string[] | undefined): string => {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? value[0] : value;
};

const normalizePage = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const normalizeLimit = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), 50);
};

export const getChats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  const page = normalizePage(req.query.page, 1);
  const limit = normalizeLimit(req.query.limit, 10);
  const result = await chatService.getChats(userId, { page, limit });

  res.status(200).json({
    success: true,
    data: {
      chats: result.chats,
      hasMore: result.hasMore,
      page,
      limit,
    },
  });
};

export const createChat = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  const { title, firstMessage } = req.body as {
    title?: string;
    firstMessage?: string;
  };

  if (!title?.trim()) {
    throw new AppError("title is required", 400);
  }

  const result = await chatService.createChat({
    userId,
    title,
    firstMessage,
  });

  res.status(201).json({
    success: true,
    message: "Chat created successfully",
    data: {
      chat: result.chat,
    },
  });
};

export const getChatMessages = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  const chatId = normalizeChatId(req.params.id);
  const result = await chatService.getChatMessages(userId, chatId);

  res.status(200).json({
    success: true,
    data: {
      chat: result.chat,
      messages: result.messages,
    },
  });
};

export const sendChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  const chatId = normalizeChatId(req.params.id);
  const { content } = req.body as { content?: string };

  if (!content?.trim()) {
    throw new AppError("content is required", 400);
  }

  const result = await chatService.sendMessage({
    userId,
    chatId,
    content,
  });

  res.status(200).json({
    success: true,
    data: {
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
      aiResponse: result.aiResponse,
    },
  });
};

export const sendChatMessageByBody = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = getUserIdFromRequest(req);
  const { chatId: rawChatId, content } = req.body as {
    chatId?: string;
    content?: string;
  };
  const chatId = normalizeChatId(rawChatId);

  if (!content?.trim()) {
    throw new AppError("content is required", 400);
  }

  const result = await chatService.sendMessage({
    userId,
    chatId,
    content,
  });

  res.status(200).json({
    success: true,
    data: {
      aiResponse: result.aiResponse,
      assistantMessage: result.assistantMessage,
      userMessage: result.userMessage,
    },
  });
};
