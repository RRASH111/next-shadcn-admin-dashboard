// Add credits for successful Stripe checkout
// User ID from logs: cmh8egrkk0008uofgv321bd6j
// Package: 10k = 10,000 credits

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCredits() {
  try {
    console.log('🧪 Adding credits for successful Stripe checkout...');
    
    const userId = 'cmh8egrkk0008uofgv321bd6j'; // From server logs
    const credits = 10000; // 10k package
    
    // Add credit transaction
    const creditTransaction = await prisma.creditTransaction.create({
      data: {
        userId: userId,
        amount: credits,
        type: 'subscription',
        description: `Stripe checkout completed - ${credits} credits (cs_test_a1cpMgt9RFmCzcD0JF7S7IddsdN1jDPAQuSRn5xKVW8kmeeFNcnvTRQwhN)`,
        stripePaymentIntentId: 'pi_manual_addition_' + Date.now(),
      }
    });
    
    console.log('✅ Credits added successfully!');
    console.log('Transaction ID:', creditTransaction.id);
    console.log('Credits added:', credits);
    
    // Check current balance
    const transactions = await prisma.creditTransaction.findMany({
      where: { userId: userId }
    });
    
    const totalCredits = transactions.reduce((sum, t) => sum + t.amount, 0);
    console.log('💰 Total credits now:', totalCredits);
    
  } catch (error) {
    console.error('❌ Error adding credits:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCredits();
