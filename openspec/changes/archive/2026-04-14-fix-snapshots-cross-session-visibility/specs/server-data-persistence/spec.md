## MODIFIED Requirements

### Requirement: Supabase server client configuration
The system SHALL use a Supabase client initialized with the **service-role key** (`SUPABASE_SERVICE_ROLE_KEY`) for all server-side API routes, bypassing Row Level Security. The client SHALL NOT depend on browser cookies or Supabase Auth sessions.

#### Scenario: Server client created without cookie dependency
- **WHEN** any API route creates a Supabase client for database access
- **THEN** the client SHALL be initialized using `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`, without requiring a cookie store parameter

#### Scenario: Data visible across browser sessions
- **WHEN** an authenticated user creates data (statements, snapshots, goals, chat messages, profile) in one browser session and then accesses the app from a different browser session (e.g., incognito) logged in as the same Clerk user
- **THEN** the system SHALL return all previously created data for that user

#### Scenario: Service-role key not exposed to client
- **WHEN** the application is built and served
- **THEN** the `SUPABASE_SERVICE_ROLE_KEY` SHALL only be used in server-side code (API routes) and SHALL NOT be included in client bundles

### Requirement: API authentication enforcement
All data API routes SHALL require Clerk authentication. Unauthenticated requests SHALL receive a 401 response with an error message.

#### Scenario: Unauthenticated request to any data endpoint
- **WHEN** an unauthenticated request is sent to any data API endpoint
- **THEN** the system SHALL return HTTP 401 with `{ "error": "Unauthorized" }`

### Requirement: Middleware configuration
The application middleware SHALL handle Clerk authentication for protected routes. The middleware SHALL NOT include Supabase session management.

#### Scenario: Protected route access
- **WHEN** an unauthenticated user navigates to `/dashboard/*`
- **THEN** the Clerk middleware SHALL redirect to sign-in

#### Scenario: No Supabase session overhead
- **WHEN** any request passes through middleware
- **THEN** the middleware SHALL NOT attempt to create or refresh a Supabase auth session
