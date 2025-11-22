# Webhook Not Working - Debug Checklist

## Current Situation
- ✅ Subscription Status: **Active**
- ✅ Payment: **$37.00 received**
- ❌ Credits: **Still 500** (only initial signup bonus)
- ❌ Expected: **10,500 credits** (500 + 10,000)

This means webhooks are NOT processing correctly!

---

## Quick Fix: Add Missing Credits NOW

Run this to add your 10,000 credits immediately:

```bash
node fix-missing-credits.js
```

Then investigate why webhooks aren't working for future purchases.

---

## Step-by-Step Debugging

### 1️⃣ Check if Stripe is Sending Webhooks

**Go to Stripe Dashboard:**
1. https://dashboard.stripe.com/test/webhooks (or /live/ for production)
2. Click on your webhook endpoint
3. Look for **"Events"** or **"Recent deliveries"**

**What to look for:**
- ✅ **GOOD:** You see events like `invoice.payment_succeeded`, `customer.subscription.created`
- ❌ **BAD:** No events or very few events

**If NO events:**
- Stripe isn't sending webhooks at all
- Check webhook is enabled
- Check webhook URL is correct: `https://zin-nine.vercel.app/api/webhooks/stripe`

**If events exist but show errors:**
- Click on an event to see the response
- Check for 400/500 errors
- Copy the error message

---

### 2️⃣ Check Vercel Logs for Webhook Calls

**In Vercel Dashboard:**
1. Go to your project → **Logs** tab
2. Filter by: `/api/webhooks/stripe`
3. Look for POST requests

**What to look for:**
```
✅ GOOD:
POST 200 /api/webhooks/stripe
🔔 Stripe webhook received
💰 Invoice payment succeeded
✅ Added 10000 credits to user

❌ BAD:
POST 500 /api/webhooks/stripe
❌ Webhook signature verification failed

❌ WORST:
No POST requests to /api/webhooks/stripe at all!
```

---

### 3️⃣ Check Database for Webhook Processing

**After deploying new code, visit:**
```
https://zin-nine.vercel.app/api/webhooks/stripe-logs
```

This will show:
- All your credit transactions
- All subscriptions in database
- Whether webhooks created any transactions
- Analysis of what's missing

---

### 4️⃣ Verify Webhook Configuration in Stripe

**Check these settings:**

1. **Webhook URL:** `https://zin-nine.vercel.app/api/webhooks/stripe`
   - Must be HTTPS
   - Must be publicly accessible
   - No trailing slash

2. **API Version:** Should match or be compatible
   - Check in Stripe Dashboard → Webhook → API version

3. **Events to Listen:**
   - ✅ `invoice.payment_succeeded` ← CRITICAL!
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

4. **Webhook Status:** Should be **Enabled** (not disabled)

---

### 5️⃣ Test Webhook Manually in Stripe

**In Stripe Dashboard:**
1. Go to Webhooks → Click your endpoint
2. Click **"Send test webhook"**
3. Select `invoice.payment_succeeded`
4. Add test data if needed
5. Click **Send test webhook**
6. Check the response

**Expected response:** `200 OK`

**If error:**
- Check the error message
- Check Vercel logs for what failed

---

## Common Issues & Solutions

### Issue 1: Webhook Secret Mismatch

**Symptoms:**
- Stripe shows "401 Unauthorized" or "400 Bad Request"
- Vercel logs show: "Webhook signature verification failed"

**Solution:**
1. Get webhook secret from Stripe Dashboard
2. Update in Vercel: Settings → Environment Variables
3. Set: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
4. Redeploy application

---

### Issue 2: Webhook URL Not Set

**Symptoms:**
- No events in Stripe webhook dashboard
- Stripe shows "No recent deliveries"

**Solution:**
1. In Stripe → Webhooks → Add endpoint
2. URL: `https://zin-nine.vercel.app/api/webhooks/stripe`
3. Select all required events
4. Save

---

### Issue 3: Webhook Receiving Events But Not Adding Credits

**Symptoms:**
- Stripe shows 200 OK
- Vercel logs show webhook received
- But no credits added

**Check Vercel logs for:**
```
❌ Missing userId or credits in subscription metadata
❌ Failed to create credit transaction
```

**Solution:**
- Database connection issue
- User ID mismatch
- Run: `node fix-missing-credits.js` to add manually

---

### Issue 4: Test Mode vs Live Mode Mismatch

**Symptoms:**
- You're using test card but webhook is in live mode (or vice versa)

**Solution:**
- Make sure webhook mode matches your Stripe keys
- Test mode webhook for `sk_test_...` keys
- Live mode webhook for `sk_live_...` keys

---

## Testing Checklist

After fixing webhook configuration:

- [ ] Deploy latest code: `git push`
- [ ] Check webhook URL in Stripe is correct
- [ ] Verify webhook secret in Vercel matches Stripe
- [ ] Send test webhook from Stripe Dashboard
- [ ] Check Vercel logs show webhook received
- [ ] Check `/api/webhooks/stripe-logs` for transactions
- [ ] Try a new test subscription
- [ ] Verify credits appear in billing page

---

## Emergency: Add Credits Manually

If webhooks still don't work, add your missing credits:

```bash
# Add missing 10k credits from $37 payment
node fix-missing-credits.js
```

This adds credits to your account immediately while you debug the webhook issue.

---

## Next Steps

1. **First:** Run `node fix-missing-credits.js` to get your credits
2. **Then:** Check Stripe Dashboard → Webhooks for events
3. **Share:** Screenshot of webhook events page
4. **Check:** `https://zin-nine.vercel.app/api/webhooks/stripe-logs`
5. **Test:** Send test webhook from Stripe Dashboard

---

## What to Share for Help

If still not working, share:
1. Screenshot of Stripe Webhook events page
2. Screenshot of Vercel logs filtering `/api/webhooks/stripe`
3. Output from: `https://zin-nine.vercel.app/api/webhooks/stripe-logs`
4. What happens when you click "Send test webhook" in Stripe

