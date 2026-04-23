import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, signupSchema } from "../validation/auth.validation";

export const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), (req, res, next) => {
  void signup(req, res).catch(next);
});

authRouter.post("/login", validate(loginSchema), (req, res, next) => {
  void login(req, res).catch(next);
});
