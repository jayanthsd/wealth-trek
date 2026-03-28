## 1. Setup & Dependencies

- [x] 1.1 Install `razorpay` npm package as a dependency
- [x] 1.2 Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` environment variables to `.env.local` (with placeholder values) and document in README
- [x] 1.3 Create shared pricing config (`app/src/lib/pricing.ts`) with plan names, amounts in paise, and billing cycles used by both the pricing page and API routes

## 2. Database Schema

- [x] 2.1 Add `subscriptions` table creation to the SQLite database initialization (`CREATE TABLE IF NOT EXISTS`) with columns: id, userId, razorpayOrderId, razorpayPaymentId, plan, billingCycle, amount, currency, status, createdAt, expiresAt

## 3. Server-Side API Routes

- [x] 3.1 Create `POST /api/payments/create-order` route — authenticate with Clerk, validate plan/billingCycle, look up amount from pricing config, call Razorpay Orders API, return `{ orderId, razorpayKeyId, amount, currency }`
- [x] 3.2 Create `POST /api/payments/verify` route — authenticate with Clerk, verify HMAC-SHA256 signature (`order_id|payment_id` with key secret), insert subscription record into SQLite, return `{ success, subscription }`
- [x] 3.3 Create `GET /api/subscription` route — authenticate with Clerk, query subscriptions table for active non-expired subscription for the user, return `{ subscription }` or `{ subscription: null }`

## 4. Client-Side Razorpay Checkout

- [x] 4.1 Create utility function (`app/src/lib/razorpay.ts`) to dynamically load the Razorpay Checkout script with caching (inject `<script>` tag, return promise)
- [x] 4.2 Create `useRazorpayCheckout` hook (`app/src/hooks/useRazorpayCheckout.ts`) that handles the full checkout flow: call create-order API → open Razorpay Checkout modal → on success call verify API → return result/error state

## 5. Pricing Page Updates

- [x] 5.1 Create `useSubscription` hook (`app/src/hooks/useSubscription.ts`) to fetch the authenticated user's current subscription status via `GET /api/subscription`
- [x] 5.2 Update pricing page CTA buttons: unauthenticated users → Clerk sign-up modal (existing), authenticated users on paid tiers → trigger Razorpay Checkout via `useRazorpayCheckout`, Free tier authenticated → navigate to dashboard
- [x] 5.3 Add "Current Plan" badge on the tier card matching the user's active subscription
- [x] 5.4 Add loading state on CTA button while order is being created and Checkout is loading
- [x] 5.5 Add success/failure feedback UI after payment completes (toast or inline message)

## 6. Verification & Cleanup

- [x] 6.1 Test full payment flow end-to-end using Razorpay test mode (test key + test card)
- [x] 6.2 Verify unauthenticated users cannot access payment or subscription APIs (401 responses)
- [x] 6.3 Verify server rejects invalid signatures and does not create subscription records
