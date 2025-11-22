import { CheckCircle2, AlertTriangle, XCircle, Download, Trash2, FileText, FileType } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BulkVerificationResultProps {
  fileName: string;
  timestamp: string;
  reportId: string;
  goodEmails: number;
  riskyEmails: number;
  badEmails: number;
  totalEmails: number;
  onDelete: () => void;
  onDownload: (filter: "all" | "ok" | "ok_and_catch_all" | "invalid" | "disposable" | "unknown") => void;
}

export function BulkVerificationResult({
  fileName,
  timestamp,
  reportId,
  goodEmails,
  riskyEmails,
  badEmails,
  totalEmails,
  onDelete,
  onDownload,
}: BulkVerificationResultProps) {
  const goodPercentage = totalEmails > 0 ? Math.round((goodEmails / totalEmails) * 100) : 0;
  const riskyPercentage = totalEmails > 0 ? Math.round((riskyEmails / totalEmails) * 100) : 0;
  const badPercentage = totalEmails > 0 ? Math.round((badEmails / totalEmails) * 100) : 0;

  const GoodProgress = () => (
    <div className="relative inline-flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(goodPercentage / 100) * 175.93} 175.93`}
          className="text-emerald-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
      </div>
    </div>
  );

  const RiskyProgress = () => (
    <div className="relative inline-flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(riskyPercentage / 100) * 175.93} 175.93`}
          className="text-amber-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-amber-500" />
      </div>
    </div>
  );

  const BadProgress = () => (
    <div className="relative inline-flex h-16 w-16 items-center justify-center">
      <svg className="h-16 w-16 -rotate-90 transform">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={`${(badPercentage / 100) * 175.93} 175.93`}
          className="text-red-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <XCircle className="h-6 w-6 text-red-500" />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{fileName}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {timestamp} • id: {reportId}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Good Emails */}
          <div className="flex items-center gap-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <GoodProgress />
            <div className="flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-500">{goodPercentage}%</span>
                <span className="text-muted-foreground text-sm">Good</span>
              </div>
              <p className="mb-1 text-lg font-semibold">{goodEmails}</p>
              <p className="text-muted-foreground text-xs">
                Good emails are valid, existing emails. It is safe to send emails to them.
              </p>
              <a href="#" className="text-xs text-emerald-500 hover:underline">
                Learn more »
              </a>
            </div>
          </div>

          {/* Risky Emails */}
          <div className="flex items-center gap-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <RiskyProgress />
            <div className="flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-500">{riskyPercentage}%</span>
                <span className="text-muted-foreground text-sm">Risky</span>
              </div>
              <p className="mb-1 text-lg font-semibold">{riskyEmails}</p>
              <p className="text-muted-foreground text-xs">
                Risky emails may exist or not. Learn more when to use them.
              </p>
              <a href="#" className="text-xs text-amber-500 hover:underline">
                Learn more »
              </a>
            </div>
          </div>

          {/* Bad Emails */}
          <div className="flex items-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 md:col-span-2">
            <BadProgress />
            <div className="flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-500">{badPercentage}%</span>
                <span className="text-muted-foreground text-sm">Bad</span>
              </div>
              <p className="mb-1 text-lg font-semibold">{badEmails}</p>
              <p className="text-muted-foreground text-xs">Bad emails don&apos;t exist, don&apos;t email them!</p>
              <a href="#" className="text-xs text-red-500 hover:underline">
                Learn more »
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Reports
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center">
              <DropdownMenuItem onClick={() => onDownload("ok")}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                Good Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("ok_and_catch_all")}>
                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                Risky Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("invalid")}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Invalid Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("disposable")}>
                <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                Disposable Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("unknown")}>
                <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                Unknown Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload("all")}>
                <FileText className="mr-2 h-4 w-4" />
                Full Report (All Results)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
