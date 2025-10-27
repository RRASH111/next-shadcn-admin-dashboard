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

export const bulkJobSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  status: z.enum(["Processing", "Completed", "Failed"]),
  totalEmails: z.number(),
  processedEmails: z.number(),
  validEmails: z.number(),
  invalidEmails: z.number(),
  createdAt: z.string(),
});

export type Verification = z.infer<typeof verificationSchema>;
export type BulkJob = z.infer<typeof bulkJobSchema>;
