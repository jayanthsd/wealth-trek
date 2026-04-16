## Why

Snapshots and statements created by a user are not visible when the same user logs in from a different browser session (e.g., incognito window), even though the data exists in Supabase. The root cause is that the Supabase server client (`app/src/utils/supabase/server.ts`) uses the **anon key** with cookie-based sessions via `@supabase/ssr`. Since authentication is handled by **Clerk** (not Supabase Auth), there is no Supabase auth session in the cookies. When Supabase Row Level Security (RLS) is active, the anonymous client without a valid Supabase session cannot read rows — making data invisible across sessions despite existing in the database.

## What Changes

- Replace the cookie-based Supabase server client with a **service-role client** for all server-side API routes, since Clerk handles authentication and API routes already enforce `user_id` scoping
- Remove the cookie-based `@supabase/ssr` server client (`createServerClient`) in favor of a direct `@supabase/supabase-js` client using `SUPABASE_SERVICE_ROLE_KEY`
- Remove the Supabase session middleware from `proxy.ts` since it serves no purpose with Clerk auth
- Ensure all API routes continue to authenticate via Clerk and scope queries by `user_id`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `server-data-persistence`: The Supabase client strategy changes from cookie-based anon key to service-role key for server-side API routes. All existing API behavior and user isolation requirements remain unchanged — Clerk auth + `user_id` filtering continues to enforce access control.

## Impact

- **Files**: `app/src/utils/supabase/server.ts`, `app/src/proxy.ts`, `app/src/utils/supabase/middleware.ts`
- **Environment**: Requires `SUPABASE_SERVICE_ROLE_KEY` env var (already documented in architecture docs)
- **Security**: Service-role key is only used server-side in API routes; never exposed to the client. Clerk auth remains the access control layer.
- **All API routes**: No changes needed — they already import `createClient` from `@/utils/supabase/server` and authenticate via Clerk
