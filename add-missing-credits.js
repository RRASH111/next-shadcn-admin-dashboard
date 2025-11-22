// Manual script to add missing credits from past purchases
// Run with: node add-missing-credits.js

import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function addMissingCredits() {
  try {
    console.log("💳 Adding missing credits from past purchases...\n");

    // Get your user
    const user = await prisma.user.findFirst({
      where: {
        email: "ranishwaiki3@gmail.com",
      },
    });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log(`👤 Found user: ${user.email}`);

    // Check current balance
    const currentTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
    });

    const currentBalance = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`💰 Current balance: ${currentBalance} credits\n`);

    // Based on your billing history showing $49 and $129 payments
    // $49 = 25,000 credits (25k package)
    // $129 = 100,000 credits (100k package)

    const purchases = [
      { amount: 25000, price: 49, description: "Manual credit addition - $49 purchase (25k credits)" },
      { amount: 100000, price: 129, description: "Manual credit addition - $129 purchase (100k credits)" },
    ];

    console.log("📦 Adding credits for past purchases:");
    
    for (const purchase of purchases) {
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: purchase.amount,
          type: "purchase",
          description: purchase.description,
        },
      });

      console.log(`   ✅ Added ${purchase.amount.toLocaleString()} credits ($${purchase.price})`);
      console.log(`      Transaction ID: ${transaction.id}\n`);
    }

    // Calculate new balance
    const newTransactions = await prisma.creditTransaction.findMany({
      where: { userId: user.id },
    });

    const newBalance = newTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    console.log(`💰 New balance: ${newBalance.toLocaleString()} credits`);
    console.log(`📈 Added: ${(newBalance - currentBalance).toLocaleString()} credits\n`);

    console.log("✅ Credits added successfully!");
    console.log("🔄 Refresh your billing page to see the updated balance.");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingCredits();

