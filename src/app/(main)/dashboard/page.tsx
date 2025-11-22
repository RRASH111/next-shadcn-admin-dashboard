"use client";

import { useState, useEffect } from "react";
import { Clock, CreditCard, Mail, FileText, TrendingUp, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreditsData {
  credits: number;
}

interface VerificationStats {
  total: number;
  valid: number;
  invalid: number;
  risky: number;
  ok: number;
  catch_all: number;
  disposable: number;
  unknown: number;
  error: number;
}

interface BulkJobStats {
  total: number;
  active: number;
  completed: number;
}

export default function Page() {
  const [credits, setCredits] = useState<CreditsData | null>(null);
  const [verificationStats, setVerificationStats] = useState<VerificationStats | null>(null);
  const [bulkJobStats, setBulkJobStats] = useState<BulkJobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch credits
        const creditsResponse = await fetch("/api/credits/balance");
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          setCredits(creditsData);
        }

        // Fetch verification history stats
        const historyResponse = await fetch("/api/verification/history?limit=1000");
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          const stats: VerificationStats = {
            total: historyData.total,
            valid: historyData.stats?.ok || 0,
            invalid: (historyData.stats?.invalid || 0) + (historyData.stats?.error || 0),
            risky: historyData.stats?.catch_all || 0,
            ok: historyData.stats?.ok || 0,
            catch_all: historyData.stats?.catch_all || 0,
            disposable: historyData.stats?.disposable || 0,
            unknown: historyData.stats?.unknown || 0,
            error: historyData.stats?.error || 0,
          };
          setVerificationStats(stats);
        }

        // Fetch bulk jobs stats
        const bulkResponse = await fetch("/api/verification/bulk/list");
        if (bulkResponse.ok) {
          const bulkData = await bulkResponse.json();
          const stats: BulkJobStats = {
            total: bulkData.total || 0,
            active:
              bulkData.files?.filter((job: any) => ["in_progress", "in_queue_to_start", "paused"].includes(job.status))
                .length || 0,
            completed: bulkData.files?.filter((job: any) => job.status === "finished").length || 0,
          };
          setBulkJobStats(stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate credits used based on verification history
  const creditsUsed = verificationStats ? verificationStats.total : 0;
  const totalCredits = credits ? credits.credits + creditsUsed : 0;
  const creditsProgress = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Available Credits Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Available Credits
            </span>
            <CreditCard className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{credits ? credits.credits.toLocaleString() : "0"}</div>
            <div className="space-y-2">
              <div className="text-muted-foreground text-xs">Used: {creditsUsed.toLocaleString()}</div>
              <Progress value={creditsProgress} className="h-1" />
              <div className="text-muted-foreground text-right text-xs">Total: 5,000</div>
            </div>
          </CardContent>
        </Card>

        {/* Email Verifications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Email Verifications
            </span>
            <Mail className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">
              {verificationStats ? verificationStats.total.toLocaleString() : "0"}
            </div>
            <div className="space-y-1.5">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>{verificationStats?.valid || 0} valid</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>{verificationStats?.invalid || 0} invalid</span>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 7-7m0 0 7 7m-7-7v14" />
                </svg>
                Real-time
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Jobs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Bulk Jobs</span>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{bulkJobStats ? bulkJobStats.total.toLocaleString() : "0"}</div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>Active: {bulkJobStats?.active || 0}</span>
              <span>Completed: {bulkJobStats?.completed || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credits Used Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Credits Used</span>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold">{creditsUsed.toLocaleString()}</div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">Total credits consumed across all verifications</p>
              <Button variant="outline" size="sm" className="w-full">
                This Period
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Single Email Verification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Single Email Verification</h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Instant verification with comprehensive detailed results and insights.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                placeholder="example@domain.com"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Verification Cost</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Instant Results
                </Badge>
                <span className="font-bold">1 credit</span>
              </div>
            </div>
            <Button className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Verify Email
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Email Verification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Bulk Email Verification</h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Process thousands of emails efficiently with batch processing.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email List File</label>
              <input
                type="file"
                accept=".csv,.txt"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-muted-foreground text-xs">
                Supported formats: CSV, TXT (one email per line). Maximum file size: 10MB.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Processing Cost</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Batch Processing
                </Badge>
                <span className="font-bold">1 credit per email</span>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Upload & Verify
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bulk Jobs List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold">Bulk Jobs</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="mb-1 text-sm font-medium">No bulk verification jobs yet</p>
              <p className="text-muted-foreground text-xs">Upload a CSV file to get started</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Verifications */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recent Email Verifications</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Your latest email verification results with detailed insights
              </p>
            </div>
            <Badge variant="secondary">{verificationStats?.total || 0} results</Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="text-muted-foreground bg-muted/50 grid grid-cols-7 gap-4 px-4 py-3 text-xs font-medium">
                <div>Email</div>
                <div>Result</div>
                <div>Quality</div>
                <div>Type</div>
                <div>Suggestion</div>
                <div>Credits</div>
                <div>Date</div>
              </div>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted mb-4 rounded-full p-3">
                  <Mail className="text-muted-foreground h-6 w-6" />
                </div>
                <p className="mb-1 text-sm font-medium">No verifications yet</p>
                <p className="text-muted-foreground text-xs">Start by verifying your first email above</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
