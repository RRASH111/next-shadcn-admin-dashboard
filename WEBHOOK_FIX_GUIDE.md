# Webhook Fix Guide - Credit Addition Issue

## Problem Identified

After purchasing credits through Stripe, users were not receiving their credits even though the payment was successful. The billing page showed invoices and payment methods, but the credit balance remained unchanged.

## Root Cause

The Stripe webhook handler was not properly processing the `invoice.payment_succeeded` event, which is the primary event that fires when a subscription payment is completed. The credits were only being added in the `checkout.session.completed` event, but for subscriptions, Stripe processes the actual payment through an invoice.

## Changes Made

### 1. Updated Webhook Handler (`src/app/api/webhooks/stripe/route.ts`)

**Before:**
- Only handled `checkout.session.completed` for subscriptions
- Tried to add credits immediately but payment_intent wasn't always available
- `invoice.payment_succeeded` handler didn't properly retrieve subscription metadata

**After:**
- `checkout.session.completed`: Now just logs that subscription was created
- `invoice.payment_succeeded`: **Now properly adds credits** by:
  - Retrieving the subscription from Stripe to get metadata (userId, credits)
  - Checking if it's the first payment (`billing_reason = 'subscription_create'`) or a renewal
  - Preventing duplicate credit additions by checking existing transactions
  - Properly logging all steps for debugging

### 2. Created Credit Stats API (`src/app/api/credits/stats/route.ts`)

New endpoint that provides detailed credit statistics:
- Current balance
- Total credits added (all purchases)
- Total credits used (all verifications)

### 3. Updated Billing Page (`src/app/(main)/dashboard/billing/page.tsx`)

- Replaced hardcoded credit values with real data from the API
- Now shows actual credit balance, usage, and total credits added
- Updates in real-time when credits are purchased or used

## How It Works Now

### Purchase Flow:

1. **User clicks "Subscribe"** on a package
2. **Stripe Checkout** is created with metadata (userId, credits, etc.)
3. **User completes payment**
4. **Stripe sends webhooks:**
   - `checkout.session.completed` → Logged, no action
   - `customer.subscription.created` → Subscription saved to database
   - `invoice.payment_succeeded` → **✅ CREDITS ADDED HERE**
5. **Credits appear** in user's account immediately

### Credit Addition Logic:

```javascript
invoice.payment_succeeded event received
  ↓
Retrieve subscription from Stripe API
  ↓
Get userId and credits from subscription.metadata
  ↓
Check if credits already added (prevent duplicates)
  ↓
Create creditTransaction record
  ↓
Credits available for user!
```

## Testing & Verification

### 1. Check Current Credit Status

Run this script to see all credit transactions:

```bash
node check-credits.js
```

This will show:
- All users and their credit balances
- Recent transactions with dates and types
- Payment intent IDs for tracking

### 2. Test a New Purchase

**In Production:**
1. Go to `/dashboard/topup`
2. Purchase a package (use Stripe test cards if in test mode)
3. Complete the checkout
4. Check the console logs in your deployment dashboard
5. Verify credits appear in `/dashboard/billing`

**Test Card for Stripe Test Mode:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

### 3. Monitor Webhook Events

**In Stripe Dashboard:**
1. Go to: Developers → Webhooks → Select your endpoint
2. Look for recent events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded` ← This should show "succeeded"
3. Click on the event to see the request/response

**In Your Application Logs:**

Look for these log messages:
```
🔔 Stripe webhook received
📋 Processing webhook event: invoice.payment_succeeded
💰 Invoice payment succeeded
✅ Added [X] credits to user [userId] for subscription
```

### 4. Check Database Directly

```sql
-- Check recent credit transactions
SELECT * FROM "CreditTransaction" 
ORDER BY "createdAt" DESC 
LIMIT 10;

-- Check total credits per user
SELECT 
  u.email,
  u.name,
  SUM(ct.amount) as total_credits
FROM "User" u
LEFT JOIN "CreditTransaction" ct ON u.id = ct."userId"
GROUP BY u.id, u.email, u.name;
```

## Important: Webhook Configuration

Make sure your Stripe webhook is configured correctly:

### Required Webhook Events:

Your Stripe webhook should listen to these events:
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded` ← **CRITICAL**
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### Webhook Setup:

1. **Local Development:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Set `STRIPE_WEBHOOK_SECRET` in `.env.local` (from CLI output)

2. **Production:**
   - In Stripe Dashboard: Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select the events listed above
   - Copy the webhook secret to your environment variables

### Environment Variables:

```env
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000 or https://your-domain.com
```

## Troubleshooting

### Credits Still Not Appearing?

1. **Check webhook logs:**
   ```bash
   # Look for errors in your application logs
   # Search for "invoice.payment_succeeded"
   ```

2. **Verify webhook secret:**
   - Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
   - If missing, webhook signature verification will fail

3. **Check subscription metadata:**
   - When creating checkout session, metadata must include:
     - `userId`: Database user ID (not Clerk ID)
     - `credits`: Number of credits as string
     - `organizationId`: User's organization ID

4. **Run the credit check script:**
   ```bash
   node check-credits.js
   ```

5. **Check Stripe Dashboard:**
   - Go to the webhook endpoint
   - Check if `invoice.payment_succeeded` events are being sent
   - Look for any 400/500 errors

### Common Issues:

**Issue:** "Missing userId or credits in subscription metadata"
- **Fix:** Ensure checkout session includes proper metadata in `subscription_data.metadata`

**Issue:** "Credits already added for this payment intent"
- **Status:** This is normal! It means the webhook was called multiple times (Stripe retries)
- The duplicate check prevents double-crediting

**Issue:** Webhook returns 200 but no credits added
- **Check:** Look for error messages in the logs after "invoice.payment_succeeded"
- **Check:** Verify userId in metadata matches actual user ID in database

## Next Steps

1. ✅ Test a purchase in your environment
2. ✅ Monitor the webhook logs during purchase
3. ✅ Verify credits appear in billing dashboard
4. ✅ Run `node check-credits.js` to confirm
5. ✅ Test a verification to see credits decrease

## Support

If credits still aren't being added:
1. Check application logs for webhook errors
2. Verify Stripe webhook configuration
3. Run the diagnostic script: `node check-credits.js`
4. Check that userId in subscription metadata matches database

