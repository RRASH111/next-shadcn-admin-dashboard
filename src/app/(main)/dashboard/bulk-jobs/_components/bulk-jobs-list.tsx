"use client";

import { useState, useEffect, useRef } from "react";
import { BulkVerificationResult } from "../../default/_components/bulk-verification-result";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, FileText } from "lucide-react";

interface BulkJob {
  fileName: string;
  status: "processing" | "completed" | "stopped";
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  riskyEmails: number;
  invalidEmails: number;
  timestamp: string;
  reportId: string;
}

interface BulkJobsListProps {
  onJobClick: (jobId: string) => void;
}

export function BulkJobsList({ onJobClick }: BulkJobsListProps) {
  const [bulkJobs, setBulkJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBulkJobs = async () => {
    try {
      const response = await fetch("/api/verification/bulk/list");
      if (response.ok) {
        const data = await response.json();
        // Convert MillionVerifier format to our local format
        const jobs: BulkJob[] =
          data.files?.map((file: any) => ({
            fileName: file.file_name,
            status: file.status === "finished" ? "completed" : file.status === "canceled" ? "stopped" : "processing",
            totalEmails: file.total_rows,
            processedEmails: file.verified,
            validEmails: file.ok,
            riskyEmails: file.catch_all,
            invalidEmails: file.invalid + file.disposable + file.unknown,
            timestamp: new Date().toLocaleString(), // You might want to get actual timestamp from API
            reportId: file.file_id,
          })) || [];

        setBulkJobs(jobs);
        setError(null);
      } else {
        const errorData = await response.json();
        // Check if it's a "User not found" error, which means no data yet
        if (errorData.error === "User not found") {
          setBulkJobs([]);
          setError(null); // No error, just no data
        } else {
          setError("Failed to load bulk jobs");
        }
      }
    } catch (error) {
      console.error("Error fetching bulk jobs:", error);
      setError("Failed to load bulk jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkJobs();
  }, []);

  useEffect(() => {
    // Clear existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Only start polling if there are processing jobs
    const hasProcessingJobs = bulkJobs.some((job) => job.status === "processing");

    if (hasProcessingJobs) {
      // Start polling every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchBulkJobs();
      }, 10000);
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [bulkJobs.filter((job) => job.status === "processing").length]);

  const handleStopJob = async (fileName: string) => {
    const job = bulkJobs.find((j) => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch("/api/verification/bulk/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: job.reportId }),
      });

      if (response.ok) {
        // Update the job status to stopped
        setBulkJobs((jobs) =>
          jobs.map((job) => (job.fileName === fileName ? { ...job, status: "stopped" as const } : job)),
        );
      } else {
        console.error("Failed to stop job");
      }
    } catch (error) {
      console.error("Error stopping job:", error);
    }
  };

  const handleDeleteJob = async (fileName: string) => {
    const job = bulkJobs.find((j) => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch("/api/verification/bulk/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId: job.reportId }),
      });

      if (response.ok) {
        setBulkJobs((jobs) => jobs.filter((job) => job.fileName !== fileName));
      } else {
        console.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleDownloadReport = async (
    fileName: string,
    filter: "all" | "ok" | "ok_and_catch_all" | "invalid" | "disposable" | "unknown" = "all",
  ) => {
    const job = bulkJobs.find((j) => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch(`/api/verification/bulk/download?fileId=${job.reportId}&filter=${filter}`);

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Generate filename based on filter
        const filterName = filter === "all" ? "all_results" : filter;
        a.download = `${fileName.replace(".csv", "")}_${filterName}.csv`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download report");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bulk jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-red-600">{error}</p>
        <Button onClick={fetchBulkJobs} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (bulkJobs.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No uploads yet</h3>
        <p className="text-muted-foreground mb-4">Upload a CSV file to start bulk email verification</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bulkJobs.map((job) => {
        if (job.status === "completed") {
          return (
            <BulkVerificationResult
              key={job.reportId}
              fileName={job.fileName}
              timestamp={job.timestamp}
              reportId={job.reportId}
              goodEmails={job.validEmails}
              riskyEmails={job.riskyEmails}
              badEmails={job.invalidEmails}
              totalEmails={job.totalEmails}
              onDelete={() => handleDeleteJob(job.fileName)}
              onDownload={(filter) => handleDownloadReport(job.fileName, filter)}
            />
          );
        } else if (job.status === "stopped") {
          return (
            <Card key={job.reportId}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Mail className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{job.fileName}</h3>
                      <Badge className="bg-gray-500/10 text-gray-500">Stopped</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      {job.totalEmails} emails • Stopped {job.timestamp}
                    </p>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gray-400 transition-all duration-500"
                        style={{
                          width: `${(job.processedEmails / job.totalEmails) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Processed {job.processedEmails} of {job.totalEmails} emails before stopping
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteJob(job.fileName)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          // Processing job
          return (
            <Card key={job.reportId}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <Mail className="text-primary h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold">{job.fileName}</h3>
                      <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm">
                      {job.totalEmails} emails • Created {job.timestamp}
                    </p>
                    <div className="bg-secondary h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(job.processedEmails / job.totalEmails) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs">
                      Processing {job.processedEmails} of {job.totalEmails} emails...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopJob(job.fileName)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth="2" />
                      </svg>
                      Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
}
