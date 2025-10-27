import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

// Updated interface to match API data
interface VerificationHistoryItem {
  id: string;
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
  createdAt: string;
}

const getResultIcon = (result: string) => {
  switch (result) {
    case "Valid":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "Invalid":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "Risky":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getResultBadge = (result: string) => {
  switch (result) {
    case "Valid":
      return "bg-green-500/10 text-green-500";
    case "Invalid":
      return "bg-red-500/10 text-red-500";
    case "Risky":
      return "bg-yellow-500/10 text-yellow-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

export const verificationColumns: ColumnDef<VerificationHistoryItem>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "result",
    header: "Result",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getResultIcon(row.original.result)}
        <Badge className={getResultBadge(row.original.result)}>
          {row.original.result}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "quality",
    header: "Quality",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.quality}</span>
    ),
  },
  {
    accessorKey: "subresult",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.subresult || 'Unknown'}</Badge>
    ),
  },
  {
    accessorKey: "didyoumean",
    header: "Suggestion",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.didyoumean || 'No suggestion'}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Re-verify</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
