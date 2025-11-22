import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });

    if (!user?.organization?.stripeCustomerId) {
      return NextResponse.json({ subscription: null });
    }

    // Get subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.organization.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const subscription = subscriptions.data[0] as Stripe.Subscription;

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      priceId: subscription.items.data[0].price.id,
      cancelAt: (subscription as any).cancel_at ? new Date((subscription as any).cancel_at * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
