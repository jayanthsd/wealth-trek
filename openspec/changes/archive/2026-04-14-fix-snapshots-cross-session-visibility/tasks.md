## 1. Replace Supabase Server Client

- [x] 1.1 Update `app/src/utils/supabase/server.ts` to use `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY` instead of cookie-based `createServerClient` from `@supabase/ssr`
- [x] 1.2 Remove the `cookieStore` parameter from the exported `createClient` function (no longer needed)
- [x] 1.3 Update all API route files that call `createClient(cookieStore)` to call `createClient()` without arguments, and remove unused `cookies` imports
- [x] 1.4 Add runtime guards to `server.ts` to fail loudly if `SUPABASE_SERVICE_ROLE_KEY` is missing
- [x] 1.5 Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.example` documentation

## 2. Environment Configuration

- [x] 2.1 Add `SUPABASE_SERVICE_ROLE_KEY` to local `.env.local` (from Supabase Dashboard → Settings → API)

## 3. Remove Supabase Session Middleware

- [x] 3.1 Remove the `updateSession` import and call from `app/src/proxy.ts`
- [x] 3.2 Delete `app/src/utils/supabase/middleware.ts` (no longer needed)

## 4. Update API Routes

- [x] 4.1 Update `app/src/app/api/statements/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.2 Update `app/src/app/api/statements/[id]/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.3 Update `app/src/app/api/snapshots/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.4 Update `app/src/app/api/snapshots/[id]/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.5 Update `app/src/app/api/goals/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.6 Update `app/src/app/api/goals/[id]/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.7 Update `app/src/app/api/chat/messages/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.8 Update `app/src/app/api/chat/messages/[id]/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.9 Update `app/src/app/api/profile/route.ts` — remove `cookies` import and `cookieStore` usage
- [x] 4.10 Update any other API routes importing `cookies` for Supabase client creation (subscription, payments/verify)

## 5. Verification

- [x] 5.1 Test: create a snapshot in one session, verify it appears in incognito logged in as the same user
- [x] 5.2 Test: verify statements, goals, chat, and profile data persist across sessions
- [ ] 5.3 Verify the app builds without errors (`npm run build`)
- [ ] 5.4 Verify `SUPABASE_SERVICE_ROLE_KEY` is set in deployment environment (Vercel)
