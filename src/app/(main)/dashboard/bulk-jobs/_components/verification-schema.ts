import { z } from "zod";

export const verificationSchema = z.object({
  id: z.string(),
  email: z.string(),
  result: z.enum(["Valid", "Invalid", "Risky", "Unknown"]),
  quality: z.string(),
  type: z.string(),
  suggestion: z.string(),
  credits: z.number(),
  date: z.string(),
});

export type Verification = z.infer<typeof verificationSchema>;
