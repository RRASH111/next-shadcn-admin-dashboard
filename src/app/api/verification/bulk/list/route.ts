import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MillionVerifierAPI, APIError } from "@/lib/millionverifier";
import { bulkJobFiltersSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());

    // Convert string values to appropriate types
    const parsedFilters = {
      ...filters,
      offset: filters.offset ? parseInt(filters.offset) : undefined,
      limit: filters.limit ? parseInt(filters.limit) : undefined,
      percent_from: filters.percent_from ? parseInt(filters.percent_from) : undefined,
      percent_to: filters.percent_to ? parseInt(filters.percent_to) : undefined,
    };

    const validatedFilters = bulkJobFiltersSchema.parse(parsedFilters);

    // Get only this user's bulk jobs from the database
    const userBulkJobs = await prisma.bulkJob.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // If no jobs exist, return empty result
    if (userBulkJobs.length === 0) {
      return NextResponse.json({
        files: [],
        total: 0,
      });
    }

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Update local database with latest information from MillionVerifier
    const updatedFiles = [];
    for (const bulkJob of userBulkJobs) {
      try {
        // Get latest info from MillionVerifier
        const fileInfo = await api.getBulkFileInfo(bulkJob.fileId);

        // Update local database
        await prisma.bulkJob.update({
          where: { id: bulkJob.id },
          data: {
            status: fileInfo.status,
            totalRows: fileInfo.total_rows,
            uniqueEmails: fileInfo.unique_emails,
            verified: fileInfo.verified,
            percent: fileInfo.percent,
            okCount: fileInfo.ok,
            catchAllCount: fileInfo.catch_all,
            disposableCount: fileInfo.disposable,
            invalidCount: fileInfo.invalid,
            unknownCount: fileInfo.unknown,
            reverifyCount: fileInfo.reverify,
            credit: fileInfo.credit,
            estimatedTimeSec: fileInfo.estimated_time_sec,
            errorMessage: fileInfo.error || null,
            updatedAt: new Date(),
          },
        });

        updatedFiles.push(fileInfo);
      } catch (error) {
        // If file not found in MillionVerifier, skip it
        console.error(`Error updating file ${bulkJob.fileId}:`, error);
      }
    }

    return NextResponse.json({
      files: updatedFiles,
      total: updatedFiles.length,
    });
  } catch (error) {
    console.error("Bulk jobs list error:", error);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid filter parameters", details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
