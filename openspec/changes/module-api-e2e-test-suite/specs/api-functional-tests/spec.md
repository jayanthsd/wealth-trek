# API functional tests

## Purpose

Define requirements for functional tests of each Next.js App Router API endpoint so that HTTP status codes, response bodies, authentication, and validation behavior match expectations.

## ADDED Requirements

### Requirement: Each API route has functional coverage

The system SHALL include automated tests for each `route.ts` file under `app/src/app/api/` that invokes the exported HTTP method handlers and asserts observable HTTP results.

#### Scenario: Statements routes are covered

- **WHEN** tests run for statements APIs
- **THEN** they SHALL cover authenticated success paths and unauthenticated requests returning 401 for applicable methods

#### Scenario: Snapshots routes are covered

- **WHEN** tests run for snapshots APIs
- **THEN** they SHALL cover list/create/delete behaviors per route including user isolation assumptions enforced by auth

#### Scenario: Document routes are covered

- **WHEN** tests run for document upload, extract, and document-by-id routes
- **THEN** they SHALL cover validation errors (e.g., missing files, unsupported types) and successful responses with mocked I/O where needed (including OpenAI mocking for extract)

#### Scenario: Chat route is covered

- **WHEN** tests run for the chat API
- **THEN** they SHALL cover invalid request bodies with 400 responses and SHALL mock the LLM client so tests do not call the live OpenAI API

#### Scenario: Statements and snapshots [id] routes are covered

- **WHEN** tests run for statement/snapshot update/delete APIs
- **THEN** they SHALL cover authenticated success paths plus 401 unauthenticated responses, and 404 not-found behavior where implemented

#### Scenario: Subscription and payments routes are covered

- **WHEN** tests run for subscription and Razorpay-related APIs
- **THEN** they SHALL cover authenticated success paths and 401 unauthenticated responses, and SHALL validate 400-level errors for missing/invalid request bodies and signatures

### Requirement: Auth behavior is asserted

The system SHALL assert that data-modifying and user-scoped API routes reject unauthenticated callers with an HTTP 401 response and an error payload consistent with existing API conventions.

#### Scenario: Unauthenticated data request

- **WHEN** an unauthenticated request is made to a protected data API
- **THEN** the response status SHALL be 401 and the body SHALL indicate unauthorized access

### Requirement: API tests run in CI

The system SHALL expose an npm script that runs API functional tests together with or alongside unit tests such that CI can execute them without a manual browser.

#### Scenario: CI runs API tests

- **WHEN** the CI pipeline runs the configured test command for API coverage
- **THEN** the process SHALL exit with code zero on full pass
