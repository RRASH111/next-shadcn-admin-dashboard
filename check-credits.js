// Check credit transactions for debugging
// Run with: node check-credits.js

import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function checkCredits() {
  try {
    console.log("🔍 Checking credit transactions...\n");

    // Get all users with their credit transactions
    const users = await prisma.user.findMany({
      include: {
        creditTransactions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10, // Last 10 transactions per user
        },
      },
    });

    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (${user.name || "N/A"})`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   Database ID: ${user.id}`);

      if (user.creditTransactions.length === 0) {
        console.log("   ⚠️  No credit transactions found");
      } else {
        // Calculate balance
        const balance = user.creditTransactions.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        console.log(`   💰 Current Balance: ${balance} credits`);

        console.log("\n   📜 Recent Transactions:");
        user.creditTransactions.forEach((tx, index) => {
          const sign = tx.amount >= 0 ? "+" : "";
          console.log(
            `      ${index + 1}. ${sign}${tx.amount} credits - ${tx.type}`
          );
          console.log(`         "${tx.description}"`);
          console.log(`         ${new Date(tx.createdAt).toLocaleString()}`);
          if (tx.stripePaymentIntentId) {
            console.log(`         Payment Intent: ${tx.stripePaymentIntentId}`);
          }
        });
      }
      console.log("\n" + "=".repeat(70));
    }

    console.log("\n✅ Credit check complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCredits();

