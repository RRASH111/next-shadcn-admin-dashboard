// Simple test script to add credits manually
// Run this with: node test-add-credits.js

const testAddCredits = async () => {
  try {
    console.log("🧪 Testing credit addition...");

    // Test adding credits
    const response = await fetch("http://localhost:3000/api/test/add-credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "test-user-id", // Replace with your actual user ID
        credits: "10000",
      }),
    });

    const result = await response.json();
    console.log("✅ Credit addition result:", result);

    // Check balance
    const balanceResponse = await fetch("http://localhost:3000/api/credits/balance");
    const balance = await balanceResponse.json();
    console.log("💰 Current balance:", balance);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

testAddCredits();
