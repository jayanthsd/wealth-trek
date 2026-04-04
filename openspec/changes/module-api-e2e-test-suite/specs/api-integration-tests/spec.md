# API integration tests

## Purpose
Define requirements for integration tests (API tier) that exercise the real server over HTTP. This tier complements functional route-level tests by validating request/response behavior with real dependencies, including real OpenAI.

## ADDED Requirements

### Requirement: Integration tests hit a real deployed server

The system SHALL provide an integration test suite that does not import route handlers directly. Tests SHALL call the running server over HTTP using a docker-based server harness.

#### Scenario: Server harness is used

- **WHEN** integration tests execute
- **THEN** they SHALL build/start the docker image, wait until the server is reachable, and run HTTP requests against the configured base URL

### Requirement: OpenAI is not mocked in integration tests

The system SHALL not mock the OpenAI client in the integration tier. For routes backed by OpenAI (chat and document extraction), the tests SHALL use real `OPENAI_API_KEY` and validate response structure rather than exact text.

#### Scenario: Chat uses real OpenAI

- **WHEN** `OPENAI_API_KEY` is present and a valid chat request is sent
- **THEN** the response SHALL return a successful status and stream a response payload with required fields/shape (and end with the expected stream terminator)

#### Scenario: OpenAI assertions are skipped when missing

- **WHEN** `OPENAI_API_KEY` is absent
- **THEN** OpenAI-backed integration assertions SHALL be skipped rather than failing unpredictably

#### Scenario: Document extract uses real OpenAI

- **WHEN** a valid document upload payload is submitted to extract
- **THEN** the response SHALL return a successful status and extracted data SHALL match the expected schema at a coarse level (required keys present)

### Requirement: Auth is enforced and user isolation is preserved

All protected integration calls SHALL reject unauthenticated requests with 401, and authenticated operations SHALL not leak data across users.

#### Scenario: Unauthenticated requests are rejected

- **WHEN** an integration request is sent without Clerk auth
- **THEN** the API response status SHALL be 401 and the body SHALL indicate unauthorized access

#### Scenario: User isolation holds for data endpoints

- **WHEN** two different authenticated users run statements/snapshots CRUD in separate requests
- **THEN** list/read responses SHALL only include records created by the requesting user

### Requirement: Integration tests isolate SQLite state

Integration tests SHALL run with deterministic DB state, so that CRUD assertions are reliable.

#### Scenario: Fresh DB state is used per run

- **WHEN** an integration test suite starts
- **THEN** the persisted SQLite state used by the server SHALL be fresh (or wiped) so assertions do not depend on prior runs

### Requirement: External services are env-gated in integration tests

For endpoints that depend on external services other than OpenAI (e.g., Razorpay), the tests SHALL use real test credentials when env vars are present; otherwise they SHALL be skipped.

#### Scenario: Razorpay tests run when configured

- **WHEN** Razorpay test env vars are present
- **THEN** create-order and verify endpoints SHALL return successful responses with expected response schema

#### Scenario: Razorpay tests skip when missing

- **WHEN** Razorpay env vars are absent
- **THEN** Razorpay-dependent assertions SHALL be skipped rather than failing

### Requirement: Integration tests run in CI

The system SHALL expose a CI-friendly npm script for integration tests that supports headless execution.

#### Scenario: CI integration job exits successfully

- **WHEN** the CI pipeline runs the configured integration test command with injected secrets
- **THEN** the command SHALL exit with code zero when all executed assertions pass

