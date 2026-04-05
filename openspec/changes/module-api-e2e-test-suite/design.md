## Context

Wealth Trek is a Next.js 16 app (`app/`) with Clerk auth, SQLite via `better-sqlite3`, App Router API routes under `app/src/app/api/`, libraries in `app/src/lib/`, hooks in `app/src/hooks/`, and React components under `app/src/components/`. There is no test runner in `package.json` today. The goal is to add three layers: fast unit tests for modules, request-level functional tests for each API route, and browser-level E2E tests for customer journeys—without changing product requirements in existing `openspec/specs/` until gaps are found.

## Goals / Non-Goals

**Goals:**

- Standardize on **Vitest** for unit tests and for API route tests (Node/`node` environment), with TypeScript paths aligned to `@/` imports
- Standardize on **Playwright** for E2E and multi-step integration-style flows in a real browser
- Cover **each `app/src/lib/*.ts` module** and **each `app/src/hooks/*.ts` hook** with at least one meaningful unit test (pure logic, state transitions, or behavior with mocks)
- Cover **each `route.ts`** under `app/src/app/api/` with functional tests that assert HTTP status, JSON shape, and auth/validation branches
- Cover all APIs with an additional **integration tier** that hits a real deployed server using **real OpenAI** (no OpenAI mocking in integration/E2E)
- Document how **Clerk** is mocked or stubbed in API tests (e.g., `vi.mock('@clerk/nextjs/server')` returning a configurable `userId`)
- Document **SQLite** test isolation: temporary DB file or in-memory strategy, schema init from `getDb()` / migrations, teardown between tests or per-file
- Add npm scripts: `test` (unit+API), `test:unit`, `test:e2e` (and optional `test:e2e:ui`)

**Non-Goals:**

- 100% line coverage or visual regression testing in this change
- Load/performance testing
- Testing third-party Clerk/Next internals beyond stable public surfaces used by the app
- Changing production code solely to improve testability unless it is a small export or dependency injection point (prefer mocks first)

## Decisions

### Decision 1: Vitest for unit and API tests

Use **Vitest** with `@vitejs/plugin-react` only if component tests are added later; initially focus on `node` environment for lib, hooks (with `@testing-library/react` optional for hooks), and direct imports of route handlers where feasible, or use `fetch` to a **Next test server** if full integration is required for a subset.

**Alternatives considered:**

- **Jest**: Works with Next but Vitest is faster and shares config ergonomics with Vite ecosystem; either is acceptable—Vitest is chosen for speed and ESM-native defaults.
- **node:test only**: Too minimal for React mocking and watch mode.

### Decision 2: Playwright for E2E

Use **Playwright** with config at `app/playwright.config.ts` (or repo root if monorepo prefers), base URL `http://localhost:3000`, and run a **docker-based server harness** as the test `webServer`.

**Alternatives considered:**

- **Cypress**: Fine; Playwright is chosen for parallel runs and trace viewer in CI.

### Decision 3: API test strategy

- Prefer **importing route handlers** and invoking `GET`/`POST`/etc. with constructed `NextRequest` objects where Clerk and `getDb()` are mocked, for speed and determinism.
- For routes that tightly couple to filesystem or streaming, add **focused tests** that mock `fs`, OpenAI client, or assert stream headers without calling real APIs.
- **Functional tier**: OpenAI (chat + document extract) MAY be mocked for determinism.
- **Integration/E2E tiers**: OpenAI MUST NOT be mocked. Assertions must be tolerant of LLM output variability (validate required fields and shape, not exact text).

### Decision 4: E2E auth

- Use UI-driven Clerk sign-in and/or storage state populated via documented test user steps against the docker-deployed server.
- Do not commit real secrets; provide an `.env.example` template for integration/E2E (and skip OpenAI-dependent assertions when `OPENAI_API_KEY` is absent).

### Decision 5: File layout

- Unit tests: `app/src/lib/__tests__/*.test.ts`, `app/src/hooks/__tests__/*.test.ts` (or colocated `*.test.ts` next to source—pick one convention in implementation and stick to it).
- API tests: `app/src/app/api/**/__tests__/*.test.ts` or `app/src/app/api/**/*.test.ts` beside routes.
- E2E: `app/e2e/**/*.spec.ts` (or `tests/e2e`).

## Risks / Trade-offs

- **[Risk] Mock drift** — Mocks for Clerk/DB diverge from production behavior → **Mitigation:** keep a small set of “full stack” API tests against a temp SQLite file with real `getDb` wiring if feasible.
- **[Risk] E2E flakiness** — **Mitigation:** prefer stable selectors (`data-testid` for critical flows), retry in Playwright, avoid fixed sleeps.
- **[Risk] CI time** — **Mitigation:** run unit/API on every PR; schedule or main-branch-only full E2E if needed.
- **[Risk] Windows path handling** — **Mitigation:** use `path.join` and temp dirs from `os.tmpdir()` in tests.

## Migration Plan

1. Add dev dependencies and Vitest config; ensure `npm run test` passes with zero tests or a smoke test.
2. Land unit tests for `lib` and `hooks` incrementally module by module.
3. Land API functional tests route by route with shared Clerk/DB helpers (OpenAI mocked).
4. Add API integration tests against the docker server harness (real OpenAI).
5. Add docker-based Playwright E2E/customer flows (real OpenAI) and expand coverage.
6. Wire CI to build the docker image and run unit/functional, then integration and E2E with secrets injected.

**Rollback:** Remove dev dependencies and test directories; no production rollback required.

## Open Questions

- Whether the team has a **dedicated Clerk test application** and test users for E2E, or E2E should remain **unauthenticated / public pages only** initially.
- Preferred **minimum coverage threshold** (if any) for CI gates.

