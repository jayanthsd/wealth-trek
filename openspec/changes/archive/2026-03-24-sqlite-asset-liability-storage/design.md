## Context

The net worth certificate generator app is a Next.js 16 application using Clerk for authentication. Currently, all user data—statement entries, user profile, and net worth snapshots—is stored in browser localStorage via React hooks (`useStatements`, `useUserProfile`, `useNetWorthHistory`). This means data is device-bound and cannot be accessed across browsers or devices.

The app already has Clerk authentication, so every request can be associated with a user ID. The goal is to introduce a server-side SQLite database so that statements and snapshots persist per-user and are accessible from any device.

## Goals / Non-Goals

**Goals:**
- Persist statement entries and net worth snapshots in a server-side SQLite database, keyed by Clerk user ID
- Expose RESTful API routes for CRUD operations on statements and snapshots
- Refactor `useStatements` and `useNetWorthHistory` hooks to use API calls instead of localStorage
- Ensure all API routes are authenticated (reject unauthenticated requests)

**Non-Goals:**
- Migrating user profile data to the DB (profile remains in localStorage for now—it's lightweight and session-specific)
- Migrating uploaded documents metadata to the DB
- Real-time sync or conflict resolution across multiple open tabs/devices
- Production-grade database hosting (SQLite file on server filesystem is sufficient for current scale)

## Decisions

### Decision 1: SQLite via `better-sqlite3`

Use `better-sqlite3` as the SQLite driver. It is synchronous, fast, and well-suited for Next.js API routes running in a Node.js environment. No ORM layer—use raw SQL for simplicity given the small schema.

**Alternatives considered:**
- **Prisma + SQLite**: Adds significant overhead and complexity for a 2-table schema. Rejected for simplicity.
- **Turso/libSQL**: Cloud-hosted SQLite. Good for production multi-device, but adds external dependency and cost. Could be a future upgrade path.
- **PostgreSQL**: Overkill for this use case and requires separate server infrastructure.

### Decision 2: Database schema

Two tables:

```sql
CREATE TABLE statements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  statement_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK(category IN ('asset', 'liability')),
  closing_balance REAL NOT NULL CHECK(closing_balance >= 0),
  ownership_percentage REAL NOT NULL CHECK(ownership_percentage >= 1 AND ownership_percentage <= 100),
  source_document_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_assets REAL NOT NULL,
  total_liabilities REAL NOT NULL,
  net_worth REAL NOT NULL,
  entries_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX idx_snapshots_user_date ON snapshots(user_id, date);
CREATE INDEX idx_statements_user ON statements(user_id);
```

Snapshot entries are stored as JSON (`entries_json`) since they are a historical record and don't need to be queried individually.

### Decision 3: API route structure

```
POST   /api/statements          — Create a statement (or bulk create)
GET    /api/statements          — List all statements for current user
PUT    /api/statements/[id]     — Update a statement
DELETE /api/statements/[id]     — Delete a statement

GET    /api/snapshots           — List all snapshots for current user
POST   /api/snapshots           — Save/upsert a snapshot (by date)
DELETE /api/snapshots/[id]      — Delete a snapshot
```

All routes authenticate via `auth()` from `@clerk/nextjs/server` and extract the `userId`. Unauthenticated requests return 401.

### Decision 4: Hook refactoring strategy

- `useStatements` will fetch statements from `/api/statements` on mount and expose the same API (`addStatement`, `updateStatement`, `deleteStatement`, `bulkAddStatements`)
- Each mutation calls the API first, then updates local React state on success (optimistic updates are a non-goal for now)
- `useNetWorthHistory` will fetch snapshots from `/api/snapshots` on mount; `saveSnapshot` and `deleteSnapshot` call the API
- Both hooks will use a `loading` state that the UI already handles

### Decision 5: Database file location

The SQLite database file will be stored at `app/data/networth.db`. The `app/data/` directory will be gitignored. A `db.ts` module in `app/src/lib/` will handle connection initialization and table creation on first access.

## Risks / Trade-offs

- **SQLite single-writer limitation** → Acceptable for current scale; `better-sqlite3` handles concurrent reads well and writes are serialized automatically. If the app scales to many concurrent users, migrate to Turso or PostgreSQL.
- **No offline support** → Users without network access cannot load/save data. Mitigation: could add localStorage caching as a future enhancement, but not in this change.
- **Server filesystem dependency** → SQLite file lives on the server. If deployed to serverless (e.g., Vercel), this won't persist across cold starts. Mitigation: for Vercel deployment, a future change should migrate to Turso or a hosted DB. For self-hosted/VPS, this is fine.
- **No data migration from localStorage** → Existing users will start with empty data on first server load. Mitigation: document this as a known limitation; a future optional migration endpoint could be added.
