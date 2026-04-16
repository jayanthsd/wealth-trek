## Context

The app currently uses `better-sqlite3` via `src/lib/db.ts` for all data persistence (statements, snapshots, subscriptions). Every API route imports `getDb()` and runs raw SQL. Authentication is handled by Clerk (`auth()` from `@clerk/nextjs/server`); the Clerk `userId` is the row-level isolation key in every table.

SQLite writes to `data/networth.db` locally and `/tmp/networth.db` on Vercel — meaning production data is lost on every cold start or redeployment. The app needs a durable cloud database.

Supabase project is already provisioned (`wwjsyxmvtwfcecmpduuj.supabase.co`) and env vars are in `.env.local`.

## Goals / Non-Goals

**Goals:**
- Replace SQLite with Supabase Postgres as the sole database.
- Create Supabase client helpers for server components, client components, and middleware.
- Rewrite all API routes to use the Supabase JS client instead of raw SQL.
- Provide a SQL migration script to create equivalent tables in Supabase.
- Remove `better-sqlite3` and `src/lib/db.ts`.

**Non-Goals:**
- Replacing Clerk auth with Supabase Auth — Clerk stays as the identity provider.
- Enabling Supabase Row Level Security (RLS) policies — since API routes run server-side with the anon key and enforce user isolation in application code via Clerk `userId`, RLS is out of scope for now.
- Data migration from existing SQLite databases — users on dev had ephemeral data; no migration tooling needed.
- Changing the API contract — request/response shapes stay identical.

## Decisions

### 1. Supabase client architecture — three helpers

**Decision**: Create three Supabase client factories following the official `@supabase/ssr` pattern:
- `src/utils/supabase/server.ts` — for API routes and server components (reads `cookies()`)
- `src/utils/supabase/client.ts` — for browser-side use (if needed later)
- `src/utils/supabase/middleware.ts` — for Next.js middleware to keep Supabase sessions refreshed

**Rationale**: This is Supabase's recommended Next.js App Router pattern. Even though we don't use Supabase Auth today, having the cookie plumbing in place means the middleware helper is trivially available if we ever add Supabase Auth or RLS with JWT.

**Alternative considered**: Single `createClient()` used everywhere — rejected because server vs browser contexts require different cookie handling.

### 2. Keep Clerk userId as the isolation key

**Decision**: Continue passing Clerk's `userId` into Supabase queries via `.eq('user_id', userId)` rather than relying on Supabase RLS with JWTs.

**Rationale**: The app already has a working Clerk integration. Introducing Supabase Auth or a custom JWT bridge adds complexity with no immediate benefit. All data access goes through server-side API routes where Clerk auth is enforced.

### 3. Use Supabase JS client, not raw SQL

**Decision**: Use `supabase.from('table').select()` / `.insert()` / `.update()` / `.delete()` instead of raw SQL via `supabase.rpc()` or a Postgres driver.

**Rationale**: The Supabase JS client provides typed queries, automatic error handling, and is the idiomatic way to interact with Supabase. The existing queries are simple CRUD and translate directly.

### 4. Table schema — mirror SQLite with Postgres types

**Decision**: Create `statements`, `snapshots`, and `subscriptions` tables with equivalent columns, using Postgres types (`text`, `double precision`, `timestamptz`, `jsonb`).

**Rationale**: Minimises changes to API route logic. `entries_json` in snapshots becomes a `jsonb` column for better queryability in the future.

### 5. UUID generation — use Postgres `gen_random_uuid()`

**Decision**: Let Postgres generate UUIDs via `DEFAULT gen_random_uuid()` instead of `uuid` npm package in application code.

**Rationale**: Removes a dependency (`uuid`) from API routes and is more idiomatic for Postgres.

## Risks / Trade-offs

- **Anon key exposure**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is exposed to the browser. Without RLS policies, any client-side Supabase call could read/write all data. → **Mitigation**: All data access goes through server-side API routes; the browser client is only set up for future use and is not imported by any data-fetching code today.

- **No RLS**: Application-level user isolation depends on correct `userId` filtering in every query. A missed filter = data leak. → **Mitigation**: Centralize the Supabase client creation with consistent patterns; add RLS in a follow-up change.

- **Latency increase**: SQLite was in-process; Supabase adds network round-trips (~50-100ms per query). → **Mitigation**: Acceptable for this app's usage patterns; Supabase connection pooling (Supavisor) keeps it fast.

- **Dependency on Supabase uptime**: If Supabase is down, the app is down. → **Mitigation**: Supabase has 99.9% SLA on Pro plan; acceptable for current scale.

## Migration Plan

1. Run SQL migration script in Supabase SQL Editor to create tables and indexes.
2. Install `@supabase/supabase-js` and `@supabase/ssr`.
3. Create `src/utils/supabase/` client helpers.
4. Create `middleware.ts` at app root.
5. Rewrite each API route file one at a time (statements, snapshots, subscription, payments).
6. Remove `better-sqlite3` from `package.json` and delete `src/lib/db.ts`.
7. Verify all API routes work via the existing UI.
8. Deploy to Vercel and confirm data persists across redeployments.

Rollback: Revert the PR and re-add `better-sqlite3`. No data migration needed since Supabase tables are new.
