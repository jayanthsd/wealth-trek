# External Test Setup Checklist (Non-Code)

This checklist captures **external prerequisites** needed for the OpenSpec testing proposal.  
It excludes code-only tasks and focuses on accounts, environments, secrets, infra, and third-party systems.

---

## 1) Unit Test Suite

Unit tests should avoid external dependencies as much as possible, but a few setup decisions are still needed.

### Required external/non-code setup

- **CI secret baseline policy** defined (what secrets are allowed in unit jobs; usually none except optional placeholders).
- **Team policy for mocking** approved (OpenAI, Clerk, Razorpay mocked in unit).
- **Artifact retention policy** for unit coverage reports (if coverage is uploaded to CI artifact storage).
- **Node/runtime version pinning policy** agreed (exact Node version used by developers and CI).

### Optional but recommended

- **Coverage quality gate policy** decided (minimum threshold, branch restrictions).
- **Central package mirror/cache policy** configured (if enterprise CI needs npm proxy).

---

## 2) Functional API Test Suite (Route-level, deterministic)

These tests call route handlers or controlled API execution and typically mock external services.

### Required external/non-code setup

- **Clerk test strategy decision** documented (mocked auth only for this suite vs hybrid).
- **Razorpay test-mode policy** decided for functional tests (mock network vs sandbox API).
- **OpenAI mocking policy** confirmed (functional suite uses mock/stub responses).
- **Dedicated test data lifecycle policy** documented (how DB fixtures are reset between runs).
- **CI secret scoping** configured to avoid production credentials in functional jobs.
- **Functional API execution contract** documented: use **mock-auth** for protected routes, **mock Razorpay network** calls for payments endpoints, and **mock OpenAI replies** for `chat` and `documents/extract` so this suite remains deterministic and fast.

### Optional but recommended

- **Shared fixture ownership** assigned (who maintains canonical sample documents/requests).
- **Flake triage SLA** defined for unstable functional tests.

---

## 3) API Integration Test Suite (Real server over HTTP)

This suite validates real app behavior with real infra wiring and selected real external services.

### Required external/non-code setup

- **Dedicated Clerk Test Application** created (separate from dev/prod).
- **Clerk test users** created (at least two users for isolation tests).
- **Clerk allowed origins/redirect URLs** configured for local + CI/docker test hosts.
- **OpenAI test project/key** provisioned (real key, spend-limited, isolated usage tracking).
- **OpenAI budget guardrails** configured (hard/soft limits, alerts).
- **Razorpay test account** created and test API keys provisioned.
- **Razorpay test payment flow constraints** documented (what can run in CI safely).
- **Test secret store entries** created in CI platform:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `OPENAI_API_KEY`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
- **Docker runtime availability in CI** ensured (runner permissions, buildx if needed).
- **Container registry access** configured if images are pushed/pulled in pipeline.
- **Integration environment base URL strategy** decided (ephemeral container URL vs fixed test host).
- **Persistent storage policy** for test DB defined (fresh volume per run / cleanup contract).

### Optional but recommended

- **IP allowlisting checks** done for OpenAI/Razorpay if org network policies restrict CI egress.
- **Cost monitoring dashboard** for integration suite usage created.

---

## 4) End-to-End (E2E) Customer Flow Suite (Docker + Browser)

This suite validates real user journeys in browser against deployed test environment.

### Required external/non-code setup

- **Dedicated Clerk Test Application** confirmed for E2E (same as integration or separate).
- **E2E test users** created with known credentials and recovery plan.
- **Auth flow approach chosen**:
  - UI login each run, or
  - pre-authenticated storage state generation job.
- **Browser test runner infrastructure** provisioned in CI (Playwright-compatible runners).
- **Dockerized app deployment target for E2E** defined (local docker-compose, CI service container, or ephemeral env).
- **Stable test domain/URL** configured for cookie/auth consistency.
- **TLS/certificate strategy** decided (HTTP internal CI network vs HTTPS certs for hosted env).
- **OpenAI real-key usage enabled** for E2E flows that hit chat/extract.
- **Razorpay E2E policy** defined (whether payment UI flow is tested end-to-end in sandbox or partially skipped).
- **Artifact collection setup** enabled in CI:
  - videos
  - traces
  - screenshots
  - console/network logs
- **Flaky test retry policy** agreed (max retries, quarantine rules, failure ownership).

### Optional but recommended

- **Synthetic monitoring overlap check** done to avoid duplicate cost/noise with E2E suite.
- **Cross-browser matrix policy** decided (Chromium-only vs multi-browser schedule).

---

## 5) Cross-Suite Shared Setups

These are foundational and apply to all suites.

### Required external/non-code setup

- **Test environment ownership** assigned (team/person responsible for Clerk/OpenAI/Razorpay test tenancy).
- **Secrets rotation policy** documented and scheduled.
- **Incident process for leaked test keys** documented.
- **Naming conventions** finalized for test users, projects, and CI environments.
- `**.env.example` contract approved** (which vars are mandatory vs optional by suite).
- **Compliance/security review** completed for third-party API usage in CI.
- **Quota and cost approvals** completed for recurring CI runs.
- **Branch protection + required checks** updated to include chosen test suites.

### Optional but recommended

- **Nightly full-suite schedule** approved (integration + E2E off PR path if runtime is high).
- **Dashboard for pass rate / duration / cost** created for long-term stability tracking.

---

## Suggested Minimum “Go-Live” External Setup Bundle

Before enabling integration + E2E in required CI checks, ensure at minimum:

1. Clerk test app + two test users
2. OpenAI test key with budget limits
3. Razorpay test keys
4. CI secrets configured and scoped
5. Docker-capable CI runners
6. Agreed test data reset policy
7. Artifact capture for E2E failures

