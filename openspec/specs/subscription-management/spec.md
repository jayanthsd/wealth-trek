# Subscription Management

## Purpose

This specification defines the requirements for managing user subscriptions, including database persistence, subscription status tracking, and user-specific subscription queries.

## Requirements

### Requirement: Subscriptions database table
The system SHALL create a `subscriptions` table in the SQLite database with columns: `id` (TEXT PRIMARY KEY), `userId` (TEXT NOT NULL), `razorpayOrderId` (TEXT NOT NULL), `razorpayPaymentId` (TEXT NOT NULL), `plan` (TEXT NOT NULL), `billingCycle` (TEXT NOT NULL), `amount` (INTEGER NOT NULL), `currency` (TEXT NOT NULL), `status` (TEXT NOT NULL), `createdAt` (TEXT NOT NULL), `expiresAt` (TEXT NOT NULL).

#### Scenario: Table created on first access
- **WHEN** the server accesses the database and the `subscriptions` table does not exist
- **THEN** the system SHALL create the table with the defined schema

#### Scenario: Existing table reused
- **WHEN** the server starts and the `subscriptions` table already exists
- **THEN** the system SHALL reuse the existing table without data loss

### Requirement: Subscription record creation
The system SHALL create a subscription record after successful payment verification, calculating the expiry date based on the billing cycle.

#### Scenario: Monthly subscription created
- **WHEN** a payment is verified for a monthly billing cycle
- **THEN** the system SHALL create a subscription record with `expiresAt` set to 30 days from the current date and `status` set to `active`

#### Scenario: Yearly subscription created
- **WHEN** a payment is verified for a yearly billing cycle
- **THEN** the system SHALL create a subscription record with `expiresAt` set to 365 days from the current date and `status` set to `active`

### Requirement: Current subscription status API
The system SHALL provide a `GET /api/subscription` endpoint that returns the authenticated user's current active subscription, if any.

#### Scenario: User has an active subscription
- **WHEN** an authenticated user sends a GET request and has a subscription with `status = 'active'` and `expiresAt` in the future
- **THEN** the system SHALL return `{ subscription: { plan, billingCycle, status, expiresAt } }`

#### Scenario: User has no active subscription
- **WHEN** an authenticated user sends a GET request and has no active, non-expired subscription
- **THEN** the system SHALL return `{ subscription: null }`

#### Scenario: Unauthenticated request rejected
- **WHEN** an unauthenticated request is sent to GET /api/subscription
- **THEN** the system SHALL return HTTP 401 with `{ error: "Unauthorized" }`

### Requirement: User isolation for subscriptions
The system SHALL ensure subscription records are isolated per user. A user SHALL only be able to view their own subscription status.

#### Scenario: No cross-user subscription leakage
- **WHEN** user A queries their subscription status
- **THEN** the system SHALL NOT return subscription records belonging to user B
