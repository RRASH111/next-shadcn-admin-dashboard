# Fix Credits Not Adding - Step by Step

## Problem
You have 500 credits (initial signup bonus) but your two purchases ($49 and $129) didn't add credits.
**Expected:** 125,500 credits (500 + 25,000 + 100,000)
**Actual:** 500 credits

This means the Stripe webhook is NOT processing `invoice.payment_succeeded` events.

---

## Quick Fix: Add Credits Manually (RIGHT NOW)

While we debug the webhook, let's add your missing credits:

```bash
node add-missing-credits.js
```

This will add 125,000 credits to your account immediately. Refresh the billing page to see them.

---

## Root Cause Investigation

### Step 1: Check Environment Variables

Open your `.env.local` or `.env` file and verify:

```env
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...  # THIS IS CRITICAL!
NEXT_PUBLIC_APP_URL=your-app-url
```

**If `STRIPE_WEBHOOK_SECRET` is missing or incorrect, webhooks will fail!**

### Step 2: Run Debug Script

```bash
node debug-webhook.js
```

This will show:
- Your user information
- All credit transactions
- Subscriptions in database
- What might be wrong

### Step 3: Check Application Logs

Look in your terminal/logs for these messages after a purchase:

**✅ Good (webhook working):**
```
🔔 Stripe webhook received
📋 Processing webhook event: invoice.payment_succeeded
💰 Invoice payment succeeded
✅ Added 25000 credits to user [userId] for subscription
```

**❌ Bad (webhook not working):**
- No webhook messages at all
- Error messages about signature verification
- "Missing userId or credits in subscription metadata"

### Step 4: Check Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks (or /live/webhooks for production)
2. Click on your webhook endpoint
3. Look for recent events
4. Check for these specific events:
   - `invoice.payment_succeeded` - This MUST be present
   - Look for any 400/500 error responses

---

## Most Common Issues & Fixes

### Issue 1: Webhook Secret Not Set

**Problem:** `STRIPE_WEBHOOK_SECRET` is missing

**Fix:**
1. In Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. Click "Reveal" on the webhook secret
4. Copy it to your `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
5. Restart your app

### Issue 2: Webhook Not Configured

**Problem:** Stripe isn't sending webhooks to your app

**Fix for Production:**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - ✅ `invoice.payment_succeeded`
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
4. Save and copy the webhook secret

**Fix for Local Development:**
```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook secret that appears (starts with whsec_)
# Add it to .env.local
```

### Issue 3: Wrong User ID in Metadata

**Problem:** Webhook receives event but can't find user

**Check logs for:** "Missing userId or credits in subscription metadata"

**Fix:**
The checkout session needs the correct database user ID (not Clerk ID):
- Run: `node debug-webhook.js` to see your database ID
- Ensure it matches what's in the subscription metadata

### Issue 4: Webhook Signature Verification Failing

**Problem:** Webhook secret is wrong or missing

**Check logs for:** "Webhook signature verification failed"

**Fix:**
1. Get the correct webhook secret from Stripe Dashboard
2. Update `.env.local`
3. Restart app

---

## Testing After Fix

### 1. Test with Stripe CLI (Local)

```bash
# Terminal 1: Run your app
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Trigger a test invoice payment
stripe trigger invoice.payment_succeeded
```

Check if credits are added.

### 2. Test with Real Purchase

1. Go to `/dashboard/topup`
2. Choose a package
3. Use test card: `4242 4242 4242 4242`
4. Complete purchase
5. Watch application logs for webhook events
6. Check billing page for new credits

### 3. Verify in Database

```bash
node check-credits.js
```

Should show all transactions including new purchase.

---

## If Still Not Working

### Check This:

1. **Is the app restarted after env changes?**
   - Changes to `.env` require restart

2. **Is webhook URL correct?**
   - Must be publicly accessible (not localhost in production)
   - Must end with `/api/webhooks/stripe`

3. **Are webhooks being received at all?**
   - Check Stripe Dashboard → Webhooks → Click endpoint → Events
   - Should see events being sent

4. **Check Network tab in browser:**
   - After purchase, does redirect happen?
   - Does success page appear?

5. **Manual webhook test:**
   - Stripe Dashboard → Webhooks → Your endpoint
   - Click "Send test webhook"
   - Choose `invoice.payment_succeeded`
   - Check if credits appear

---

## Emergency: Add Credits Manually

If you need credits RIGHT NOW while debugging:

```bash
node add-missing-credits.js
```

This adds the credits from your past purchases immediately.

---

## Contact Points for More Help

After running the debug script, share:
1. Output from `node debug-webhook.js`
2. Application logs during/after purchase
3. Screenshot of Stripe Webhook events page
4. Value of `STRIPE_WEBHOOK_SECRET` (first 10 characters only)

