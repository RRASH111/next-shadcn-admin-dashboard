import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      // If user doesn't exist, create them with 500 free credits
      console.log("Creating new user with 500 free credits");

      // Get user info from Clerk
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });

      if (!clerkUser.ok) {
        return NextResponse.json({ error: "Failed to fetch user from Clerk" }, { status: 500 });
      }

      const clerkUserData = await clerkUser.json();

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUserData.email_addresses[0].email_address,
          username: clerkUserData.username || null,
          name: `${clerkUserData.first_name || ""} ${clerkUserData.last_name || ""}`.trim() || null,
          imageUrl: clerkUserData.image_url,
        },
      });

      // Add 500 free credits for new users
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: 500,
          type: "free_signup",
          description: "Welcome bonus - 500 free credits",
        },
      });
    }

    // Calculate current credit balance
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      select: { amount: true },
    });

    const totalCredits = creditTransactions.reduce(
      (sum: number, transaction: { amount: number }) => sum + transaction.amount,
      0,
    );

    return NextResponse.json({
      credits: Math.max(0, totalCredits), // Ensure credits never go negative
    });
  } catch (error) {
    console.error("Credits balance error:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
