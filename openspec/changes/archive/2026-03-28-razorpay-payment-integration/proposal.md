## Why

The pricing page currently displays subscription tiers (Free, Professional, Enterprise) but all CTA buttons redirect to the Clerk sign-up modal with no actual payment processing. Users cannot purchase paid plans. Integrating Razorpay enables the application to accept real payments for Professional and Enterprise tiers, converting the pricing page from a static display into a functional monetization gateway.

## What Changes

- Add Razorpay Checkout integration to the pricing page CTA buttons for paid tiers (Professional, Enterprise)
- Create a server-side API route to generate Razorpay orders with amount, currency, and plan metadata
- Create a server-side API route to verify Razorpay payment signatures after successful checkout
- Store subscription/payment records in the database tied to the authenticated user
- Update pricing page CTAs: Free tier → sign-up flow (existing), paid tiers → Razorpay Checkout flow (new)
- Add a subscription status check so authenticated users see their current plan
- Support both monthly and yearly billing cycles matching the existing toggle
- Handle payment success/failure states with appropriate user feedback

## Capabilities

### New Capabilities
- `razorpay-checkout`: Razorpay order creation, client-side checkout integration, and payment verification flow
- `subscription-management`: Storing, querying, and enforcing user subscription status and plan details

### Modified Capabilities
- `pricing-page`: CTA buttons for paid tiers trigger Razorpay Checkout instead of Clerk sign-up modal; authenticated users see their current plan status

## Impact

- **Dependencies**: New npm package `razorpay` (server-side SDK) for order creation and signature verification
- **Environment variables**: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` required
- **Client-side**: Razorpay Checkout script loaded dynamically on the pricing page
- **Database**: New `subscriptions` table in SQLite for storing payment and plan records
- **API routes**: Two new endpoints — `POST /api/payments/create-order` and `POST /api/payments/verify`
- **Auth**: Payment endpoints require Clerk authentication; subscription status tied to `userId`
- **Existing code**: Pricing page component modified to conditionally render Razorpay checkout vs sign-up flow
