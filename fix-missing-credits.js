// Fix missing credits from your $37 subscription
// Run with: node fix-missing-credits.js

import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function fixMissingCredits() {
  try {
    console.log("🔧 Fixing missing credits...\n");

    // Find user by email (from your screenshot)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "raniten111@gmail.com" },
          { email: "ranishwaiki3@gmail.com" },
        ],
      },
    });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log(`👤 Found user: ${user.email}`);
    console.log(`   Database ID: ${user.id}\n`);

    // Check current transactions
    const currentTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("📜 Current Transactions:");
    currentTransactions.forEach((tx) => {
      const sign = tx.amount >= 0 ? "+" : "";
      console.log(`   ${sign}${tx.amount} - ${tx.type} - ${tx.description}`);
    });

    const currentBalance = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`\n💰 Current Balance: ${currentBalance} credits\n`);

    // Check subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
    });

    console.log(`📋 Found ${subscriptions.length} subscription(s)\n`);

    if (subscriptions.length === 0) {
      console.log("⚠️  No subscriptions found in database!");
      console.log("This means the webhook never processed the subscription creation.\n");
    }

    // Based on your billing showing $37 payment
    // $37 = 10,000 credits (10k package)
    const creditsToAdd = 10000;

    console.log(`💳 Adding ${creditsToAdd.toLocaleString()} credits for $37 subscription payment...\n`);

    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        amount: creditsToAdd,
        type: "subscription",
        description: "Manual credit addition - $37 subscription (10k credits)",
      },
    });

    console.log(`✅ Added ${creditsToAdd.toLocaleString()} credits`);
    console.log(`   Transaction ID: ${transaction.id}\n`);

    // Calculate new balance
    const newTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
    });

    const newBalance = newTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`💰 New Balance: ${newBalance.toLocaleString()} credits`);
    console.log(`📈 Added: ${(newBalance - currentBalance).toLocaleString()} credits\n`);

    console.log("✅ Credits fixed! Refresh your billing page to see them.\n");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingCredits();

