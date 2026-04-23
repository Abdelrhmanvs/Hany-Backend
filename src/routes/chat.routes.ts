import { Router } from "express";
import {
  createChat,
  getChatMessages,
  getChats,
  sendChatMessage,
  sendChatMessageByBody,
} from "../controllers/chat.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  chatIdParamSchema,
  createChatSchema,
  sendMessageSchema,
  sendMessageWithChatSchema,
} from "../validation/chat.validation";

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get("/", (req, res, next) => {
  void getChats(req, res).catch(next);
});

chatRouter.post("/", validate(createChatSchema), (req, res, next) => {
  void createChat(req, res).catch(next);
});

chatRouter.get("/:id", validate(chatIdParamSchema, "params"), (req, res, next) => {
  void getChatMessages(req, res).catch(next);
});

chatRouter.post(
  "/:id/message",
  validate(chatIdParamSchema, "params"),
  validate(sendMessageSchema),
  (req, res, next) => {
  void sendChatMessage(req, res).catch(next);
  },
);

chatRouter.post("/send", validate(sendMessageWithChatSchema), (req, res, next) => {
  void sendChatMessageByBody(req, res).catch(next);
});
