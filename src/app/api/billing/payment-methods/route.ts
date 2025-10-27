import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true }
    });

    if (!user?.organization?.stripeCustomerId) {
      return NextResponse.json([]);
    }

    // Get payment methods from Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.organization.stripeCustomerId,
      type: 'card',
    });

    return NextResponse.json(
      paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        } : null,
      }))
    );
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
