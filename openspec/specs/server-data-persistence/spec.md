# Server Data Persistence

## Purpose

This specification defines the requirements for server-side data persistence using Supabase Postgres for statements and snapshots with proper authentication and user isolation via Clerk Third-Party Auth and Row Level Security.

## Requirements

### Requirement: Statements API - Create
The system SHALL provide a `POST /api/statements` endpoint that creates one or more statement entries for the authenticated user.

#### Scenario: Create a single statement
- **WHEN** an authenticated user sends a POST request with a single statement entry (statementType, description, category, closingBalance, ownershipPercentage)
- **THEN** the system SHALL insert the entry into the database with the user's ID and return the created entry with its generated ID

#### Scenario: Bulk create statements
- **WHEN** an authenticated user sends a POST request with an array of statement entries
- **THEN** the system SHALL insert all entries into the database and return the created entries with their generated IDs

#### Scenario: Unauthenticated create rejected
- **WHEN** an unauthenticated request is sent to POST /api/statements
- **THEN** the system SHALL return a 401 status code

### Requirement: Statements API - Read
The system SHALL provide a `GET /api/statements` endpoint that returns all statement entries for the authenticated user.

#### Scenario: List user statements
- **WHEN** an authenticated user sends a GET request to /api/statements
- **THEN** the system SHALL return all statement entries belonging to that user

#### Scenario: No cross-user data leakage
- **WHEN** user A requests their statements
- **THEN** the system SHALL NOT return any statements belonging to user B

### Requirement: Statements API - Update
The system SHALL provide a `PUT /api/statements/[id]` endpoint that updates a specific statement entry owned by the authenticated user.

#### Scenario: Update statement fields
- **WHEN** an authenticated user sends a PUT request with updated fields for a statement they own
- **THEN** the system SHALL update the entry in the database and return the updated entry

#### Scenario: Update statement owned by another user rejected
- **WHEN** an authenticated user sends a PUT request for a statement they do not own
- **THEN** the system SHALL return a 404 status code

### Requirement: Statements API - Delete
The system SHALL provide a `DELETE /api/statements/[id]` endpoint that deletes a specific statement entry owned by the authenticated user.

#### Scenario: Delete own statement
- **WHEN** an authenticated user sends a DELETE request for a statement they own
- **THEN** the system SHALL remove the entry from the database and return a success response

#### Scenario: Delete statement owned by another user rejected
- **WHEN** an authenticated user sends a DELETE request for a statement they do not own
- **THEN** the system SHALL return a 404 status code

### Requirement: Snapshots API - Read
The system SHALL provide a `GET /api/snapshots` endpoint that returns all net worth snapshots for the authenticated user, sorted by date ascending.

#### Scenario: List user snapshots
- **WHEN** an authenticated user sends a GET request to /api/snapshots
- **THEN** the system SHALL return all snapshots belonging to that user sorted by date ascending

### Requirement: Snapshots API - Upsert
The system SHALL provide a `POST /api/snapshots` endpoint that creates or updates a net worth snapshot for the authenticated user, keyed by date.

#### Scenario: Create new snapshot
- **WHEN** an authenticated user sends a POST request with snapshot data for a date that has no existing snapshot
- **THEN** the system SHALL insert the snapshot into the database and return it

#### Scenario: Overwrite existing snapshot for same date
- **WHEN** an authenticated user sends a POST request with snapshot data for a date that already has a snapshot
- **THEN** the system SHALL replace the existing snapshot's data with the new data

### Requirement: Snapshots API - Delete
The system SHALL provide a `DELETE /api/snapshots/[id]` endpoint that deletes a specific snapshot owned by the authenticated user.

#### Scenario: Delete own snapshot
- **WHEN** an authenticated user sends a DELETE request for a snapshot they own
- **THEN** the system SHALL remove the snapshot from the database and return a success response

### Requirement: API authentication enforcement
All data API routes SHALL require Clerk authentication. Unauthenticated requests SHALL receive a 401 response with an error message.

#### Scenario: Unauthenticated request to any data endpoint
- **WHEN** an unauthenticated request is sent to any /api/statements or /api/snapshots endpoint
- **THEN** the system SHALL return HTTP 401 with `{ "error": "Unauthorized" }`
