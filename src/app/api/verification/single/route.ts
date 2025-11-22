import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MillionVerifierAPI, APIError } from "@/lib/millionverifier";
import { singleVerificationSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    console.log("Auth userId:", userId); // Debug log

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, timeout } = singleVerificationSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    console.log("Found user:", user); // Debug log

    if (!user) {
      // If user doesn't exist, create them
      console.log("User not found, creating user with clerkId:", userId);

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

      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUserData.email_addresses[0].email_address,
          username: clerkUserData.username || null,
          name: `${clerkUserData.first_name || ""} ${clerkUserData.last_name || ""}`.trim() || null,
          imageUrl: clerkUserData.image_url,
        },
        select: { id: true },
      });

      console.log("Created new user:", newUser);

      // Check if user has enough credits (new users get 500 free credits)
      const creditTransactions = await prisma.creditTransaction.findMany({
        where: { userId: newUser.id },
        select: { amount: true },
      });
      const totalCredits = creditTransactions.reduce(
        (sum: number, transaction: { amount: number }) => sum + transaction.amount,
        0,
      );

      if (totalCredits < 1) {
        return NextResponse.json({ error: "Insufficient credits. Please add credits to continue." }, { status: 402 });
      }

      // Initialize MillionVerifier API with environment key
      const api = new MillionVerifierAPI();

      // Verify email
      const result = await api.verifyEmail(email, timeout);

      // Store verification history
      await prisma.verificationHistory.create({
        data: {
          userId: newUser.id,
          email: result.email,
          result: result.result,
          resultcode: result.resultcode,
          quality: result.quality || null,
          subresult: result.subresult || null,
          free: result.free,
          role: result.role,
          didyoumean: result.didyoumean || null,
          creditsUsed: 1,
          executionTime: result.executiontime,
          error: result.error || null,
          livemode: result.livemode,
        },
      });

      // Record credit usage
      await prisma.creditTransaction.create({
        data: {
          userId: newUser.id,
          amount: -1,
          type: "verification",
          description: `Single verification for ${email}`,
        },
      });

      return NextResponse.json(result);
    }

    // Check if user has enough credits
    const creditTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      select: { amount: true },
    });
    const totalCredits = creditTransactions.reduce(
      (sum: number, transaction: { amount: number }) => sum + transaction.amount,
      0,
    );

    if (totalCredits < 1) {
      return NextResponse.json({ error: "Insufficient credits. Please add credits to continue." }, { status: 402 });
    }

    // Initialize MillionVerifier API with environment key
    const api = new MillionVerifierAPI();

    // Verify email
    const result = await api.verifyEmail(email, timeout);

    // Store verification history
    await prisma.verificationHistory.create({
      data: {
        userId: user.id,
        email: result.email,
        result: result.result,
        resultcode: result.resultcode,
        quality: result.quality || null,
        subresult: result.subresult || null,
        free: result.free,
        role: result.role,
        didyoumean: result.didyoumean || null,
        creditsUsed: 1,
        executionTime: result.executiontime,
        error: result.error || null,
        livemode: result.livemode,
      },
    });

    // Record credit usage
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: -1,
        type: "verification",
        description: `Single verification for ${email}`,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Single verification error:", error);

    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
