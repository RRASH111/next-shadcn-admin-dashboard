# Complete Stripe Setup Guide

## 🚨 CRITICAL: Environment Variables Required

Create a `.env.local` file in your project root with these EXACT variables:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"

# ===========================================
# CLERK AUTHENTICATION
# ===========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/v1/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/v1/register"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# ===========================================
# STRIPE PAYMENTS (REQUIRED FOR CHECKOUT)
# ===========================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ===========================================
# WEBHOOKS (OPTIONAL FOR TESTING)
# ===========================================
WEBHOOK_SECRET="whsec_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===========================================
# MILLIONVERIFIER API (OPTIONAL)
# ===========================================
MILLION_VERIFIER_API_KEY="your_api_key_here"
```

## 🔧 How to Get Stripe Keys

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/
2. Sign up for a free account
3. **IMPORTANT**: Make sure you're in "Test mode" (toggle in top left)

### Step 2: Get API Keys
1. Go to "Developers" → "API keys"
2. Copy the keys:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### Step 3: Test Your Keys
Your Stripe keys should look like:
- `pk_test_51...` (publishable key)
- `sk_test_51...` (secret key)

## 🔧 How to Get Clerk Keys

### Step 1: Create Clerk Account
1. Go to https://dashboard.clerk.com/
2. Sign up for a free account

### Step 2: Create Application
1. Click "Add application"
2. Choose "Next.js" framework
3. Copy the keys from the dashboard

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
psql -U postgres
CREATE DATABASE saas_db;
\q

# Update DATABASE_URL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/saas_db?schema=public"
```

### Option 2: Cloud Database (Neon)
1. Go to https://neon.tech/
2. Create free account
3. Create new project
4. Copy connection string to `DATABASE_URL`

## 🚀 After Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npx prisma migrate dev
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test Checkout Flow
1. Go to http://localhost:3000
2. Sign up for an account
3. Go to Dashboard → Add Credits
4. Try to purchase a credit package

## 🐛 Common Issues & Solutions

### Issue: "App URL configuration missing"
**Solution**: Set `NEXT_PUBLIC_APP_URL="http://localhost:3000"` in `.env.local`

### Issue: "Stripe configuration missing"
**Solution**: Set `STRIPE_SECRET_KEY="sk_test_..."` in `.env.local`

### Issue: "Database configuration missing"
**Solution**: Set `DATABASE_URL="postgresql://..."` in `.env.local`

### Issue: "Organization not found"
**Solution**: This is now fixed - organizations are created automatically

### Issue: Port conflicts
**Solution**: Kill all Node processes and restart:
```bash
taskkill /F /IM node.exe
npm run dev
```

## ✅ Verification Checklist

- [ ] `.env.local` file created with all required variables
- [ ] Stripe keys are valid (start with `pk_test_` and `sk_test_`)
- [ ] Clerk keys are valid
- [ ] Database is accessible
- [ ] No port conflicts (only one dev server running)
- [ ] Database migrations completed
- [ ] Can sign up/sign in to the app
- [ ] Checkout flow works without errors

## 🆘 Still Having Issues?

If you're still getting errors:

1. **Check the server console** - it will show exactly which environment variable is missing
2. **Verify your keys** - make sure they're copied correctly (no extra spaces)
3. **Restart the server** - after adding environment variables
4. **Check the port** - make sure you're accessing the correct port (usually 3000 or 3001)
