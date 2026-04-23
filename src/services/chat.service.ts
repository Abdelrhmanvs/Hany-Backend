import { Types } from "mongoose";
import { ChatModel } from "../models/chat.model";
import { MessageModel } from "../models/message.model";
import { sendMessageToAI } from "./ai.service";
import { AppError } from "../utils/app-error";

type CreateChatInput = {
  userId: string;
  title: string;
  firstMessage?: string;
};

type GetChatsInput = {
  page: number;
  limit: number;
};

type SendMessageInput = {
  userId: string;
  chatId: string;
  content: string;
};

type ChatResponse = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
};

type MessageResponse = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

const mapChat = (chat: {
  _id: unknown;
  userId: unknown;
  title: string;
  createdAt: Date;
}): ChatResponse => ({
  id: String(chat._id),
  userId: String(chat.userId),
  title: chat.title,
  createdAt: chat.createdAt,
});

const mapMessage = (message: {
  _id: unknown;
  chatId: unknown;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}): MessageResponse => ({
  id: String(message._id),
  chatId: String(message.chatId),
  role: message.role,
  content: message.content,
  createdAt: message.createdAt,
});

const ensureValidChatId = (chatId: string): void => {
  if (!Types.ObjectId.isValid(chatId)) {
    throw new AppError("Invalid chat id", 400);
  }
};

const getOwnedChat = async (chatId: string, userId: string) => {
  ensureValidChatId(chatId);
  const chat = await ChatModel.findOne({ _id: chatId, userId });
  if (!chat) {
    throw new AppError("Chat not found", 404);
  }
  return chat;
};

export const chatService = {
  async getChats(
    userId: string,
    input: GetChatsInput,
  ): Promise<{ chats: ChatResponse[]; hasMore: boolean }> {
    const skip = (input.page - 1) * input.limit;
    const chats = await ChatModel.find({ userId })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(input.limit + 1);

    const hasMore = chats.length > input.limit;
    const pageChats = hasMore ? chats.slice(0, input.limit) : chats;

    return {
      chats: pageChats.map(mapChat),
      hasMore,
    };
  },

  async createChat(input: CreateChatInput): Promise<{ chat: ChatResponse }> {
    const chat = await ChatModel.create({
      userId: input.userId,
      title: input.title.trim(),
    });

    if (input.firstMessage?.trim()) {
      await MessageModel.create({
        chatId: chat._id,
        role: "user",
        content: input.firstMessage.trim(),
      });
    }

    return { chat: mapChat(chat) };
  },

  async getChatMessages(
    userId: string,
    chatId: string,
  ): Promise<{ chat: ChatResponse; messages: MessageResponse[] }> {
    const chat = await getOwnedChat(chatId, userId);
    const messages = await MessageModel.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });

    return {
      chat: mapChat(chat),
      messages: messages.map(mapMessage),
    };
  },

  async sendMessage(input: SendMessageInput): Promise<{
    userMessage: MessageResponse;
    assistantMessage: MessageResponse;
    aiResponse: string;
  }> {
    if (!input.content.trim()) {
      throw new AppError("content is required", 400);
    }

    const chat = await getOwnedChat(input.chatId, input.userId);

    const userMessage = await MessageModel.create({
      chatId: chat._id,
      role: "user",
      content: input.content.trim(),
    });

    const historyMessages = await MessageModel.find({ chatId: chat._id }).sort({
      createdAt: 1,
    });

    let aiReply = "";
    try {
      aiReply = await sendMessageToAI(
        historyMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      );
    } catch (_error) {
      throw new AppError("Failed to generate AI response", 502);
    }

    const assistantMessage = await MessageModel.create({
      chatId: chat._id,
      role: "assistant",
      content: aiReply,
    });

    return {
      userMessage: mapMessage(userMessage),
      assistantMessage: mapMessage(assistantMessage),
      aiResponse: assistantMessage.content,
    };
  },
};
