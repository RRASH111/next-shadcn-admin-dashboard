// Test script to simulate Stripe webhook and add credits
// Run this with: node test-webhook.js

const testWebhook = async () => {
  try {
    console.log("🧪 Testing webhook simulation...");

    // Simulate a checkout.session.completed webhook
    const response = await fetch("http://localhost:3000/api/test/simulate-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "checkout.session.completed",
        userId: "test-user-id", // Replace with your actual user ID
        organizationId: "test-org-id",
        packageId: "10k",
        credits: "10000",
      }),
    });

    const result = await response.json();
    console.log("✅ Webhook simulation result:", result);

    // Check balance
    const balanceResponse = await fetch("http://localhost:3000/api/credits/balance");
    const balance = await balanceResponse.json();
    console.log("💰 Current balance:", balance);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

testWebhook();
