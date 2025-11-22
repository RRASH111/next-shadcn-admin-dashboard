import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  console.log("🔔 Stripe webhook received");
  console.log("Signature:", signature ? "Present" : "Missing");
  console.log("Body length:", body.length);

  let event: Stripe.Event;

  // For local development, allow webhooks without signature verification
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("⚠️ STRIPE_WEBHOOK_SECRET not set - using raw JSON for local development");
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error("Failed to parse webhook body:", error);
      return new NextResponse("Invalid JSON", { status: 400 });
    }
  } else {
    try {
      event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return new NextResponse("Webhook Error", { status: 400 });
    }
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = event.data.object as Stripe.Subscription;

  // Handle different event types
  console.log("📋 Processing webhook event:", event.type);

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Checkout session completed");
      console.log("Session mode:", session.mode);
      console.log("Session metadata:", session.metadata);

      if (session.mode === "subscription" && session.metadata) {
        // Handle monthly subscription creation
        const { userId, organizationId, packageId, credits } = session.metadata;
        console.log("Subscription details:", { userId, organizationId, packageId, credits });

        if (userId && organizationId && credits) {
          try {
            // Add initial credits for the subscription
            const creditTransaction = await prisma.creditTransaction.create({
              data: {
                userId: userId,
                amount: parseInt(credits),
                type: "subscription",
                description: `Monthly subscription - ${credits} credits`,
                stripePaymentIntentId: (session as any).payment_intent as string,
              },
            });

            console.log(`✅ Added ${credits} credits to user ${userId} for monthly subscription`);
            console.log("Credit transaction ID:", creditTransaction.id);
          } catch (error) {
            console.error("❌ Failed to create credit transaction:", error);
          }
        } else {
          console.log("❌ Missing required metadata for subscription");
        }
      } else {
        console.log("❌ Not a subscription checkout or missing metadata");
      }
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;

      // Check if this invoice is for a subscription
      const subscriptionId = (invoice as any).subscription;
      if (subscriptionId && typeof subscriptionId === "string") {
        // Handle monthly subscription renewal
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          include: { owner: true },
        });

        if (organization && subscription.metadata?.credits) {
          // Add monthly credits
          await prisma.creditTransaction.create({
            data: {
              userId: organization.ownerId,
              amount: parseInt(subscription.metadata.credits),
              type: "subscription_renewal",
              description: `Monthly renewal - ${subscription.metadata.credits} credits`,
              stripePaymentIntentId: (invoice as any).payment_intent as string,
            },
          });

          console.log(`Added ${subscription.metadata.credits} credits for monthly renewal`);
        }
      }
      break;

    case "customer.subscription.created":
      const newSubscription = event.data.object as Stripe.Subscription;

      // Store subscription details in our database
      if (newSubscription.metadata?.userId && newSubscription.metadata?.organizationId) {
        await prisma.subscription.create({
          data: {
            stripeSubscriptionId: newSubscription.id,
            stripeCustomerId: newSubscription.customer as string,
            stripePriceId: newSubscription.items.data[0].price.id,
            stripeStatus: newSubscription.status,
            stripeCurrentPeriodStart: new Date((newSubscription as any).current_period_start * 1000),
            stripeCurrentPeriodEnd: new Date((newSubscription as any).current_period_end * 1000),
            userId: newSubscription.metadata.userId,
            organizationId: newSubscription.metadata.organizationId,
          },
        });

        // Update organization with subscription details
        await prisma.organization.update({
          where: { id: newSubscription.metadata.organizationId },
          data: {
            stripeSubscriptionId: newSubscription.id,
            stripePriceId: newSubscription.items.data[0].price.id,
            stripeSubscriptionStatus: newSubscription.status,
          },
        });

        console.log(
          `Created subscription ${newSubscription.id} for organization ${newSubscription.metadata.organizationId}`,
        );
      }
      break;

    case "customer.subscription.updated":
      await prisma.organization.update({
        where: {
          stripeCustomerId: subscription.customer as string,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeSubscriptionStatus: subscription.status,
        },
      });
      break;

    case "customer.subscription.deleted":
      await prisma.organization.update({
        where: {
          stripeCustomerId: subscription.customer as string,
        },
        data: {
          stripeSubscriptionStatus: "canceled",
        },
      });
      break;

    default:
      console.log("Unhandled event type:", event.type);
  }

  return new NextResponse(null, { status: 200 });
}
