import { verificationSchema } from "./verification-schema";
import { bulkJobsData } from "./bulk-jobs-data";

// Mock verification data
const verificationData = [
  {
    id: "job1-1",
    email: "customer1@example.com",
    result: "Valid" as const,
    quality: "Excellent",
    type: "Personal",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 09:05 AM",
  },
  {
    id: "job1-2",
    email: "customer2@example.com",
    result: "Valid" as const,
    quality: "Good",
    type: "Corporate",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 09:04 AM",
  },
  {
    id: "job1-3",
    email: "invalid@fake.com",
    result: "Invalid" as const,
    quality: "Poor",
    type: "Unknown",
    suggestion: "Do not send",
    credits: 1,
    date: "2025-01-15 09:03 AM",
  },
  {
    id: "job2-1",
    email: "subscriber1@newsletter.com",
    result: "Valid" as const,
    quality: "Excellent",
    type: "Personal",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 10:05 AM",
  },
  {
    id: "job2-2",
    email: "subscriber2@newsletter.com",
    result: "Valid" as const,
    quality: "Good",
    type: "Corporate",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-15 10:04 AM",
  },
  {
    id: "job2-3",
    email: "spam@newsletter.com",
    result: "Invalid" as const,
    quality: "Poor",
    type: "Unknown",
    suggestion: "Do not send",
    credits: 1,
    date: "2025-01-15 10:03 AM",
  },
  {
    id: "job3-1",
    email: "prospect1@lead.com",
    result: "Valid" as const,
    quality: "Excellent",
    type: "Corporate",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-14 03:35 PM",
  },
  {
    id: "job3-2",
    email: "prospect2@lead.com",
    result: "Valid" as const,
    quality: "Good",
    type: "Personal",
    suggestion: "Safe to send",
    credits: 1,
    date: "2025-01-14 03:34 PM",
  },
  {
    id: "job3-3",
    email: "bounce@lead.com",
    result: "Invalid" as const,
    quality: "Poor",
    type: "Unknown",
    suggestion: "Do not send",
    credits: 1,
    date: "2025-01-14 03:33 PM",
  },
];

// Mock verification data for each job
const jobVerificationsMap: Record<string, typeof verificationData> = {
  "1": verificationData.slice(0, 3),
  "2": verificationData.slice(3, 6),
  "3": verificationData.slice(6, 9),
  "4": [],
};

const parsedVerifications = verificationData.map((v) => verificationSchema.parse(v));

export function getJobVerifications(jobId: string) {
  const verifications = jobVerificationsMap[jobId] || [];
  return verifications.map((v) => verificationSchema.parse(v));
}

export function getAllJobVerifications() {
  return parsedVerifications;
}