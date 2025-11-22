// Debug script to check webhook processing
// Run with: node debug-webhook.js

import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function debugWebhook() {
  try {
    console.log("🔍 Debugging webhook credit issue...\n");

    // Get your user
    const user = await prisma.user.findFirst({
      where: {
        email: "ranishwaiki3@gmail.com", // Your email from the screenshot
      },
      include: {
        creditTransactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
        organization: true,
      },
    });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("👤 User Information:");
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Database ID: ${user.id}`);
    console.log(`   Clerk ID: ${user.clerkId}`);
    console.log(`   Organization ID: ${user.organization?.id || "None"}`);
    console.log(`   Stripe Customer ID: ${user.organization?.stripeCustomerId || "None"}`);

    console.log("\n📜 Credit Transactions:");
    if (user.creditTransactions.length === 0) {
      console.log("   ⚠️  No transactions found!");
    } else {
      user.creditTransactions.forEach((tx, index) => {
        const sign = tx.amount >= 0 ? "+" : "";
        console.log(`   ${index + 1}. ${sign}${tx.amount} credits`);
        console.log(`      Type: ${tx.type}`);
        console.log(`      Description: ${tx.description}`);
        console.log(`      Date: ${new Date(tx.createdAt).toLocaleString()}`);
        if (tx.stripePaymentIntentId) {
          console.log(`      Stripe Payment Intent: ${tx.stripePaymentIntentId}`);
        }
        console.log("");
      });
    }

    const balance = user.creditTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`💰 Current Balance: ${balance} credits\n`);

    // Check subscriptions
    console.log("🔄 Checking Subscriptions:");
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (subscriptions.length === 0) {
      console.log("   ⚠️  No subscriptions found in database!");
      console.log("   This might mean webhooks aren't being received.\n");
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Subscription: ${sub.stripeSubscriptionId}`);
        console.log(`      Status: ${sub.stripeStatus}`);
        console.log(`      Created: ${new Date(sub.createdAt).toLocaleString()}\n`);
      });
    }

    console.log("\n📋 Next Steps:");
    console.log("1. Check if Stripe webhook is configured and receiving events");
    console.log("2. Look at application logs for 'invoice.payment_succeeded' events");
    console.log("3. Verify STRIPE_WEBHOOK_SECRET is set correctly");
    console.log("4. Check Stripe Dashboard → Developers → Webhooks for errors");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWebhook();

