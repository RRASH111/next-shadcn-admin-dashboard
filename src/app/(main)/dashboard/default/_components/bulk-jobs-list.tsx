import { FileText, CheckCircle2, Loader2, XCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { verificationsData, bulkJobsData } from "./verification-data";
import type { BulkJob } from "./verification-schema";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "Processing":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "Failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-500";
    case "Processing":
      return "bg-blue-500/10 text-blue-500";
    case "Failed":
      return "bg-red-500/10 text-red-500";
    default:
      return "";
  }
};

export function BulkJobsList() {
  return (
    <div className="space-y-3">
      {bulkJobsData.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{job.fileName}</h4>
                  <Badge className={getStatusBadge(job.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(job.status)}
                      {job.status}
                    </span>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {job.totalEmails} emails • Created {job.createdAt}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download Results
                </DropdownMenuItem>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {job.status === "Processing" && (
            <div className="space-y-2">
              <Progress value={(job.processedEmails / job.totalEmails) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Processing {job.processedEmails} of {job.totalEmails} emails...
              </p>
            </div>
          )}

          {(job.status === "Completed" || job.status === "Failed") && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Valid: {job.validEmails}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Invalid: {job.invalidEmails}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">
                  Total: {job.processedEmails}/{job.totalEmails}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
