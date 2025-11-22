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
    console.log("Creating checkout session...");

    // Check required environment variables
    const missingVars = [];

    if (!process.env.STRIPE_SECRET_KEY) {
      missingVars.push("STRIPE_SECRET_KEY");
    } else if (
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_test_") &&
      !process.env.STRIPE_SECRET_KEY.startsWith("sk_live_")
    ) {
      console.error("STRIPE_SECRET_KEY format is invalid - should start with sk_test_ or sk_live_");
      return NextResponse.json({ error: "Invalid Stripe secret key format" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      missingVars.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    } else if (
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_") &&
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_live_")
    ) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY format is invalid - should start with pk_test_ or pk_live_");
      return NextResponse.json({ error: "Invalid Stripe publishable key format" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      missingVars.push("NEXT_PUBLIC_APP_URL");
    }

    if (!process.env.DATABASE_URL) {
      missingVars.push("DATABASE_URL");
    }

    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars.join(", "));
      return NextResponse.json(
        {
          error: `Missing environment variables: ${missingVars.join(", ")}. Please check your .env.local file.`,
        },
        { status: 500 },
      );
    }

    // Test database connection
    try {
      console.log("Testing database connection...");
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL.",
        },
        { status: 500 },
      );
    }

    // Test Stripe API connection
    try {
      console.log("Testing Stripe API connection...");
      await stripe.accounts.retrieve();
      console.log("✅ Stripe API connection successful");
    } catch (stripeError) {
      console.error("❌ Stripe API connection failed:", stripeError);
      return NextResponse.json(
        {
          error: "Stripe API connection failed. Please check your STRIPE_SECRET_KEY.",
        },
        { status: 500 },
      );
    }

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      console.log("No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await request.json();
    console.log("Package ID:", packageId);

    if (!packageId || !creditPackages[packageId as keyof typeof creditPackages]) {
      console.log("Invalid package ID:", packageId);
      return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
    }

    const pkg = creditPackages[packageId as keyof typeof creditPackages];
    console.log("Package details:", pkg);

    // Get user's organization
    console.log("Looking up user in database...");
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { organization: true },
    });

    console.log("User found:", user ? "Yes" : "No");
    console.log("User organization:", user?.organization ? "Yes" : "No");

    if (!user?.organization) {
      console.log("User or organization not found, creating organization...");

      if (!user) {
        console.log("User not found in database");
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      // Create organization for existing user
      const organization = await prisma.organization.create({
        data: {
          name: `${user.name || user.username || "User"}'s Organization`,
          slug: `${user.username || user.clerkId}-org`.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          ownerId: user.id,
        },
      });

      console.log("Created organization for existing user:", organization.id);

      // Update user with organization reference
      user.organization = organization;
    }

    let stripeCustomerId = user.organization.stripeCustomerId;
    console.log("Existing Stripe customer ID:", stripeCustomerId);

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      console.log("Creating new Stripe customer...");
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
            organizationId: user.organization.id,
          },
        });

        stripeCustomerId = customer.id;
        console.log("Created Stripe customer:", stripeCustomerId);

        // Update organization with Stripe customer ID
        await prisma.organization.update({
          where: { id: user.organization.id },
          data: { stripeCustomerId },
        });
        console.log("Updated organization with Stripe customer ID");
      } catch (stripeError) {
        console.error("Error creating Stripe customer:", stripeError);
        return NextResponse.json({ error: "Failed to create Stripe customer" }, { status: 500 });
      }
    }

    // Create Stripe checkout session for monthly subscription
    console.log("Creating Stripe checkout session...");
    console.log("App URL:", process.env.NEXT_PUBLIC_APP_URL);

    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${pkg.credits.toLocaleString()} Email Verification Credits`,
                description: "Monthly email verification credits for ZenVerifier",
              },
              unit_amount: pkg.price,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/topup?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/topup?canceled=true`,
        metadata: {
          userId: user.id,
          organizationId: user.organization.id,
          packageId,
          credits: pkg.credits.toString(),
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            organizationId: user.organization.id,
            packageId,
            credits: pkg.credits.toString(),
          },
        },
      });

      console.log("Checkout session created successfully:", session.id);
      return NextResponse.json({ url: session.url });
    } catch (stripeError) {
      console.error("Error creating Stripe checkout session:", stripeError);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
