"use client";

import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { verificationColumns } from "./verification-columns";

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

interface VerificationsTableProps {
  initialPageSize?: number;
}

export function VerificationsTable({ initialPageSize = 10 }: VerificationsTableProps) {
  const [data, setData] = useState<VerificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchVerificationHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/verification/history?limit=1000');
      if (response.ok) {
        const result = await response.json();
        
        // Transform API data to match our table structure
        const transformedData: VerificationHistoryItem[] = result.history?.map((item: any) => ({
          id: item.id,
          email: item.email,
          result: item.result === 'ok' ? 'Valid' : 
                  item.result === 'invalid' ? 'Invalid' : 
                  item.result === 'catch_all' ? 'Risky' : 'Unknown',
          quality: item.result === 'ok' ? 'Excellent' : 
                   item.result === 'invalid' ? 'Poor' : 
                   item.result === 'catch_all' ? 'Fair' : 'Unknown',
          subresult: item.subresult || '',
          free: item.free || false,
          role: item.role || false,
          didyoumean: item.didyoumean || '',
          credits: item.creditsUsed || 1,
          executiontime: item.executionTime || 0,
          error: item.error || '',
          livemode: item.livemode || false,
          createdAt: new Date(item.createdAt).toLocaleString(),
        })) || [];

        setData(transformedData);
        setTotal(result.total || 0);
      } else {
        const errorData = await response.json();
        // Check if it's a "User not found" error, which means no data yet
        if (errorData.error === 'User not found') {
          setData([]);
          setTotal(0);
          setError(null); // No error, just no data
        } else {
          setError('Failed to load verification history');
        }
      }
    } catch (error) {
      console.error('Error fetching verification history:', error);
      setError('Failed to load verification history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationHistory();
  }, []);

  const table = useReactTable({
    data,
    columns: verificationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  const startIndex = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const endIndex = Math.min(
    startIndex + table.getRowModel().rows.length - 1,
    data.length
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading verification history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchVerificationHistory} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={verificationColumns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-muted-foreground mb-2">
                      No verifications yet
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Start by verifying your first email address
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {data.length > 0 ? (
              <>
                Showing {startIndex} to {endIndex} of {data.length} results
              </>
            ) : (
              "No results"
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
