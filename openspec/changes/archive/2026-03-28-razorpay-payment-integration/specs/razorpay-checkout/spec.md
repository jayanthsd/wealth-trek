## ADDED Requirements

### Requirement: Server creates Razorpay orders for paid plans
The system SHALL provide a `POST /api/payments/create-order` endpoint that creates a Razorpay order for the requested plan and billing cycle, returning the order ID and Razorpay key ID to the client.

#### Scenario: Authenticated user requests order for Professional monthly
- **WHEN** an authenticated user sends a POST request with `{ plan: "professional", billingCycle: "monthly" }`
- **THEN** the system SHALL create a Razorpay order for ₹250 (25000 paise) in INR and return `{ orderId, razorpayKeyId, amount, currency }`

#### Scenario: Authenticated user requests order for Professional yearly
- **WHEN** an authenticated user sends a POST request with `{ plan: "professional", billingCycle: "yearly" }`
- **THEN** the system SHALL create a Razorpay order for ₹2,500 (250000 paise) in INR and return `{ orderId, razorpayKeyId, amount, currency }`

#### Scenario: Authenticated user requests order for Enterprise monthly
- **WHEN** an authenticated user sends a POST request with `{ plan: "enterprise", billingCycle: "monthly" }`
- **THEN** the system SHALL create a Razorpay order for ₹4,999 (499900 paise) in INR and return `{ orderId, razorpayKeyId, amount, currency }`

#### Scenario: Authenticated user requests order for Enterprise yearly
- **WHEN** an authenticated user sends a POST request with `{ plan: "enterprise", billingCycle: "yearly" }`
- **THEN** the system SHALL create a Razorpay order for ₹49,990 (4999000 paise) in INR and return `{ orderId, razorpayKeyId, amount, currency }`

#### Scenario: Unauthenticated request rejected
- **WHEN** an unauthenticated request is sent to POST /api/payments/create-order
- **THEN** the system SHALL return HTTP 401 with `{ error: "Unauthorized" }`

#### Scenario: Invalid plan rejected
- **WHEN** an authenticated user sends a POST request with an invalid plan name
- **THEN** the system SHALL return HTTP 400 with `{ error: "Invalid plan" }`

### Requirement: Server verifies Razorpay payment signatures
The system SHALL provide a `POST /api/payments/verify` endpoint that verifies the Razorpay payment signature using HMAC-SHA256 and records the subscription on success.

#### Scenario: Valid payment signature verified
- **WHEN** an authenticated user sends a POST request with valid `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`
- **THEN** the system SHALL verify the signature using `HMAC-SHA256(order_id + "|" + payment_id, key_secret)`, create a subscription record, and return `{ success: true, subscription }` with the plan details

#### Scenario: Invalid payment signature rejected
- **WHEN** an authenticated user sends a POST request with an invalid `razorpay_signature`
- **THEN** the system SHALL return HTTP 400 with `{ error: "Invalid payment signature" }` and NOT create a subscription record

#### Scenario: Unauthenticated verification rejected
- **WHEN** an unauthenticated request is sent to POST /api/payments/verify
- **THEN** the system SHALL return HTTP 401 with `{ error: "Unauthorized" }`

### Requirement: Client-side Razorpay Checkout integration
The system SHALL open the Razorpay Checkout modal when a user clicks a paid tier CTA on the pricing page, pre-filled with the order details from the server.

#### Scenario: User clicks Professional tier CTA
- **WHEN** an authenticated user clicks the Professional tier CTA button
- **THEN** the system SHALL call the create-order API, load the Razorpay Checkout script if not already loaded, and open the Checkout modal with the returned order ID, amount, currency, and the application name as the merchant

#### Scenario: Payment succeeds in Checkout
- **WHEN** the Razorpay Checkout modal reports a successful payment with `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`
- **THEN** the system SHALL send these to the verify endpoint and display a success message upon verification

#### Scenario: Payment cancelled or failed in Checkout
- **WHEN** the user closes the Razorpay Checkout modal or the payment fails
- **THEN** the system SHALL display an appropriate message and allow the user to retry

### Requirement: Razorpay Checkout script loaded dynamically
The system SHALL load the Razorpay Checkout script (`https://checkout.razorpay.com/v1/checkout.js`) dynamically only when a payment flow is initiated, not on initial page load.

#### Scenario: Script loaded on first payment click
- **WHEN** the user clicks a paid tier CTA for the first time in the session
- **THEN** the system SHALL inject the Razorpay Checkout script into the document and wait for it to load before opening Checkout

#### Scenario: Script cached on subsequent clicks
- **WHEN** the user clicks a paid tier CTA after the script has already been loaded
- **THEN** the system SHALL reuse the already-loaded script without re-injecting it

### Requirement: Pricing amounts validated server-side
The system SHALL determine payment amounts from a server-side pricing configuration, never trusting client-supplied amounts.

#### Scenario: Server uses canonical pricing for order creation
- **WHEN** the create-order endpoint receives a plan and billing cycle
- **THEN** the system SHALL look up the amount from a server-side pricing map and use that amount for the Razorpay order, ignoring any amount sent by the client
