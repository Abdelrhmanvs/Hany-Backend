import express from "express";
import { apiRateLimiter, corsMiddleware, helmetMiddleware } from "./config/security";
import { sanitizeInput } from "./middleware/sanitize.middleware";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(apiRateLimiter);
app.use(express.json());
app.use(sanitizeInput);

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
