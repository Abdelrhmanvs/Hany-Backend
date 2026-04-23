import OpenAI from "openai";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const createOpenAIClient = (): OpenAI => {
  if (!env.openaiApiKey) {
    throw new AppError("OPENAI_API_KEY is required", 500);
  }

  return new OpenAI({ apiKey: env.openaiApiKey });
};

export const sendMessageToAI = async (messages: AIMessage[]): Promise<string> => {
  if (messages.length === 0) {
    throw new AppError("At least one message is required", 400);
  }

  const client = createOpenAIClient();

  const completion = await client.chat.completions.create({
    model: env.openaiModel,
    messages,
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new AppError("AI response is empty", 502);
  }

  return content;
};

export const textToSpeech = async (input: string): Promise<string> => {
  const text = input.trim();
  if (!text) {
    throw new AppError("Text is required for TTS", 400);
  }

  const client = createOpenAIClient();
  const response = await client.audio.speech.create({
    model: env.openaiTtsModel,
    voice: "alloy",
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString("base64");
};
