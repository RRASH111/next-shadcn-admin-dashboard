#!/usr/bin/env node

// Environment Variables Validation Script
// Run this to check if all required environment variables are set correctly

const requiredVars = {
  DATABASE_URL: {
    required: true,
    description: "PostgreSQL database connection string",
    example: "postgresql://username:password@localhost:5432/database_name?schema=public",
  },
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
    required: true,
    description: "Clerk publishable key for authentication",
    example: "pk_test_...",
    validate: (value) => value.startsWith("pk_test_") || value.startsWith("pk_live_"),
  },
  CLERK_SECRET_KEY: {
    required: true,
    description: "Clerk secret key for authentication",
    example: "sk_test_...",
    validate: (value) => value.startsWith("sk_test_") || value.startsWith("sk_live_"),
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: "Stripe publishable key for payments",
    example: "pk_test_...",
    validate: (value) => value.startsWith("pk_test_") || value.startsWith("pk_live_"),
  },
  STRIPE_SECRET_KEY: {
    required: true,
    description: "Stripe secret key for payments",
    example: "sk_test_...",
    validate: (value) => value.startsWith("sk_test_") || value.startsWith("sk_live_"),
  },
  NEXT_PUBLIC_APP_URL: {
    required: true,
    description: "Your app URL for redirects",
    example: "http://localhost:3000",
  },
  WEBHOOK_SECRET: {
    required: false,
    description: "Clerk webhook secret (optional for testing)",
    example: "whsec_...",
  },
  STRIPE_WEBHOOK_SECRET: {
    required: false,
    description: "Stripe webhook secret (optional for testing)",
    example: "whsec_...",
  },
};

console.log("🔍 Checking environment variables...\n");

let hasErrors = false;
let hasWarnings = false;

for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];

  if (!value) {
    if (config.required) {
      console.log(`❌ ${varName}: MISSING (REQUIRED)`);
      console.log(`   Description: ${config.description}`);
      console.log(`   Example: ${config.example}\n`);
      hasErrors = true;
    } else {
      console.log(`⚠️  ${varName}: MISSING (OPTIONAL)`);
      console.log(`   Description: ${config.description}\n`);
      hasWarnings = true;
    }
  } else {
    if (config.validate && !config.validate(value)) {
      console.log(`❌ ${varName}: INVALID FORMAT`);
      console.log(`   Current value: ${value.substring(0, 20)}...`);
      console.log(`   Expected format: ${config.example}\n`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: OK`);
      if (varName.includes("SECRET") || varName.includes("KEY")) {
        console.log(`   Value: ${value.substring(0, 10)}...`);
      } else {
        console.log(`   Value: ${value}`);
      }
      console.log("");
    }
  }
}

console.log("📋 Summary:");
if (hasErrors) {
  console.log("❌ You have ERRORS that must be fixed before the app will work.");
  console.log("   Create a .env.local file with the missing variables.");
} else if (hasWarnings) {
  console.log("⚠️  You have WARNINGS (optional variables missing).");
  console.log("   The app should work, but some features may be limited.");
} else {
  console.log("✅ All environment variables are properly configured!");
}

console.log("\n📖 For detailed setup instructions, see: STRIPE_SETUP_COMPLETE.md");
