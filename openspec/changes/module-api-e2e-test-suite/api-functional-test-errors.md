# API Functional Test Error Report

## Run Metadata

- **Suite:** API functional tests (`api-functional-tests`)
- **Command:** `npm run test:functional`
- **Working directory:** `app/`
- **Result:** PASS
- **Summary:** `11` test files passed, `26` tests passed, `0` failed

## Repro Steps

1. Open terminal at repo root.
2. Run:
   - `cd app`
   - `npm run test:functional`
3. Observe Vitest output for route-level API tests under `src/app/api/**`.

## Failures

No failing tests were observed in this run.

## Notes

- Functional suite uses mocked dependencies by design:
  - mocked Clerk auth for protected routes
  - mocked Razorpay network behavior for payment route tests
  - mocked OpenAI responses for chat/doc-extract route tests
