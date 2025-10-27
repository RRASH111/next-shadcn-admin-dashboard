import { bulkJobSchema } from "./bulk-jobs-schema";

export const mockBulkJobs = [
  {
    id: "1",
    fileName: "customer_list.csv",
    status: "Completed" as const,
    totalEmails: 500,
    processedEmails: 500,
    validEmails: 420,
    riskyEmails: 50,
    invalidEmails: 30,
    createdAt: "2025-01-15 09:00 AM",
  },
  {
    id: "2",
    fileName: "newsletter_subscribers.csv",
    status: "Completed" as const,
    totalEmails: 1000,
    processedEmails: 1000,
    validEmails: 850,
    riskyEmails: 100,
    invalidEmails: 50,
    createdAt: "2025-01-15 10:00 AM",
  },
  {
    id: "3",
    fileName: "prospect_list.csv",
    status: "Completed" as const,
    totalEmails: 250,
    processedEmails: 250,
    validEmails: 180,
    riskyEmails: 40,
    invalidEmails: 30,
    createdAt: "2025-01-14 03:30 PM",
  },
  {
    id: "4",
    fileName: "BlockList - Paylode.csv",
    status: "Completed" as const,
    totalEmails: 878,
    processedEmails: 878,
    validEmails: 367,
    riskyEmails: 90,
    invalidEmails: 421,
    createdAt: "2025-10-26 21:09",
  },
];

export const bulkJobsData = mockBulkJobs.map((j) => bulkJobSchema.parse(j));
