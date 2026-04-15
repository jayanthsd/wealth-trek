# Migration Guide: localStorage to Database

## Overview

This migration moves user data from browser localStorage to Supabase PostgreSQL database. This ensures data persists across devices and browsers.

## What's Being Migrated

- **Financial Goals**: From `localStorage.getItem("financial-goals")` to `goals` table
- **Chat History**: From `localStorage.getItem("financial-chat-history")` to `chat_messages` table
- **User Profile**: From `localStorage.getItem("nwc_profile")` to `user_profiles` table

## How Migration Works

The migration is automatic and runs on app initialization:

1. **Detection**: The app checks if localStorage contains any of the three data types
2. **Validation**: It checks if the database already has data for the current user
3. **Migration**: If localStorage has data and database is empty, data is migrated
4. **Cleanup**: localStorage is cleared after successful migration
5. **Logging**: Migration results are logged to the browser console

## Migration Implementation

The migration is implemented in `app/src/utils/migrateLocalStorageToDb.ts` and triggered by `app/src/components/MigrationRunner.tsx` which is included in the root layout.

### Migration Logic

For each data type:

1. Read from localStorage
2. Check if database already has data (skip if yes)
3. POST each item to the corresponding API endpoint
4. Clear localStorage on success
5. Log any errors

### Error Handling

- If migration fails for one data type, it continues with others
- Errors are logged but don't block the app from loading
- localStorage is only cleared after successful migration
- No rollback is implemented (data remains in localStorage if migration fails)

## Manual Migration

If you need to manually trigger migration (e.g., after a failed migration):

1. Open browser DevTools Console
2. Run:
```javascript
// Check if migration is needed
localStorage.getItem("financial-goals")
localStorage.getItem("financial-chat-history")
localStorage.getItem("nwc_profile")

// If data exists, reload the page to trigger automatic migration
location.reload()
```

## Verifying Migration

After migration:

1. Check browser console for migration logs
2. Verify data appears in the UI (goals, chat history, profile)
3. Verify localStorage is cleared:
```javascript
localStorage.getItem("financial-goals") // Should be null
localStorage.getItem("financial-chat-history") // Should be null
localStorage.getItem("nwc_profile") // Should be null
```

## Rollback

If migration causes issues:

1. Data remains in localStorage until successful migration
2. Clear database tables in Supabase:
```sql
DELETE FROM goals WHERE user_id = 'your-user-id';
DELETE FROM chat_messages WHERE user_id = 'your-user-id';
DELETE FROM user_profiles WHERE user_id = 'your-user-id';
```
3. Reload the app - migration will run again

## Data Not Migrated

- **Document Metadata**: Remains in localStorage (`nwc_documents`)
  - This is intentional - document metadata is a cache
  - Actual files are stored server-side in uploads/
  - Can be safely cleared without data loss

## Post-Migration

After successful migration:

- Data syncs across devices and browsers
- Data persists even if browser storage is cleared
- No action required from users
