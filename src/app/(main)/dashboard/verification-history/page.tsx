import { History } from "lucide-react";

import { VerificationsTable } from "./_components/verifications-table";

export default function VerificationHistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Verification History</h1>
      </div>
      
      <div className="rounded-lg border p-6">
        <VerificationsTable />
      </div>
    </div>
  );
}
