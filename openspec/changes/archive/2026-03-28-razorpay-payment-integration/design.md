## Context

The Wealth Tracker application has a pricing page displaying three tiers (Free, Professional, Enterprise) with monthly/yearly toggle. Currently, all CTA buttons trigger the Clerk sign-up modal — no actual payment processing exists. The app uses Next.js 16 (App Router), Clerk for auth, SQLite (better-sqlite3) for persistence, and is deployed on Vercel.

Razorpay is the chosen payment gateway. It provides a server-side Node.js SDK for order creation and a client-side Checkout.js script for the payment UI. The integration follows Razorpay's standard flow: server creates an order → client opens Checkout → server verifies the payment signature.

## Goals / Non-Goals

**Goals:**
- Accept one-time payments for Professional and Enterprise tiers via Razorpay Checkout
- Support both monthly and yearly billing amounts matching the pricing toggle
- Verify payment authenticity server-side using Razorpay signature verification
- Persist subscription records in SQLite tied to authenticated Clerk users
- Show current plan status to authenticated users on the pricing page

**Non-Goals:**
- Recurring/auto-renewal subscriptions via Razorpay Subscriptions API (manual renewal for now)
- Webhook-based payment status sync (out of scope for initial integration)
- Refund processing through the app (handled via Razorpay Dashboard)
- Plan enforcement / feature gating (separate future change)
- Enterprise "Contact Sales" flow — remains a placeholder

## Decisions

### 1. Razorpay Orders API + Checkout.js (not Payment Links or Subscriptions API)

**Choice:** Use Razorpay Orders API for server-side order creation and Checkout.js for client-side payment collection.

**Rationale:** Orders API + Checkout.js is Razorpay's recommended standard integration. It gives full control over the payment flow, supports custom UI triggers, and keeps the server as the source of truth for order amounts. Payment Links would remove us from the flow; Subscriptions API adds recurring billing complexity we don't need yet.

**Alternatives considered:**
- *Razorpay Subscriptions API*: Handles auto-renewal but adds plan management overhead and requires webhook setup. Deferred to a future iteration.
- *Razorpay Payment Links*: Redirects users away from the app. Poor UX for an in-app pricing page.

### 2. Dynamic Checkout.js script loading (not bundled)

**Choice:** Load `https://checkout.razorpay.com/v1/checkout.js` dynamically when the user clicks a paid tier CTA, rather than including it in the page bundle.

**Rationale:** Keeps initial page load fast. The script is only needed when a user initiates payment. A small utility function handles the script injection and caches it for subsequent clicks.

### 3. SQLite `subscriptions` table (not external subscription service)

**Choice:** Store subscription records in the existing SQLite database alongside statements and snapshots.

**Rationale:** Consistent with the current persistence architecture. No new infrastructure required. The table stores: `id`, `userId`, `razorpayOrderId`, `razorpayPaymentId`, `plan`, `billingCycle`, `amount`, `currency`, `status`, `createdAt`, `expiresAt`.

**Alternatives considered:**
- *Razorpay as source of truth*: Would require API calls on every page load to check subscription status. Slower and adds external dependency for reads.
- *localStorage*: Not secure — users could fake subscription status.

### 4. Server-side signature verification (not client-side trust)

**Choice:** After Razorpay Checkout succeeds on the client, POST the `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to a server endpoint that verifies the HMAC-SHA256 signature using the Razorpay key secret before recording the subscription.

**Rationale:** This is Razorpay's mandated verification flow. Client-side payment confirmation alone is untrusted — the server must verify to prevent spoofed payments.

### 5. Two API routes under `/api/payments/`

- `POST /api/payments/create-order`: Authenticated. Accepts `{ plan, billingCycle }`. Creates a Razorpay order and returns `orderId` + Razorpay key ID.
- `POST /api/payments/verify`: Authenticated. Accepts `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, billingCycle }`. Verifies signature, creates subscription record, returns subscription status.

**Rationale:** Clean separation between order creation and payment verification. Both require Clerk auth to tie payments to users.

### 6. Pricing amounts defined server-side

**Choice:** The canonical plan pricing lives in a shared config object used by both the pricing page (display) and the create-order API (amount validation). The server never trusts client-supplied amounts.

**Rationale:** Prevents price tampering. The client sends `plan` + `billingCycle`; the server looks up the correct amount.

## Risks / Trade-offs

- **No auto-renewal** → Users must manually re-subscribe when their plan expires. Acceptable for MVP; Razorpay Subscriptions API can be added later.
- **No webhooks** → If a user closes the browser after payment but before verification callback, the payment is captured by Razorpay but not recorded locally. Mitigation: Add a `/api/payments/status` endpoint that can reconcile by checking Razorpay's API for a given order ID, or add webhooks in a follow-up change.
- **SQLite on Vercel** → SQLite works in Vercel serverless functions with `better-sqlite3` (already in use), but each function invocation gets a fresh connection. This is fine for the current scale. The existing app already operates this way.
- **Razorpay script CSP** → Loading `checkout.razorpay.com` requires appropriate Content-Security-Policy headers if CSP is enforced. Currently no strict CSP is configured, so no immediate issue.
- **Environment secrets** → `RAZORPAY_KEY_SECRET` must never be exposed to the client. Only `RAZORPAY_KEY_ID` (prefixed `NEXT_PUBLIC_` or returned from the create-order API) is sent to the browser.
