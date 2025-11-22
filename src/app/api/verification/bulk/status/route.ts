import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MillionVerifierAPI, APIError } from "@/lib/millionverifier";

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

    // Get file ID from query parameters
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Get file info from MillionVerifier
    const result = await api.getBulkFileInfo(fileId);

    // Update local database with latest information
    const existingJob = await prisma.bulkJob.findFirst({
      where: {
        userId: user.id,
        fileId: fileId,
      },
    });

    if (existingJob) {
      // Update existing job
      await prisma.bulkJob.update({
        where: { id: existingJob.id },
        data: {
          status: result.status,
          totalRows: result.total_rows,
          uniqueEmails: result.unique_emails,
          verified: result.verified,
          percent: result.percent,
          okCount: result.ok,
          catchAllCount: result.catch_all,
          disposableCount: result.disposable,
          invalidCount: result.invalid,
          unknownCount: result.unknown,
          reverifyCount: result.reverify,
          credit: result.credit,
          estimatedTimeSec: result.estimated_time_sec,
          errorMessage: result.error || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new job
      await prisma.bulkJob.create({
        data: {
          userId: user.id,
          fileId: result.file_id,
          fileName: result.file_name,
          status: result.status,
          totalRows: result.total_rows,
          uniqueEmails: result.unique_emails,
          verified: result.verified,
          percent: result.percent,
          okCount: result.ok,
          catchAllCount: result.catch_all,
          disposableCount: result.disposable,
          invalidCount: result.invalid,
          unknownCount: result.unknown,
          reverifyCount: result.reverify,
          credit: result.credit,
          estimatedTimeSec: result.estimated_time_sec,
          errorMessage: result.error || null,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bulk job status error:", error);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
