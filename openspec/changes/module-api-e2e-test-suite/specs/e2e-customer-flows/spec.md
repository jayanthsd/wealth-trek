# E2E customer flows

## Purpose

Define requirements for integration and end-to-end tests that exercise multi-step customer journeys through the running application in a browser, complementing unit and API tests.

## ADDED Requirements

### Requirement: Critical journeys have E2E coverage

The system SHALL include browser-based end-to-end tests that cover critical customer flows, including at minimum: landing or marketing entry, navigation to main app areas, and representative interactions for wealth tracking features (e.g., viewing dashboard content, interacting with statement or net-worth related UI) as implemented in the product.

#### Scenario: Smoke navigation

- **WHEN** an E2E test loads the application base URL
- **THEN** it SHALL verify that primary navigation or hero content renders without server error pages

#### Scenario: Flow uses stable selectors

- **WHEN** E2E tests interact with the UI
- **THEN** they SHALL prefer stable selectors (e.g., `data-testid` or roles) over brittle CSS tied to styling-only classes

### Requirement: Docker-based E2E deployment is used

The system SHALL provide Playwright E2E tests that run against a real, docker-deployed server (not a locally mocked server). The E2E script SHALL build and start the docker image before executing UI navigation steps.

#### Scenario: E2E docker harness runs

- **WHEN** the E2E npm script executes
- **THEN** it SHALL build the docker image, start the server, wait for it to be reachable, and then run the Playwright suite against the configured base URL

### Requirement: E2E uses real OpenAI (no OpenAI mocking)

The system SHALL run E2E flows that exercise OpenAI-backed routes (e.g., chat and document extraction) using real `OPENAI_API_KEY`. Tests SHALL NOT mock the OpenAI client in E2E.

#### Scenario: OpenAI assertions run only when configured

- **WHEN** `OPENAI_API_KEY` is present in the E2E environment
- **THEN** chat/extract UI flows SHALL validate response shape (required fields/structure) without asserting exact model text

#### Scenario: OpenAI-dependent flows are skipped when missing

- **WHEN** `OPENAI_API_KEY` is absent in the E2E environment
- **THEN** OpenAI-dependent assertions SHALL be skipped rather than failing unpredictably

### Requirement: E2E auth is exercised via UI

The system SHALL run customer-flow E2E steps using a logged-in user (via UI sign-in and/or documented test credentials). The test suite SHALL use env vars from `.env.example` for Clerk configuration, and SHALL not commit secrets to the repo.

#### Scenario: Auth-dependent specs are gated

- **WHEN** Clerk auth env vars or test user credentials are missing
- **THEN** auth-dependent specs SHALL be skipped or reduced in scope rather than failing

### Requirement: E2E suite is scriptable

The system SHALL expose an npm script (e.g., `test:e2e`) that runs the Playwright (or equivalent) suite against a defined base URL and SHALL support headless execution suitable for CI.

#### Scenario: CI runs E2E

- **WHEN** the CI pipeline runs the E2E script
- **THEN** the command SHALL exit with code zero when all executed specs pass

### Requirement: Flake controls

The system SHALL configure reasonable timeouts and retries for E2E tests so that intermittent network or animation timing does not cause false failures more often than acceptable for the team.

#### Scenario: Retry policy exists

- **WHEN** a transient failure occurs during an E2E step
- **THEN** the runner SHALL retry according to documented configuration before marking the test failed
