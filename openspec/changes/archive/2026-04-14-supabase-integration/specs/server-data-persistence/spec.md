## MODIFIED Requirements

### Requirement: SQLite database initialization
The system SHALL NOT use SQLite for data persistence. The `src/lib/db.ts` file and `better-sqlite3` dependency SHALL be removed. All data persistence SHALL use Supabase Postgres via the Supabase JS client.

#### Scenario: No SQLite file created
- **WHEN** the server receives an API request
- **THEN** the system SHALL NOT create or access any local SQLite database file

#### Scenario: Supabase client used instead
- **WHEN** any API route needs database access
- **THEN** the system SHALL use the Supabase server client from `src/utils/supabase/server.ts`

### Requirement: Statements API - Create
The system SHALL provide a `POST /api/statements` endpoint that creates one or more statement entries for the authenticated user using Supabase Postgres.

#### Scenario: Create a single statement
- **WHEN** an authenticated user sends a POST request with a single statement entry (statementType, description, category, closingBalance, ownershipPercentage)
- **THEN** the system SHALL insert the entry into the Supabase `statements` table with the Clerk user's ID and return the created entry with its generated UUID

#### Scenario: Bulk create statements
- **WHEN** an authenticated user sends a POST request with an array of statement entries
- **THEN** the system SHALL insert all entries into Supabase and return the created entries with their generated UUIDs

#### Scenario: Unauthenticated create rejected
- **WHEN** an unauthenticated request is sent to POST /api/statements
- **THEN** the system SHALL return a 401 status code

### Requirement: Statements API - Read
The system SHALL provide a `GET /api/statements` endpoint that returns all statement entries for the authenticated user from Supabase Postgres.

#### Scenario: List user statements
- **WHEN** an authenticated user sends a GET request to /api/statements
- **THEN** the system SHALL query Supabase `statements` table filtered by `user_id` and return all matching entries

#### Scenario: No cross-user data leakage
- **WHEN** user A requests their statements
- **THEN** the system SHALL NOT return any statements belonging to user B

### Requirement: Statements API - Update
The system SHALL provide a `PUT /api/statements/[id]` endpoint that updates a specific statement entry owned by the authenticated user in Supabase Postgres.

#### Scenario: Update statement fields
- **WHEN** an authenticated user sends a PUT request with updated fields for a statement they own
- **THEN** the system SHALL update the entry in Supabase and return the updated entry

#### Scenario: Update statement owned by another user rejected
- **WHEN** an authenticated user sends a PUT request for a statement they do not own
- **THEN** the system SHALL return a 404 status code

### Requirement: Statements API - Delete
The system SHALL provide a `DELETE /api/statements/[id]` endpoint that deletes a specific statement entry owned by the authenticated user from Supabase Postgres.

#### Scenario: Delete own statement
- **WHEN** an authenticated user sends a DELETE request for a statement they own
- **THEN** the system SHALL remove the entry from Supabase and return a success response

#### Scenario: Delete statement owned by another user rejected
- **WHEN** an authenticated user sends a DELETE request for a statement they do not own
- **THEN** the system SHALL return a 404 status code

### Requirement: Snapshots API - Read
The system SHALL provide a `GET /api/snapshots` endpoint that returns all net worth snapshots for the authenticated user from Supabase Postgres, sorted by date ascending.

#### Scenario: List user snapshots
- **WHEN** an authenticated user sends a GET request to /api/snapshots
- **THEN** the system SHALL query the Supabase `snapshots` table filtered by `user_id`, ordered by `date` ascending, and return all matching snapshots

### Requirement: Snapshots API - Upsert
The system SHALL provide a `POST /api/snapshots` endpoint that creates or updates a net worth snapshot for the authenticated user in Supabase Postgres, keyed by date.

#### Scenario: Create new snapshot
- **WHEN** an authenticated user sends a POST request with snapshot data for a date that has no existing snapshot
- **THEN** the system SHALL insert the snapshot into Supabase and return it

#### Scenario: Overwrite existing snapshot for same date
- **WHEN** an authenticated user sends a POST request with snapshot data for a date that already has a snapshot
- **THEN** the system SHALL replace the existing snapshot's data with the new data

### Requirement: Snapshots API - Delete
The system SHALL provide a `DELETE /api/snapshots/[id]` endpoint that deletes a specific snapshot owned by the authenticated user from Supabase Postgres.

#### Scenario: Delete own snapshot
- **WHEN** an authenticated user sends a DELETE request for a snapshot they own
- **THEN** the system SHALL remove the snapshot from Supabase and return a success response

### Requirement: API authentication enforcement
All data API routes SHALL require Clerk authentication. Unauthenticated requests SHALL receive a 401 response with an error message. The Clerk `userId` SHALL be used as the `user_id` filter for all Supabase queries.

#### Scenario: Unauthenticated request to any data endpoint
- **WHEN** an unauthenticated request is sent to any /api/statements or /api/snapshots endpoint
- **THEN** the system SHALL return HTTP 401 with `{ "error": "Unauthorized" }`
