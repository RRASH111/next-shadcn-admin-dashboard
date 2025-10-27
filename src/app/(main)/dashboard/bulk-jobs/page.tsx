"use client";

import { FileText } from "lucide-react";

import { BulkJobsList } from "./_components/bulk-jobs-list";

export default function BulkJobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Bulk Jobs</h1>
      </div>

      <BulkJobsList onJobClick={() => {}} />
    </div>
  );
}
