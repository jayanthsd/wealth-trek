## Why

The application currently uses SQLite (better-sqlite3) for server-side data persistence. SQLite writes to a local file (`data/networth.db`) which is ephemeral on Vercel (falls back to `/tmp`), making production data non-durable across deployments. Migrating to Supabase Postgres provides a managed, persistent, cloud-hosted database accessible from both server and client, with built-in connection pooling and Row Level Security. This unblocks reliable production deployments on Vercel.

## What Changes

- **Install** `@supabase/supabase-js` and `@supabase/ssr` packages.
- **Add Supabase client helpers**: server-side (`utils/supabase/server.ts`), browser-side (`utils/supabase/client.ts`), and middleware (`utils/supabase/middleware.ts`) for cookie-based session refresh.
- **Create Supabase Postgres tables** mirroring the existing SQLite schema: `statements`, `snapshots`, `subscriptions`.
- **Rewrite API routes** (`/api/statements`, `/api/snapshots`, `/api/subscription`, `/api/payments/verify`) to use the Supabase client instead of `better-sqlite3`.
- **Remove** `better-sqlite3` dependency and `src/lib/db.ts`.
- **Keep Clerk** as the authentication provider — Supabase is used purely as the database layer; Clerk `userId` remains the user-isolation key.

## Capabilities

### New Capabilities
- `supabase-database`: Supabase client setup (server, browser, middleware helpers) and Postgres table definitions replacing SQLite.

### Modified Capabilities
- `server-data-persistence`: All API routes switch from SQLite to Supabase Postgres queries. Schema stays equivalent; transport layer changes.

## Impact

- **Dependencies**: Add `@supabase/supabase-js`, `@supabase/ssr`. Remove `better-sqlite3`.
- **Environment**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` required (already present in `.env.local`).
- **API routes**: Every route under `src/app/api/` that imports `@/lib/db` must be rewritten.
- **Middleware**: New `middleware.ts` at app root to keep Supabase sessions refreshed.
- **Database migration**: One-time table creation in Supabase dashboard or via SQL migration script.
- **Deployment**: Vercel builds will no longer need the `better-sqlite3` native addon, simplifying CI.
