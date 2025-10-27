import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Test endpoint to manually add credits (for development only)
export async function POST(request: Request) {
  try {
    const { userId, credits } = await request.json();
    
    if (!userId || !credits) {
      return NextResponse.json({ error: "userId and credits are required" }, { status: 400 });
    }
    
    console.log(`🧪 Test: Adding ${credits} credits to user ${userId}`);
    
    const creditTransaction = await prisma.creditTransaction.create({
      data: {
        userId: userId,
        amount: parseInt(credits),
        type: 'test',
        description: `Test credit addition - ${credits} credits`,
      }
    });
    
    console.log(`✅ Test: Added ${credits} credits to user ${userId}`);
    console.log("Credit transaction ID:", creditTransaction.id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${credits} credits to user ${userId}`,
      transactionId: creditTransaction.id
    });
    
  } catch (error) {
    console.error("❌ Test: Failed to add credits:", error);
    return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
  }
}
