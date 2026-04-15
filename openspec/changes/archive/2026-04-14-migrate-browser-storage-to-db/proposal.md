## Why

Currently, financial goals, chat history, and user profile are stored in browser localStorage, which creates several problems: data doesn't persist across devices or browsers, data is lost when users clear browser storage, and there's no backup or synchronization. Moving this data to the database ensures data persistence, cross-device access, and proper data management aligned with the Supabase migration already in progress for statements, snapshots, and subscriptions.

## What Changes

- **Migrate financial goals** from localStorage to Supabase database (new `goals` table)
- **Migrate chat history** from localStorage to Supabase database (new `chat_messages` table)
- **Migrate user profile** from localStorage to Supabase database (new `user_profiles` table)
- **Update React hooks** to use API calls instead of localStorage for:
  - `useFinancialGoals` - replace localStorage with `/api/goals` endpoints
  - `useChatHistory` - replace localStorage with `/api/chat` endpoints
  - `useUserProfile` - replace localStorage with `/api/profile` endpoints
- **Create database migration** to add the three new tables to Supabase
- **Add API routes** for CRUD operations on goals, chat messages, and user profiles
- **Add data migration script** to optionally migrate existing localStorage data to the database

## Capabilities

### New Capabilities

None - this is an implementation change, not new functionality.

### Modified Capabilities

- **financial-goals**: Storage implementation changing from localStorage to database (requirement change: data must persist across devices/browsers, not just locally)
- **financial-chat**: Storage implementation changing from localStorage to database (requirement change: chat history must persist across devices/browsers)
- **user-profile**: Storage implementation changing from localStorage to database (requirement change: profile data must persist across devices/browsers)

## Impact

- **Database**: Adds 3 new tables (goals, chat_messages, user_profiles) to Supabase
- **API**: Adds 3 new API route groups (/api/goals, /api/chat, /api/profile)
- **Client hooks**: Modifies 3 existing hooks (useFinancialGoals, useChatHistory, useUserProfile)
- **Migration**: Requires optional one-time migration script to move existing localStorage data to database
- **Backward compatibility**: Existing localStorage data will be preserved but not used after migration
