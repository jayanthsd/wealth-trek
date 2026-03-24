## 1. Database Setup

- [x] 1.1 Install `better-sqlite3` and `@types/better-sqlite3` dependencies in `app/`
- [x] 1.2 Add `app/data/` to `.gitignore`
- [x] 1.3 Create `app/src/lib/db.ts` — initialize SQLite connection, create `statements` and `snapshots` tables with `CREATE TABLE IF NOT EXISTS`

## 2. Statements API Routes

- [x] 2.1 Create `app/src/app/api/statements/route.ts` with GET (list user statements) and POST (create single or bulk statements) handlers, authenticated via Clerk `auth()`
- [x] 2.2 Create `app/src/app/api/statements/[id]/route.ts` with PUT (update) and DELETE handlers, scoped to the authenticated user's own entries

## 3. Snapshots API Routes

- [x] 3.1 Create `app/src/app/api/snapshots/route.ts` with GET (list user snapshots sorted by date) and POST (upsert snapshot by date) handlers, authenticated via Clerk `auth()`
- [x] 3.2 Create `app/src/app/api/snapshots/[id]/route.ts` with DELETE handler, scoped to the authenticated user's own snapshots

## 4. Refactor Client Hooks

- [x] 4.1 Rewrite `app/src/hooks/useStatements.ts` to fetch statements from `GET /api/statements` on mount and call API for add, bulkAdd, update, and delete mutations instead of localStorage
- [x] 4.2 Rewrite `app/src/hooks/useNetWorthHistory.ts` to fetch snapshots from `GET /api/snapshots` on mount and call API for saveSnapshot and deleteSnapshot instead of localStorage

## 5. Verification

- [x] 5.1 Verify the app builds without errors (`npm run build`)
- [x] 5.2 Manually test: create, edit, delete statements; save and delete snapshots; confirm data persists across page refresh and is scoped per user
