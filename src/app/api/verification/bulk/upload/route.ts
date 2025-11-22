import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MillionVerifierAPI, APIError } from "@/lib/millionverifier";

export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      return NextResponse.json({ error: "File must be a CSV file" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return NextResponse.json({ error: "File size must be less than 50MB" }, { status: 400 });
    }

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Upload file to MillionVerifier
    const result = await api.uploadBulkFile(file);

    // Store bulk job in database
    const bulkJob = await prisma.bulkJob.create({
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

    // Record credit transaction if credits were used
    if (result.credit > 0) {
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -result.credit,
          type: "bulk_verification",
          description: `Bulk verification for ${result.file_name}`,
          millionverifierFileId: result.file_id,
        },
      });
    }

    return NextResponse.json({
      ...result,
      id: bulkJob.id,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
