import { z } from "zod";

export const ttsSchema = z.object({
  text: z.string().min(1).max(4000),
});
