import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checks: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      database: {},
      stripe: {},
      user: {},
    };

    // Check environment variables
    checks.environment.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
      ? `Set (${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...)`
      : "❌ NOT SET";
    checks.environment.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? `Set (${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 10)}...)`
      : "❌ NOT SET";
    checks.environment.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "❌ NOT SET";
    checks.environment.DATABASE_URL = process.env.DATABASE_URL ? "✅ Set" : "❌ NOT SET";
    checks.environment.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
      ? `Set (${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...)`
      : "⚠️ NOT SET (optional)";

    // Check database connection
    try {
      await prisma.$connect();
      checks.database.connection = "✅ Connected";

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { organization: true },
      });

      if (user) {
        checks.user.found = "✅ User exists";
        checks.user.id = user.id;
        checks.user.email = user.email;
        checks.user.hasOrganization = user.organization ? "✅ Yes" : "❌ No (will create)";

        if (user.organization) {
          checks.user.organizationId = user.organization.id;
          checks.user.stripeCustomerId = user.organization.stripeCustomerId || "❌ Not created yet";
        }
      } else {
        checks.user.found = "❌ User not found in database";
      }
    } catch (dbError: any) {
      checks.database.connection = "❌ Failed";
      checks.database.error = dbError.message;
    }

    // Check Stripe connection
    try {
      const account = await stripe.accounts.retrieve();
      checks.stripe.connection = "✅ Connected";
      checks.stripe.accountId = account.id;
      checks.stripe.mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "LIVE" : "TEST";
    } catch (stripeError: any) {
      checks.stripe.connection = "❌ Failed";
      checks.stripe.error = stripeError.message;
    }

    // Overall status
    checks.ready =
      checks.database.connection === "✅ Connected" &&
      checks.stripe.connection === "✅ Connected" &&
      checks.environment.STRIPE_SECRET_KEY !== "❌ NOT SET" &&
      checks.environment.NEXT_PUBLIC_APP_URL !== "❌ NOT SET";

    return NextResponse.json(checks);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Check failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

