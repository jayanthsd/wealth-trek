## Context

The app uses **Clerk** for authentication and **Supabase PostgreSQL** for data storage. The current Supabase server client (`app/src/utils/supabase/server.ts`) is built with `@supabase/ssr`'s `createServerClient`, which uses the **anon key** and relies on cookie-based sessions to establish a Supabase Auth identity.

Since the app authenticates users via Clerk (not Supabase Auth), there is never a valid Supabase auth session in the cookies. When Supabase Row Level Security (RLS) is active on tables, the anonymous client cannot read or write rows without matching RLS policies — causing data created in one browser session to be invisible in another (e.g., incognito window), even for the same Clerk user.

All API routes already:
1. Call `auth()` from `@clerk/nextjs/server` to extract `userId`
2. Return 401 if unauthenticated
3. Scope all queries with `.eq("user_id", userId)`

The Supabase middleware in `proxy.ts` (`updateSession`) attempts to refresh a Supabase session that doesn't exist, serving no purpose.

## Goals / Non-Goals

**Goals:**
- Fix cross-session data visibility so the same user sees their data in any browser session
- Use the Supabase service-role key for server-side API routes, bypassing RLS since Clerk handles auth
- Remove unused Supabase session middleware
- Keep all existing API behavior and user isolation intact

**Non-Goals:**
- Implementing Supabase Auth or syncing Clerk sessions with Supabase Auth (JWTs)
- Changing RLS policies in Supabase (service-role key bypasses RLS entirely)
- Modifying any API route logic or response shapes
- Changing client-side Supabase usage

## Decisions

### Decision 1: Use service-role key instead of anon key for server API routes

**Choice:** Replace `createServerClient` (cookie-based, anon key) with `createClient` from `@supabase/supabase-js` using `SUPABASE_SERVICE_ROLE_KEY`.

**Rationale:**
- The app does not use Supabase Auth — Clerk is the sole auth provider
- API routes already authenticate via Clerk and scope queries by `user_id`
- The service-role key bypasses RLS, which is the correct approach when the application layer handles access control
- This is the simplest fix with zero changes to API route logic

**Runtime guards:** Added explicit checks in `server.ts` that throw an error if `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` are missing. This prevents silent failures where the Supabase client is initialized with `undefined` as the key.

**Alternatives considered:**
- *Sync Clerk JWTs with Supabase Auth*: Complex, requires JWT template setup in Clerk and custom Supabase JWT verification. Over-engineered for this use case.
- *Disable RLS on all tables*: Works but reduces defense-in-depth. Service-role key is more intentional.
- *Add RLS policies for anonymous access*: Would require a custom claim or column-level policy. Fragile and unnecessary when Clerk handles auth.

### Decision 2: Remove Supabase session middleware

**Choice:** Remove the `updateSession` call from `proxy.ts` and delete `middleware.ts`.

**Rationale:**
- The middleware refreshes a Supabase Auth session that never exists (Clerk handles auth)
- It adds unnecessary overhead to every request
- The server client no longer uses cookies, so session refresh is meaningless

### Decision 3: Keep the browser client unchanged

**Choice:** Leave `app/src/utils/supabase/client.ts` as-is.

**Rationale:**
- The browser client is not currently used by any hooks or components (all data access goes through API routes)
- No reason to modify it for this fix

## Risks / Trade-offs

- **Service-role key exposure** → Mitigated: The key is only used in server-side API routes (Next.js `app/api/*`), never sent to the browser. Environment variable `SUPABASE_SERVICE_ROLE_KEY` must be set as a server-only env var (no `NEXT_PUBLIC_` prefix).
- **RLS bypassed for all server queries** → Mitigated: All API routes enforce user isolation via Clerk `auth()` + `user_id` filtering. This is the same trust model as the previous SQLite implementation.
- **Existing env var required** → `SUPABASE_SERVICE_ROLE_KEY` is already documented in `docs/architecture.md`. Must be set in Vercel and local `.env.local`.
