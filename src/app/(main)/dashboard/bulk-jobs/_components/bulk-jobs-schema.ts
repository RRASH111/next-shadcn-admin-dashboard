import { z } from "zod";

export const bulkJobSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  status: z.enum(["Processing", "Completed", "Failed"]),
  totalEmails: z.number(),
  processedEmails: z.number(),
  validEmails: z.number(),
  riskyEmails: z.number(),
  invalidEmails: z.number(),
  createdAt: z.string(),
});

export type BulkJob = z.infer<typeof bulkJobSchema>;
