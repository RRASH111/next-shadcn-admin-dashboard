import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const subscription = event.data.object as Stripe.Subscription;

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === 'subscription' && session.metadata) {
        // Handle monthly subscription creation
        const { userId, organizationId, packageId, credits } = session.metadata;
        
        if (userId && organizationId && credits) {
          // Add initial credits for the subscription
          await prisma.creditTransaction.create({
            data: {
              userId: userId,
              amount: parseInt(credits),
              type: 'subscription',
              description: `Monthly subscription - ${credits} credits`,
              stripePaymentIntentId: session.payment_intent as string,
            }
          });
          
          console.log(`Added ${credits} credits to user ${userId} for monthly subscription`);
        }
      }
      break;

    case "invoice.payment_succeeded":
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        // Handle monthly subscription renewal
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const organization = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
          include: { owner: true }
        });
        
        if (organization && subscription.metadata?.credits) {
          // Add monthly credits
          await prisma.creditTransaction.create({
            data: {
              userId: organization.ownerId,
              amount: parseInt(subscription.metadata.credits),
              type: 'subscription_renewal',
              description: `Monthly renewal - ${subscription.metadata.credits} credits`,
              stripePaymentIntentId: invoice.payment_intent as string,
            }
          });
          
          console.log(`Added ${subscription.metadata.credits} credits for monthly renewal`);
        }
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
