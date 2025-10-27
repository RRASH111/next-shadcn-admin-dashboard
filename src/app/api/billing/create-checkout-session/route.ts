import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const creditPackages = {
  "10k": { credits: 10000, price: 3700, priceId: "price_10k_monthly" }, // $37.00 in cents
  "25k": { credits: 25000, price: 4900, priceId: "price_25k_monthly" }, // $49.00 in cents
  "50k": { credits: 50000, price: 7700, priceId: "price_50k_monthly" }, // $77.00 in cents
  "100k": { credits: 100000, price: 12900, priceId: "price_100k_monthly" }, // $129.00 in cents
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await request.json();

    if (!packageId || !creditPackages[packageId as keyof typeof creditPackages]) {
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    const pkg = creditPackages[packageId as keyof typeof creditPackages];

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true }
    });

    if (!user?.organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    let stripeCustomerId = user.organization.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          organizationId: user.organization.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update organization with Stripe customer ID
      await prisma.organization.update({
        where: { id: user.organization.id },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe checkout session for monthly subscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.credits.toLocaleString()} Email Verification Credits`,
              description: 'Monthly email verification credits for ZenVerifier',
            },
            unit_amount: pkg.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/topup?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/topup?canceled=true`,
      metadata: {
        userId: user.id,
        organizationId: user.organization.id,
        packageId,
        credits: pkg.credits.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
