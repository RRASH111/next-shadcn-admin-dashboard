import { z } from "zod";

// Email validation
export const emailSchema = z.string().email("Invalid email address");

// Single verification request
export const singleVerificationSchema = z.object({
  email: emailSchema,
  timeout: z.number().min(2).max(60).optional().default(20),
});

// Bulk file validation
export const bulkFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.type === "text/csv" || file.name.endsWith(".csv"), "File must be a CSV file")
    .refine(
      (file) => file.size <= 50 * 1024 * 1024, // 50MB limit
      "File size must be less than 50MB",
    ),
});

// Bulk job filters
export const bulkJobFiltersSchema = z.object({
  offset: z.number().min(0).optional(),
  limit: z.number().min(1).max(50).optional().default(50),
  id: z.string().optional(),
  name: z.string().optional(),
  status: z.enum(["in_progress", "error", "finished", "canceled", "paused", "in_queue_to_start"]).optional(),
  updated_at_from: z.string().optional(),
  updated_at_to: z.string().optional(),
  createdate_from: z.string().optional(),
  createdate_to: z.string().optional(),
  percent_from: z.number().min(0).max(100).optional(),
  percent_to: z.number().min(0).max(100).optional(),
  has_error: z.enum(["1", "t", "T", "TRUE", "True", "true", "0", "f", "F", "FALSE", "False", "false"]).optional(),
});

// Download filters
export const downloadFilterSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  filter: z.enum(["ok", "ok_and_catch_all", "unknown", "invalid", "all", "custom"]).default("all"),
  statuses: z.string().optional(),
  free: z.enum(["1", "0"]).optional(),
  role: z.enum(["1", "0"]).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(1000).default(50),
});

// Verification history filters
export const verificationHistoryFiltersSchema = z.object({
  ...paginationSchema.shape,
  email: z.string().optional(),
  result: z.enum(["ok", "catch_all", "unknown", "error", "disposable", "invalid"]).optional(),
  quality: z.enum(["good", "bad", "risky"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// API key validation
export const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

// Credit purchase schema
export const creditPurchaseSchema = z.object({
  packageId: z.string().min(1, "Package ID is required"),
  credits: z.number().min(1, "Credits must be positive"),
  price: z.number().min(0, "Price must be non-negative"),
});

export type SingleVerificationRequest = z.infer<typeof singleVerificationSchema>;
export type BulkFileRequest = z.infer<typeof bulkFileSchema>;
export type BulkJobFilters = z.infer<typeof bulkJobFiltersSchema>;
export type DownloadFilter = z.infer<typeof downloadFilterSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type VerificationHistoryFilters = z.infer<typeof verificationHistoryFiltersSchema>;
export type ApiKeyRequest = z.infer<typeof apiKeySchema>;
export type CreditPurchaseRequest = z.infer<typeof creditPurchaseSchema>;
