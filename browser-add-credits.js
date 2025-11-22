// Simple script to add credits using the API
// Run this in your browser console at http://localhost:3000

console.log("🧪 Adding credits for successful Stripe checkout...");

// Your user ID from the server logs
const userId = "cmh8egrkk0008uofgv321bd6j";
const credits = 10000; // 10k package

// Add credits using the test API
fetch("/api/test/add-credits", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    userId: userId,
    credits: credits.toString(),
  }),
})
  .then((response) => response.json())
  .then((result) => {
    console.log("✅ Credit addition result:", result);

    // Check balance
    return fetch("/api/credits/balance");
  })
  .then((response) => response.json())
  .then((balance) => {
    console.log("💰 Current balance:", balance);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
  });
