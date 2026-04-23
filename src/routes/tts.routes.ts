import { Router } from "express";
import { generateSpeech } from "../controllers/tts.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { ttsSchema } from "../validation/tts.validation";

export const ttsRouter = Router();

ttsRouter.use(authenticate);

ttsRouter.post("/", validate(ttsSchema), (req, res, next) => {
  void generateSpeech(req, res).catch(next);
});
