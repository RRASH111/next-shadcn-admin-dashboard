import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MillionVerifierAPI, APIError } from "@/lib/millionverifier";
import { downloadFilterSchema } from "@/lib/validation";

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
    const filters = {
      fileId: searchParams.get("fileId"),
      filter: searchParams.get("filter") || "all",
      statuses: searchParams.get("statuses") || undefined,
      free: searchParams.get("free") || undefined,
      role: searchParams.get("role") || undefined,
    };

    const validatedFilters = downloadFilterSchema.parse(filters);

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Download results from MillionVerifier
    const response = await api.downloadBulkResults(validatedFilters.fileId, validatedFilters.filter as any, {
      statuses: validatedFilters.statuses,
      free: validatedFilters.free as any,
      role: validatedFilters.role as any,
    });

    // Create filename based on filter
    const filterName = validatedFilters.filter === "all" ? "all" : validatedFilters.filter;
    const filename = `verification-results-${validatedFilters.fileId}-${filterName}.csv`;

    // Return the file stream
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Bulk download error:", error);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid download parameters", details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
