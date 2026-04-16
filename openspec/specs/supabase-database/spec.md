# Supabase Database

## Purpose

This specification defines the requirements for Supabase database integration, including client helpers, Clerk Third-Party Auth configuration, Row Level Security policies, and database schema.

## Requirements

### Requirement: Supabase packages are installed
The system SHALL include `@supabase/supabase-js` as a project dependency.

#### Scenario: Packages available after install
- **WHEN** `npm install` completes
- **THEN** `@supabase/supabase-js` is listed in `package.json` dependencies

### Requirement: Server-side Supabase client helper exists
The system SHALL provide a `createClient` function at `src/utils/supabase/server.ts` that creates a Supabase client using the `accessToken` option to pass a Clerk session token for Third-Party Auth.

#### Scenario: Server client created with Clerk token
- **WHEN** an API route calls `createClient(token)`
- **THEN** the function returns a Supabase client configured with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `accessToken` set to an async function returning the provided Clerk session token

### Requirement: Authenticated client helper exists
The system SHALL provide a `getAuthenticatedClient` function at `src/lib/db.ts` that obtains the Clerk user ID and session token, then creates an authenticated Supabase client.

#### Scenario: Authenticated user gets Supabase client
- **WHEN** an API route calls `getAuthenticatedClient()`
- **THEN** the function calls Clerk's `auth()` to obtain `userId` and `getToken`, retrieves the Clerk session token via `getToken()` (no template), and returns `{ userId, supabase }` where `supabase` is a Supabase client created with the token

#### Scenario: Unauthenticated user gets null
- **WHEN** `getAuthenticatedClient()` is called without an active Clerk session
- **THEN** the function returns `{ userId: null, supabase: null }`

### Requirement: Clerk Third-Party Auth is configured
The system SHALL use Supabase's Third-Party Auth integration with Clerk, so that Clerk session tokens are validated by Supabase and JWT claims are available in RLS policies.

#### Scenario: Third-Party Auth enabled in Supabase
- **WHEN** the Supabase project is configured
- **THEN** the Clerk Third-Party Auth integration is enabled in the Supabase dashboard with the correct Clerk domain

#### Scenario: Clerk instance configured for Supabase
- **WHEN** the Clerk instance is configured
- **THEN** the Clerk instance is configured for Supabase compatibility via the Clerk dashboard (session tokens include the `role` claim with value `authenticated`)

### Requirement: Row Level Security enforces user isolation
The system SHALL enable RLS on all data tables and define policies that restrict access based on the Clerk user ID extracted from the JWT `sub` claim.

#### Scenario: RLS policies use JWT sub claim
- **WHEN** the RLS migration has been applied
- **THEN** all policies use `(select auth.jwt() ->> 'sub') = user_id` to match the Clerk user ID stored in the `user_id` TEXT column

#### Scenario: Each table has SELECT, INSERT, UPDATE, and DELETE policies
- **WHEN** the RLS migration has been applied
- **THEN** `statements`, `snapshots`, `goals`, `chat_messages`, and `user_profiles` tables each have SELECT, INSERT, UPDATE, and DELETE policies; `subscriptions` has SELECT and INSERT policies

### Requirement: Postgres tables define the data schema
The system SHALL define `statements`, `snapshots`, `subscriptions`, `goals`, `chat_messages`, and `user_profiles` tables in Supabase Postgres.

#### Scenario: Statements table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `statements` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `statement_type` (text NOT NULL), `description` (text NOT NULL default ''), `category` (text NOT NULL, check asset/liability), `closing_balance` (double precision NOT NULL, >= 0), `ownership_percentage` (double precision NOT NULL, 1-100), `source_document_id` (text nullable), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now())

#### Scenario: Snapshots table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `snapshots` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `date` (text NOT NULL), `total_assets` (double precision NOT NULL), `total_liabilities` (double precision NOT NULL), `net_worth` (double precision NOT NULL), `entries_json` (jsonb NOT NULL), `created_at` (timestamptz default now()), with a unique index on `(user_id, date)`

#### Scenario: Subscriptions table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `subscriptions` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `razorpay_order_id` (text NOT NULL), `razorpay_payment_id` (text NOT NULL), `plan` (text NOT NULL), `billing_cycle` (text NOT NULL), `amount` (integer NOT NULL), `currency` (text NOT NULL default 'INR'), `status` (text NOT NULL default 'active'), `created_at` (timestamptz default now()), `expires_at` (timestamptz NOT NULL), with an index on `user_id`

#### Scenario: Goals table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `goals` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `title` (text NOT NULL), `description` (text NOT NULL default ''), `target_amount` (double precision nullable), `target_date` (text nullable), `created_at` (timestamptz default now()), `status` (text NOT NULL default 'active', check active/completed/paused)

#### Scenario: Chat messages table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `chat_messages` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `role` (text NOT NULL, check user/assistant), `content` (text NOT NULL), `timestamp` (timestamptz default now()), `suggested_goal_json` (jsonb nullable)

#### Scenario: User profiles table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `user_profiles` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `full_name` (text NOT NULL default ''), `address` (text NOT NULL default ''), `certificate_date` (text NOT NULL default ''), `as_on_date` (text NOT NULL default ''), with a unique index on `user_id`

### Requirement: Environment variables are configured
The system SHALL require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables to be set.

#### Scenario: Missing env var causes clear error
- **WHEN** any required Supabase env var is missing
- **THEN** the Supabase client creation SHALL fail with a descriptive error
