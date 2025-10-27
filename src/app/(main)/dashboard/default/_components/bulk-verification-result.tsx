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
  onDownload: (filter: 'all' | 'ok' | 'ok_and_catch_all' | 'invalid' | 'disposable' | 'unknown') => void;
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
    <div className="relative inline-flex items-center justify-center w-16 h-16">
      <svg className="transform -rotate-90 w-16 h-16">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted"
        />
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
    <div className="relative inline-flex items-center justify-center w-16 h-16">
      <svg className="transform -rotate-90 w-16 h-16">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted"
        />
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
    <div className="relative inline-flex items-center justify-center w-16 h-16">
      <svg className="transform -rotate-90 w-16 h-16">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-muted"
        />
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
            <p className="text-sm text-muted-foreground mt-1">
              {timestamp} • id: {reportId}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Good Emails */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <GoodProgress />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-emerald-500">{goodPercentage}%</span>
                <span className="text-sm text-muted-foreground">Good</span>
              </div>
              <p className="text-lg font-semibold mb-1">{goodEmails}</p>
              <p className="text-xs text-muted-foreground">
                Good emails are valid, existing emails. It is safe to send emails to them.
              </p>
              <a href="#" className="text-xs text-emerald-500 hover:underline">
                Learn more »
              </a>
            </div>
          </div>

          {/* Risky Emails */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <RiskyProgress />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-amber-500">{riskyPercentage}%</span>
                <span className="text-sm text-muted-foreground">Risky</span>
              </div>
              <p className="text-lg font-semibold mb-1">{riskyEmails}</p>
              <p className="text-xs text-muted-foreground">
                Risky emails may exist or not. Learn more when to use them.
              </p>
              <a href="#" className="text-xs text-amber-500 hover:underline">
                Learn more »
              </a>
            </div>
          </div>

          {/* Bad Emails */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/20 md:col-span-2">
            <BadProgress />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-red-500">{badPercentage}%</span>
                <span className="text-sm text-muted-foreground">Bad</span>
              </div>
              <p className="text-lg font-semibold mb-1">{badEmails}</p>
              <p className="text-xs text-muted-foreground">
                Bad emails don&apos;t exist, don&apos;t email them!
              </p>
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
                <Download className="h-4 w-4 mr-2" />
                Download Reports
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center">
              <DropdownMenuItem onClick={() => onDownload('ok')}>
                <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                Good Emails Only
              </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload('ok_and_catch_all')}>
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      Risky Emails Only
                    </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('invalid')}>
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Invalid Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('disposable')}>
                <XCircle className="h-4 w-4 mr-2 text-orange-500" />
                Disposable Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('unknown')}>
                <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                Unknown Emails Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload('all')}>
                <FileText className="h-4 w-4 mr-2" />
                Full Report (All Results)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
