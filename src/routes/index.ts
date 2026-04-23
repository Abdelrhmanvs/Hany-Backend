import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import { authRouter } from "./auth.routes";
import { chatRouter } from "./chat.routes";
import { ttsRouter } from "./tts.routes";

export const apiRouter = Router();

apiRouter.get("/health", getHealth);
apiRouter.use("/auth", authRouter);
apiRouter.use("/chat", chatRouter);
apiRouter.use("/tts", ttsRouter);
