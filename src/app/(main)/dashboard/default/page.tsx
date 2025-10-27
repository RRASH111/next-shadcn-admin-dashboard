"use client";

import { useState, useEffect, useRef } from "react";

import { Mail, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { BulkVerificationCard } from "./_components/bulk-verification-card";
import { BulkVerificationResult } from "./_components/bulk-verification-result";

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

interface VerificationResult {
  email: string;
  result: string;
  quality: string;
  subresult: string;
  free: boolean;
  role: boolean;
  didyoumean: string;
  credits: number;
  executiontime: number;
  error: string;
  livemode: boolean;
}

export default function Page() {
  const [bulkJobs, setBulkJobs] = useState<BulkJob[]>([]);
  const [email, setEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmailVerification = async () => {
    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch('/api/verification/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setVerificationResult(result);
        setEmail(""); // Clear the input after successful verification
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // The bulk verification card now handles the API call
    // We just need to refresh the bulk jobs list
    await fetchBulkJobs();
  };

  const fetchBulkJobs = async () => {
    try {
      const response = await fetch('/api/verification/bulk/list');
      if (response.ok) {
        const data = await response.json();
        // Convert MillionVerifier format to our local format
        const jobs: BulkJob[] = data.files?.map((file: any) => ({
          fileName: file.file_name,
          status: file.status === 'finished' ? 'completed' : 
                  file.status === 'canceled' ? 'stopped' : 'processing',
          totalEmails: file.total_rows,
          processedEmails: file.verified,
          validEmails: file.ok,
          riskyEmails: file.catch_all,
          invalidEmails: file.invalid + file.disposable + file.unknown,
          timestamp: new Date().toLocaleString(), // You might want to get actual timestamp from API
          reportId: file.file_id,
        })) || [];
        
        setBulkJobs(jobs);
      }
    } catch (error) {
      console.error('Error fetching bulk jobs:', error);
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
    const hasProcessingJobs = bulkJobs.some(job => job.status === 'processing');
    
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
  }, [bulkJobs.filter(job => job.status === 'processing').length]); // Only depend on count of processing jobs

  const handleStopJob = async (fileName: string) => {
    const job = bulkJobs.find(j => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch('/api/verification/bulk/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId: job.reportId }),
      });

      if (response.ok) {
        // Update the job status to stopped
        setBulkJobs((jobs) =>
          jobs.map((job) =>
            job.fileName === fileName
              ? { ...job, status: 'stopped' as const }
              : job
          )
        );
      } else {
        console.error('Failed to stop job');
      }
    } catch (error) {
      console.error('Error stopping job:', error);
    }
  };

  const handleDeleteJob = async (fileName: string) => {
    const job = bulkJobs.find(j => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch('/api/verification/bulk/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId: job.reportId }),
      });

      if (response.ok) {
        setBulkJobs((jobs) => jobs.filter((job) => job.fileName !== fileName));
      } else {
        console.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleDownloadReport = async (fileName: string, filter: 'all' | 'ok' | 'ok_and_catch_all' | 'invalid' | 'disposable' | 'unknown' = 'all') => {
    const job = bulkJobs.find((j) => j.fileName === fileName);
    if (!job) return;

    try {
      const response = await fetch(`/api/verification/bulk/download?fileId=${job.reportId}&filter=${filter}`);
      
      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Generate filename based on filter
        const filterName = filter === 'all' ? 'all_results' : filter;
        a.download = `${fileName.replace('.csv', '')}_${filterName}.csv`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'ok': return 'text-green-600 bg-green-50 border-green-200';
      case 'invalid': return 'text-red-600 bg-red-50 border-red-200';
      case 'catch_all': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unknown': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'disposable': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Email Verification Forms */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Single Email Verification */}
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Single Email Verification</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Instant verification with comprehensive detailed results and insights.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isVerifying}
                className="h-10"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verification Cost</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Instant Results
                </Badge>
                <span className="font-bold">1 credit</span>
              </div>
            </div>
            <Button
              className="w-full mt-auto"
              onClick={handleEmailVerification}
              disabled={isVerifying || !email.trim()}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Verify Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Email Verification */}
        <BulkVerificationCard onFileUpload={handleFileUpload} />
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Verification Result</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="font-mono text-sm">{verificationResult.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Result</Label>
                <Badge className={`${getResultColor(verificationResult.result)} capitalize`}>
                  {verificationResult.result}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Quality</Label>
                <p className="capitalize">{verificationResult.quality || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Free Email</Label>
                <p>{verificationResult.free ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Role Email</Label>
                <p>{verificationResult.role ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Execution Time</Label>
                <p>{verificationResult.executiontime}ms</p>
              </div>
            </div>
            {verificationResult.didyoumean && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Did you mean?</Label>
                <p className="font-mono text-sm">{verificationResult.didyoumean}</p>
              </div>
            )}
            {verificationResult.subresult && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Subresult</Label>
                <p className="text-sm">{verificationResult.subresult}</p>
              </div>
            )}
            {verificationResult.error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {verificationResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Processing/Completed Bulk Jobs */}
      {bulkJobs.length > 0 && (
        <div className="space-y-6">
          {bulkJobs.map((job) =>
            job.status === "completed" ? (
              <BulkVerificationResult
                key={job.fileName}
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
            ) : job.status === "stopped" ? (
              <Card key={job.fileName}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-100 p-3">
                      <Mail className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.fileName}</h3>
                        <Badge className="bg-gray-500/10 text-gray-500">Stopped</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.totalEmails} emails • Stopped {job.timestamp}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(job.processedEmails / job.totalEmails) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Processed {job.processedEmails} of {job.totalEmails} emails before stopping
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.fileName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={job.fileName}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{job.fileName}</h3>
                        <Badge className="bg-blue-500/10 text-blue-500">Processing</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.totalEmails} emails • Created {job.timestamp}
                      </p>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(job.processedEmails / job.totalEmails) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Processing {job.processedEmails} of {job.totalEmails} emails...
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopJob(job.fileName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth="2"/>
                        </svg>
                        Stop
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
