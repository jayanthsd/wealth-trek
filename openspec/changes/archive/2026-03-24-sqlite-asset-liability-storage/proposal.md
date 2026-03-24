## Why

The app currently stores all financial data (statement entries, user profile, net worth snapshots) in browser localStorage. This means data is siloed per device/browser—users lose access when switching devices and cannot track asset/liability trends across sessions reliably. Moving to a server-side SQLite database tied to the authenticated user enables cross-device access and persistent historical analytics.

## What Changes

- Introduce a SQLite database on the server to persist statement entries and net worth snapshots per authenticated user
- Create Next.js API routes for CRUD operations on statements and snapshots
- Replace client-side localStorage hooks (`useStatements`, `useNetWorthHistory`) with API-backed hooks that read/write through the server
- Retain localStorage as an offline fallback/cache layer for the current session, but treat the server DB as the source of truth
- Associate all stored data with the Clerk-authenticated user ID

## Capabilities

### New Capabilities
- `server-data-persistence`: Server-side SQLite database schema, connection management, and API routes for storing and retrieving user statement entries and net worth snapshots

### Modified Capabilities
- `statement-upload`: Replace localStorage auto-save with server-side persistence via API calls; statements are saved to the SQLite DB per user
- `networth-computation`: Net worth snapshots are saved to and loaded from the SQLite DB, enabling cross-device trend tracking

## Impact

- **New dependency**: `better-sqlite3` (or similar SQLite driver) added to `app/package.json`
- **API routes**: New `/api/statements` and `/api/snapshots` endpoints in `app/src/app/api/`
- **Hooks refactored**: `useStatements`, `useNetWorthHistory` rewritten to use `fetch` calls instead of direct localStorage
- **Auth dependency**: All API routes require Clerk authentication to identify the user; unauthenticated requests are rejected
- **Database file**: SQLite `.db` file stored on the server filesystem (e.g., `app/data/networth.db`)
- **Migration**: Existing localStorage data could be migrated on first authenticated load (optional)
