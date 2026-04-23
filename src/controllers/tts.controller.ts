import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { textToSpeech } from "../services/ai.service";
import { AppError } from "../utils/app-error";

export const generateSpeech = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user?.userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { text } = req.body as { text?: string };
  if (!text?.trim()) {
    throw new AppError("text is required", 400);
  }

  const audioBase64 = await textToSpeech(text);

  res.status(200).json({
    success: true,
    data: {
      audioBase64,
      mimeType: "audio/mpeg",
    },
  });
};
