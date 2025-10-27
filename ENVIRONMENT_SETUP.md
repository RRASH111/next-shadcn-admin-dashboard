# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/v1/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/v1/register"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Clerk Webhook
WEBHOOK_SECRET="whsec_..."

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# MillionVerifier API (optional)
MILLION_VERIFIER_API_KEY="your_api_key_here"
```

## How to Get These Keys

### 1. Clerk Setup
1. Go to https://dashboard.clerk.com/
2. Create a new application
3. Go to "API Keys" section
4. Copy the keys to your `.env.local`

### 2. Stripe Setup
1. Go to https://dashboard.stripe.com/
2. Make sure you're in "Test mode"
3. Go to "Developers" → "API keys"
4. Copy the keys to your `.env.local`

### 3. Database Setup
1. Set up a PostgreSQL database (local or cloud like Neon)
2. Copy the connection string to `DATABASE_URL`

## After Setting Up Environment Variables

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Test the checkout flow

## Common Issues

- **500 Error**: Usually means missing environment variables
- **Database errors**: Check your DATABASE_URL
- **Authentication errors**: Check your Clerk keys
- **Payment errors**: Check your Stripe keys
