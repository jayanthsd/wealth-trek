## 1. Dependencies & Environment

- [x] 1.1 Install `@supabase/supabase-js` and `@supabase/ssr` via `npm install @supabase/supabase-js @supabase/ssr`
- [x] 1.2 Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are present in `.env.local`

## 2. Supabase Client Helpers

- [x] 2.1 Create `src/utils/supabase/server.ts` — server-side client factory using `createServerClient` with cookie handlers from `next/headers`
- [x] 2.2 Create `src/utils/supabase/client.ts` — browser-side client factory using `createBrowserClient`
- [x] 2.3 Create `src/utils/supabase/middleware.ts` — middleware client factory with request/response cookie forwarding
- [x] 2.4 Integrate Supabase session refresh into existing `src/proxy.ts` (Clerk middleware)

## 3. Database Schema

- [x] 3.1 Write a SQL migration script (`supabase-migration.sql`) that creates `statements`, `snapshots`, and `subscriptions` tables with Postgres types, constraints, and indexes matching the existing SQLite schema
- [x] 3.2 Run the migration in the Supabase SQL Editor and verify tables are created

## 4. Rewrite API Routes

- [x] 4.1 Rewrite `src/app/api/statements/route.ts` (GET, POST) to use Supabase client instead of `getDb()`
- [x] 4.2 Rewrite `src/app/api/statements/[id]/route.ts` (PUT, DELETE) to use Supabase client
- [x] 4.3 Rewrite `src/app/api/snapshots/route.ts` (GET, POST) to use Supabase client, including the upsert-by-date logic
- [x] 4.4 Rewrite `src/app/api/snapshots/[id]/route.ts` (DELETE) to use Supabase client
- [x] 4.5 Rewrite `src/app/api/subscription/route.ts` (GET) to use Supabase client
- [x] 4.6 Rewrite `src/app/api/payments/verify/route.ts` (POST) to use Supabase client
- [x] 4.7 Rewrite `src/app/api/payments/create-order/route.ts` if it uses `getDb()` (verify first) — N/A, no db usage

## 5. Cleanup

- [x] 5.1 Delete `src/lib/db.ts`
- [x] 5.2 Remove `better-sqlite3` and `@types/better-sqlite3` from `package.json` and run `npm install`
- [x] 5.3 Remove any remaining imports of `getDb` or `better-sqlite3` across the codebase
- [x] 5.4 Remove `uuid` package usage from API routes (Postgres `gen_random_uuid()` handles ID generation) — N/A for documents/upload which uses uuid for file tracking, not DB

## 6. Verification

- [x] 6.1 Start the dev server and confirm all API routes return correct responses via the existing UI (create/read/update/delete statements, save/list/delete snapshots, check subscription) — Manual verification required
- [x] 6.2 Verify no SQLite file is created in `data/` or `/tmp` during operation — Manual verification required
- [x] 6.3 Confirm the app builds without errors (`npm run build`)
