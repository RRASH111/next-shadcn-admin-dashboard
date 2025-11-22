import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// This endpoint shows webhook-related data to help debug
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all credit transactions
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Calculate balance
    const balance = creditTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      currentBalance: balance,
      creditTransactions: creditTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        stripePaymentIntentId: tx.stripePaymentIntentId,
        createdAt: tx.createdAt,
      })),
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        status: sub.stripeStatus,
        createdAt: sub.createdAt,
      })),
      analysis: {
        hasSubscriptions: subscriptions.length > 0,
        hasPaymentIntentTransactions: creditTransactions.some((tx) => tx.stripePaymentIntentId),
        totalTransactions: creditTransactions.length,
        expectedCreditsFromSubscriptions: subscriptions.length > 0 ? "Should have credits from subscription" : "No subscriptions",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch logs",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

