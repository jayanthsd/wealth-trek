## 1. Tooling, test infra, and env templates

- [x] 1.1 Add Vitest, coverage provider, and any required plugins to `app/package.json`; add `vitest.config.ts` with TypeScript path alias `@/` matching the app
- [x] 1.2 Add npm scripts: `test`, `test:unit`, `test:functional`, `test:integration`, and `test:e2e`
- [x] 1.3 Add shared test utilities folder (e.g., `app/src/test-utils/`) for API test request builders and for Clerk/auth handling
- [x] 1.4 Add a checked-in env template `app/.env.example` that lists required variables for integration/E2E (Clerk + `OPENAI_API_KEY` + Razorpay). No real secrets committed.

## 2. Unit tests — `app/src/lib`

- [x] 2.1 Add unit tests for `computations.ts` (pure math / aggregation behavior and edge cases)
- [x] 2.2 Add unit tests for `utils.ts` (helpers as applicable)
- [x] 2.3 Add unit tests for `extractionPrompt.ts` (prompt shape and invariants, no network)
- [x] 2.4 Add unit tests for `generatePdf.ts` with jsPDF or DOM mocks so PDF generation paths are exercised without flaky binary snapshots
- [x] 2.5 Add unit tests for `db.ts` using a temporary SQLite file or test-only path; assert schema initialization and basic query behavior
- [x] 2.6 Add unit tests for `openai.ts` with mocked `OPENAI_API_KEY` and mocked client factory where applicable (unit tier only)

## 3. Unit tests — `app/src/hooks`

- [x] 3.1 Add unit tests for `useStatements.ts` with mocked `fetch` and auth assumptions
- [x] 3.2 Add unit tests for `useNetWorthHistory.ts` with mocked `fetch`
- [x] 3.3 Add unit tests for `useUserProfile.ts` (localStorage or profile source per implementation)
- [x] 3.4 Add unit tests for `useDocuments.ts`
- [x] 3.5 Add unit tests for `useFinancialGoals.ts`
- [x] 3.6 Add unit tests for `useChatHistory.ts`

## 4. API functional tests (route-level; OpenAI mocked)

- [x] 4.1 Add tests for `app/src/app/api/statements/route.ts` (GET/POST, 401 unauthenticated, validation)
- [x] 4.2 Add tests for `app/src/app/api/statements/[id]/route.ts` (PUT/DELETE as implemented, 401)
- [x] 4.3 Add tests for `app/src/app/api/snapshots/route.ts` (GET/POST, 401)
- [x] 4.4 Add tests for `app/src/app/api/snapshots/[id]/route.ts` (DELETE, 401)
- [x] 4.5 Add tests for `app/src/app/api/documents/upload/route.ts` (multipart validation, error messages, success with temp files)
- [x] 4.6 Add tests for `app/src/app/api/documents/extract/route.ts` with mocked OpenAI/LLM client (functional tier only)
- [x] 4.7 Add tests for `app/src/app/api/documents/[id]/route.ts` (DELETE only; storedPath required)
- [x] 4.8 Add tests for `app/src/app/api/chat/route.ts` (400 on bad body, streamed response, OpenAI mocked)
- [x] 4.9 Add tests for `app/src/app/api/subscription/route.ts` (GET; 401; active vs null)
- [x] 4.10 Add tests for `app/src/app/api/payments/create-order/route.ts` and `app/src/app/api/payments/verify/route.ts` (401; 400 validation; mock Razorpay network for determinism)

## 5. API integration tests (real OpenAI; docker deployed server)

- [ ] 5.1 Add/verify docker server harness for integration tests (create `app/Dockerfile` if missing, build and run, wait for readiness, cleanup)
- [ ] 5.2 Add an integration test runner that calls the real server over HTTP (no route-handler importing)
- [ ] 5.3 Ensure SQLite state is isolated per run (fresh DB file or wipe persisted DB state inside the docker container)
- [ ] 5.4 Implement integration tests for statements/snapshots CRUD using real server + real auth
- [ ] 5.5 Implement integration tests for chat and documents extraction using real OpenAI (`OPENAI_API_KEY`), without any OpenAI mocking; validate response shape/required fields
- [ ] 5.6 Implement integration tests for subscription and payments using Razorpay test credentials when env vars exist; skip those tests when Razorpay env is missing
- [ ] 5.7 Add test fixtures for document upload/extract (sample PDFs/images) to avoid flaky inline-generated binaries

## 6. E2E/customer flows (docker + Playwright; real OpenAI)

- [ ] 6.1 Add Playwright to `app/package.json`, add `playwright.config.ts`, and make `test:e2e` build/start docker and run specs headless
- [ ] 6.2 Add a smoke E2E spec that loads the home page and asserts critical content or navigation is visible
- [ ] 6.3 Add at least one authenticated customer-flow spec (e.g., dashboard navigation plus a statement or snapshot interaction) using stable selectors
- [ ] 6.4 Add E2E coverage for the document upload + extraction UI path, exercising real OpenAI when configured
- [ ] 6.5 Add auth gating: if Clerk/test credentials are missing, skip auth-dependent specs; otherwise complete UI sign-in flow in the test
- [ ] 6.6 Add a chat UI path E2E step that handles streaming without mocking OpenAI; skip if OpenAI is missing

## 7. CI and verification

- [x] 7.1 Wire CI to run unit + functional tests on PRs (no OpenAI real calls required; OpenAI is mocked in functional tier)
- [ ] 7.2 Wire CI to run integration + E2E jobs in docker with secrets injected from the environment; integration/E2E OpenAI-dependent assertions run only when `OPENAI_API_KEY` is present
- [ ] 7.3 Run `/opsx:verify` or a manual checklist against `openspec/changes/module-api-e2e-test-suite/specs/` before archiving
