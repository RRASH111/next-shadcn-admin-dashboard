import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { verificationHistoryFiltersSchema } from "@/lib/validation";

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
      page: filters.page ? parseInt(filters.page) : 1,
      limit: filters.limit ? parseInt(filters.limit) : 50,
    };

    // Validate the filters
    const validatedFilters = verificationHistoryFiltersSchema.parse(parsedFilters);

    // Calculate offset
    const offset = (validatedFilters.page - 1) * validatedFilters.limit;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (validatedFilters.email) {
      where.email = {
        contains: validatedFilters.email,
        mode: "insensitive",
      };
    }

    if (validatedFilters.result) {
      where.result = validatedFilters.result;
    }

    if (validatedFilters.quality) {
      where.quality = validatedFilters.quality;
    }

    if (validatedFilters.dateFrom || validatedFilters.dateTo) {
      where.createdAt = {};
      if (validatedFilters.dateFrom) {
        where.createdAt.gte = new Date(validatedFilters.dateFrom);
      }
      if (validatedFilters.dateTo) {
        where.createdAt.lte = new Date(validatedFilters.dateTo);
      }
    }

    // Get verification history
    const [history, total] = await Promise.all([
      prisma.verificationHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: validatedFilters.limit,
        select: {
          id: true,
          email: true,
          result: true,
          resultcode: true,
          quality: true,
          subresult: true,
          free: true,
          role: true,
          didyoumean: true,
          creditsUsed: true,
          executionTime: true,
          error: true,
          livemode: true,
          createdAt: true,
        },
      }),
      prisma.verificationHistory.count({ where }),
    ]);

    // Calculate summary statistics
    const stats = await prisma.verificationHistory.aggregate({
      where: { userId: user.id },
      _count: {
        id: true,
      },
      _sum: {
        creditsUsed: true,
      },
    });

    const resultStats = await prisma.verificationHistory.groupBy({
      by: ["result"],
      where: { userId: user.id },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      history: history,
      total: total,
      pagination: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total,
        totalPages: Math.ceil(total / validatedFilters.limit),
      },
      stats: {
        totalVerifications: stats._count.id,
        totalCreditsUsed: stats._sum.creditsUsed || 0,
        resultBreakdown: resultStats.reduce(
          (acc: Record<string, number>, item: { result: string; _count: { id: number } }) => {
            acc[item.result] = item._count.id;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    });
  } catch (error) {
    console.error("Verification history error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid filter parameters", details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
