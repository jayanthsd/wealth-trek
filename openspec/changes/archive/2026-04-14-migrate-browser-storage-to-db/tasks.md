## 1. Database Migration

- [x] 1.1 Add `goals` table to Supabase migration with fields: id (UUID), user_id (TEXT), title (TEXT), description (TEXT), target_amount (DOUBLE PRECISION), target_date (TEXT), created_at (TIMESTAMPTZ), status (TEXT)
- [x] 1.2 Add `chat_messages` table to Supabase migration with fields: id (UUID), user_id (TEXT), role (TEXT), content (TEXT), timestamp (TIMESTAMPTZ), suggested_goal_json (JSONB)
- [x] 1.3 Add `user_profiles` table to Supabase migration with fields: id (UUID), user_id (TEXT), full_name (TEXT), address (TEXT), certificate_date (TEXT), as_on_date (TEXT)
- [x] 1.4 Add indexes on user_id for all three tables for query performance
- [ ] 1.5 Run migration in Supabase SQL Editor and verify tables are created (MANUAL: run app/supabase-migration.sql in Supabase SQL Editor)

## 2. API Routes - Goals

- [x] 2.1 Create `app/src/app/api/goals/route.ts` with GET endpoint to fetch all goals for current user
- [x] 2.2 Add POST endpoint to create a new goal in `app/src/app/api/goals/route.ts`
- [x] 2.3 Create `app/src/app/api/goals/[id]/route.ts` with PUT endpoint to update a goal
- [x] 2.4 Add DELETE endpoint in `app/src/app/api/goals/[id]/route.ts`
- [x] 2.5 Add error handling and validation for all goal endpoints
- [ ] 2.6 Test goal API endpoints manually or with existing test framework (MANUAL: requires running app and testing endpoints)

## 3. API Routes - Chat

- [x] 3.1 Create `app/src/app/api/chat/messages/route.ts` with GET endpoint to fetch all chat messages for current user
- [x] 3.2 Add POST endpoint to create a new chat message in `app/src/app/api/chat/messages/route.ts`
- [x] 3.3 Create `app/src/app/api/chat/messages/[id]/route.ts` with PUT endpoint to update a message
- [x] 3.4 Add DELETE endpoint in `app/src/app/api/chat/messages/[id]/route.ts`
- [x] 3.5 Add error handling and validation for all chat endpoints
- [ ] 3.6 Test chat API endpoints manually or with existing test framework (MANUAL: requires running app and testing endpoints)

## 4. API Routes - Profile

- [x] 4.1 Create `app/src/app/api/profile/route.ts` with GET endpoint to fetch user profile for current user
- [x] 4.2 Add POST endpoint to create or update user profile in `app/src/app/api/profile/route.ts`
- [x] 4.3 Add error handling and validation for profile endpoints
- [ ] 4.4 Test profile API endpoints manually or with existing test framework (MANUAL: requires running app and testing endpoints)

## 5. React Hook Migration - Goals

- [x] 5.1 Modify `useFinancialGoals.ts` to fetch goals from `/api/goals` on mount instead of localStorage
- [x] 5.2 Replace `addGoal` to POST to `/api/goals` instead of updating local state directly
- [x] 5.3 Replace `updateGoalStatus` to PUT to `/api/goals/:id` instead of updating local state directly
- [x] 5.4 Replace `deleteGoal` to DELETE `/api/goals/:id` instead of updating local state directly
- [x] 5.5 Remove localStorage.setItem call from useEffect
- [x] 5.6 Update tests in `useFinancialGoals.test.ts` to mock API calls instead of localStorage
- [ ] 5.7 Verify goals UI components still work correctly with updated hook (MANUAL: requires running app and testing UI)

## 6. React Hook Migration - Chat

- [x] 6.1 Modify `useChatHistory.ts` to fetch messages from `/api/chat/messages` on mount instead of localStorage
- [x] 6.2 Replace `addMessage` to POST to `/api/chat/messages` instead of updating local state directly
- [x] 6.3 Replace `updateLastAssistantMessage` to PUT to `/api/chat/messages/:id` instead of updating local state directly
- [x] 6.4 Replace `setGoalOnMessage` to PUT to `/api/chat/messages/:id` instead of updating local state directly
- [x] 6.5 Update `clearHistory` to clear UI state only (database retains history)
- [x] 6.6 Remove localStorage.setItem call from useEffect
- [x] 6.7 Update tests in `useChatHistory.test.ts` to mock API calls instead of localStorage
- [ ] 6.8 Verify chat UI components still work correctly with updated hook (MANUAL: requires running app and testing UI)

## 7. React Hook Migration - Profile

- [x] 7.1 Modify `useUserProfile.ts` to fetch profile from `/api/profile` on mount instead of localStorage
- [x] 7.2 Replace `updateProfile` to POST to `/api/profile` instead of updating local state directly
- [x] 7.3 Remove localStorage.setItem call from useEffect
- [x] 7.4 Update tests in `useUserProfile.test.ts` to mock API calls instead of localStorage
- [ ] 7.5 Verify profile UI components still work correctly with updated hook (MANUAL: requires running app and testing UI)

## 8. React Hook Migration - Documents

- [x] 8.1 Review `useDocuments.ts` to determine if document metadata should also be migrated to database (DECISION: Not migrating - out of scope, documents already have partial API integration, keeps change focused)
- [x] 8.2 If migrating documents, create database table and API routes following the same pattern (SKIPPED - not migrating documents)
- [x] 8.3 If not migrating, document decision and keep localStorage for documents metadata (DECISION: Keep localStorage for documents metadata - can migrate in future change if needed)

## 9. Data Migration Script

- [x] 9.1 Create `app/src/utils/migrateLocalStorageToDb.ts` utility to read localStorage data
- [x] 9.2 Add migration function for goals: read from localStorage, POST to `/api/goals`, clear localStorage on success
- [x] 9.3 Add migration function for chat: read from localStorage, POST to `/api/chat/messages`, clear localStorage on success
- [x] 9.4 Add migration function for profile: read from localStorage, POST to `/api/profile`, clear localStorage on success
- [x] 9.5 Add error handling and rollback (restore localStorage if migration fails)
- [x] 9.6 Integrate migration script to run on app initialization when localStorage has data and database is empty
- [ ] 9.7 Test migration script with sample localStorage data (MANUAL: requires testing with actual localStorage data)

## 10. Testing

- [ ] 10.1 Test end-to-end goal flow: create, update status, delete, persist across refresh
- [ ] 10.2 Test end-to-end chat flow: send message, receive response, persist across refresh
- [ ] 10.3 Test end-to-end profile flow: update profile, persist across refresh
- [ ] 10.4 Test data isolation: verify user A cannot see user B's data
- [ ] 10.5 Test migration script with actual localStorage data
- [ ] 10.6 Test error scenarios: network failures, API errors, validation errors

## 11. Documentation

- [x] 11.1 Update `supabase-migration.sql` with the three new table definitions
- [x] 11.2 Update architecture documentation to reflect database storage for goals/chat/profile
- [x] 11.3 Update data model documentation with new tables
- [x] 11.4 Document the migration process for existing users

## 12. Deployment

- [ ] 12.1 Deploy database migration to staging environment
- [ ] 12.2 Deploy API routes to staging environment
- [ ] 12.3 Deploy updated hooks to staging environment
- [ ] 12.4 Test full migration flow in staging
- [ ] 12.5 Deploy to production after staging validation
- [ ] 12.6 Monitor production for errors and performance issues
