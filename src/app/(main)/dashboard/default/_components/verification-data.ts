import { verificationSchema, bulkJobSchema } from "./verification-schema";

export const mockVerifications = [
  {
    id: "1",
    email: "john.doe@example.com",
    result: "Valid" as const,
    quality: "Good",
    type: "Personal",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 10:30 AM",
  },
  {
    id: "2",
    email: "support@company.com",
    result: "Valid" as const,
    quality: "Excellent",
    type: "Corporate",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 10:25 AM",
  },
  {
    id: "3",
    email: "invalid@fake-mail.com",
    result: "Invalid" as const,
    quality: "Poor",
    type: "Unknown",
    suggestion: "Do not send",
    credits: 1,
    date: "2025-01-15 10:20 AM",
  },
  {
    id: "4",
    email: "risky@temp-mail.com",
    result: "Risky" as const,
    quality: "Fair",
    type: "Temporary",
    suggestion: "Use with caution",
    credits: 1,
    date: "2025-01-15 10:15 AM",
  },
];

export const mockBulkJobs = [
  {
    id: "1",
    fileName: "customer_list.csv",
    status: "Completed" as const,
    totalEmails: 500,
    processedEmails: 500,
    validEmails: 450,
    invalidEmails: 50,
    createdAt: "2025-01-15 09:00 AM",
  },
  {
    id: "2",
    fileName: "newsletter_subscribers.csv",
    status: "Processing" as const,
    totalEmails: 1000,
    processedEmails: 675,
    validEmails: 600,
    invalidEmails: 75,
    createdAt: "2025-01-15 10:00 AM",
  },
  {
    id: "3",
    fileName: "prospect_list.csv",
    status: "Completed" as const,
    totalEmails: 250,
    processedEmails: 250,
    validEmails: 220,
    invalidEmails: 30,
    createdAt: "2025-01-14 03:30 PM",
  },
  {
    id: "4",
    fileName: "failed_batch.csv",
    status: "Failed" as const,
    totalEmails: 100,
    processedEmails: 0,
    validEmails: 0,
    invalidEmails: 0,
    createdAt: "2025-01-14 02:00 PM",
  },
];

export const verificationsData = mockVerifications.map((v) => verificationSchema.parse(v));
export const bulkJobsData = mockBulkJobs.map((j) => bulkJobSchema.parse(j));
