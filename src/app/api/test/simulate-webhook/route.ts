import { NextResponse } from "next/server";

// Test endpoint to simulate Stripe webhook events (for development only)
export async function POST(request: Request) {
  try {
    const { eventType, userId, organizationId, packageId, credits } = await request.json();
    
    if (!eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }
    
    console.log(`🧪 Test: Simulating Stripe webhook event: ${eventType}`);
    
    // Create a mock Stripe event
    const mockEvent = {
      type: eventType,
      data: {
        object: {
          mode: 'subscription',
          metadata: {
            userId: userId || 'test-user-id',
            organizationId: organizationId || 'test-org-id',
            packageId: packageId || '10k',
            credits: credits || '10000'
          },
          payment_intent: 'pi_test_' + Date.now()
        }
      }
    };
    
    // Forward to the actual webhook handler
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockEvent)
    });
    
    const result = await webhookResponse.text();
    
    console.log(`✅ Test: Webhook simulation completed`);
    console.log("Response:", result);
    
    return NextResponse.json({ 
      success: true, 
      message: `Simulated ${eventType} webhook event`,
      webhookResponse: result
    });
    
  } catch (error) {
    console.error("❌ Test: Failed to simulate webhook:", error);
    return NextResponse.json({ error: "Failed to simulate webhook" }, { status: 500 });
  }
}
