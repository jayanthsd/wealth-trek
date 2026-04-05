## Why

The Wealth Trek app has grown to include multiple API routes, shared libraries, hooks, and UI flows, but there is no automated test suite. Without unit, API, and end-to-end coverage, regressions are easy to miss and refactors stay risky. Adding structured tests now establishes a safety net for ongoing development and documents expected behavior for each module and API.

## What Changes

- Add a test runner and assertion library (e.g., Vitest) for the Next.js app, with TypeScript support and patterns aligned with existing code style
- Introduce **unit tests** for each logical module: `app/src/lib/`*, hooks under `app/src/hooks/*`, and pure helpers (e.g., `computations`, PDF utilities) with mocks for I/O and external services where needed
- Introduce **functional/API tests** for each Next.js route handler under `app/src/app/api/**/route.ts` (all current APIs), covering success paths, validation, auth (401), and key error cases; allow OpenAI (chat + document extract) to be mocked for determinism in this tier
- Introduce **integration/API tests** and **docker-based end-to-end/customer-flow tests** that run against a real deployed server (not just handler-level calls). Integration/E2E must use **real OpenAI** (no OpenAI mocking) and must be driven by environment variables documented in a `.env.example`
- Add npm scripts (e.g., `test`, `test:unit`, `test:e2e`) and CI-friendly configuration so tests can run locally and in pipelines

## Capabilities

### New Capabilities

- `unit-module-tests`: Requirements for unit test coverage of each library module and hook (isolated, fast, no real network/DB unless using in-memory or fakes)
- `api-functional-tests`: Requirements for functional tests of each App Router API (`app/src/app/api/**/route.ts`) including auth and validation behavior (OpenAI mocked only in this tier)
- `api-integration-tests`: Requirements for integration tests that hit the real server APIs end-to-end (OpenAI not mocked)
- `e2e-customer-flows`: Requirements for docker-based Playwright end-to-end tests that exercise multi-step customer flows across pages and APIs (OpenAI not mocked)

### Modified Capabilities

- (none — this change adds verification and tooling; product behavior specs in `openspec/specs/` are unchanged unless a test reveals a spec gap, which would be handled as a follow-up change)

## Impact

- **Dependencies**: New dev dependencies in `app/package.json` (test runner, possibly Playwright, MSW or route-level mocks as chosen in design)
- **Layout**: New test files colocated or under `app/src/**/__tests__` / `e2e/` per team convention; possible `vitest.config.`* and Playwright config at app root
- **API tests**: May require test-only Clerk session mocking or bypass strategy documented for local/CI
- **Database**: API tests touching SQLite need deterministic setup/teardown or a dedicated test DB path
- **Secrets**: Integration/E2E must use real `OPENAI_API_KEY` (or skip OpenAI-dependent assertions when missing); unit/functional are allowed to mock OpenAI
- **Infrastructure**: Add docker build/run harness for integration/E2E and ensure tests clean up any persistent DB state between runs
- **Env template**: Add a checked-in `.env.example` (no secrets) documenting required env vars for integration/E2E (Clerk + OpenAI + Razorpay)
- **CI**: Pipeline steps to install browsers (if Playwright), build the docker image, and run the test tiers

