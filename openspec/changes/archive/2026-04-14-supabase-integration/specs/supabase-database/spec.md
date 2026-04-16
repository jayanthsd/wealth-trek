## ADDED Requirements

### Requirement: Supabase packages are installed
The system SHALL include `@supabase/supabase-js` and `@supabase/ssr` as project dependencies.

#### Scenario: Packages available after install
- **WHEN** `npm install` completes
- **THEN** `@supabase/supabase-js` and `@supabase/ssr` are listed in `package.json` dependencies

### Requirement: Server-side Supabase client helper exists
The system SHALL provide a `createClient` function at `src/utils/supabase/server.ts` that creates a Supabase server client using `createServerClient` from `@supabase/ssr`, configured with cookie-based session handling via Next.js `cookies()`.

#### Scenario: Server client created in API route
- **WHEN** an API route calls `createClient(cookieStore)`
- **THEN** the function returns a Supabase client configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and cookie getAll/setAll handlers

### Requirement: Browser-side Supabase client helper exists
The system SHALL provide a `createClient` function at `src/utils/supabase/client.ts` that creates a Supabase browser client using `createBrowserClient` from `@supabase/ssr`.

#### Scenario: Browser client created in component
- **WHEN** a client component calls `createClient()`
- **THEN** the function returns a Supabase browser client configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### Requirement: Middleware Supabase client helper exists
The system SHALL provide a `createClient` function at `src/utils/supabase/middleware.ts` that creates a Supabase server client within Next.js middleware, handling cookie forwarding between request and response.

#### Scenario: Middleware refreshes Supabase session
- **WHEN** a request passes through Next.js middleware
- **THEN** the middleware helper creates a Supabase client that reads cookies from the request and writes updated cookies to the response

### Requirement: Next.js middleware is configured
The system SHALL have a `middleware.ts` file at the app root that invokes the Supabase middleware helper on every matching request to keep sessions fresh.

#### Scenario: Middleware runs on navigation
- **WHEN** a user navigates to any route
- **THEN** the middleware invokes the Supabase middleware helper and returns the response with updated cookies

### Requirement: Postgres tables mirror the existing schema
The system SHALL define `statements`, `snapshots`, and `subscriptions` tables in Supabase Postgres with columns equivalent to the existing SQLite schema.

#### Scenario: Statements table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `statements` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `statement_type` (text NOT NULL), `description` (text NOT NULL default ''), `category` (text NOT NULL, check asset/liability), `closing_balance` (double precision NOT NULL, >= 0), `ownership_percentage` (double precision NOT NULL, 1-100), `source_document_id` (text nullable), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now())

#### Scenario: Snapshots table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `snapshots` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `date` (text NOT NULL), `total_assets` (double precision NOT NULL), `total_liabilities` (double precision NOT NULL), `net_worth` (double precision NOT NULL), `entries_json` (jsonb NOT NULL), `created_at` (timestamptz default now()), with a unique index on `(user_id, date)`

#### Scenario: Subscriptions table exists with correct columns
- **WHEN** the migration script has been applied
- **THEN** the `subscriptions` table has columns: `id` (uuid PK, default `gen_random_uuid()`), `user_id` (text NOT NULL), `razorpay_order_id` (text NOT NULL), `razorpay_payment_id` (text NOT NULL), `plan` (text NOT NULL), `billing_cycle` (text NOT NULL), `amount` (integer NOT NULL), `currency` (text NOT NULL default 'INR'), `status` (text NOT NULL default 'active'), `created_at` (timestamptz default now()), `expires_at` (timestamptz NOT NULL), with an index on `user_id`

### Requirement: Environment variables are configured
The system SHALL require `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment variables to be set.

#### Scenario: Missing env var causes clear error
- **WHEN** either env var is missing
- **THEN** the Supabase client creation SHALL fail with a descriptive error (enforced by the `!` assertion on the env values)
