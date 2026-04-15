## Context

Currently, financial goals, chat history, and user profile are stored in browser localStorage using React hooks (`useFinancialGoals`, `useChatHistory`, `useUserProfile`). This approach was suitable for early development but now limits the application: data doesn't sync across devices, is lost when users clear browser storage, and lacks proper backup. The application is already migrating to Supabase for statements, snapshots, and subscriptions (see `supabase-migration.sql`), making this the right time to complete the migration.

## Goals / Non-Goals

**Goals:**
- Migrate all three data types (goals, chat history, user profile) from localStorage to Supabase
- Maintain backward compatibility by preserving existing localStorage data
- Ensure data persists across devices and browsers
- Follow the existing pattern used for statements/snapshots (API routes + React hooks)
- Provide optional migration path for existing users' localStorage data

**Non-Goals:**
- Changing the UI or user experience (storage change should be transparent)
- Implementing real-time sync (initial implementation will be fetch-based like statements)
- Multi-user collaboration (single-user per account model maintained)
- Changing the data model or schema (keep existing TypeScript interfaces)

## Decisions

### Database Schema Design
We'll add three new tables to Supabase following the existing pattern from `supabase-migration.sql`:

- **goals**: Stores financial goals with user_id for multi-user support
- **chat_messages**: Stores chat messages with user_id and conversation grouping
- **user_profiles**: Stores user profile data with user_id

**Decision**: Use UUID primary keys (like statements/snapshots) for consistency and include `user_id` TEXT field for future multi-user support, even though current implementation is single-user.

**Alternative considered**: Using auto-increment IDs. Rejected because existing tables use UUIDs and we want consistency.

### API Route Pattern
Follow the existing pattern used by statements and snapshots:
- `GET /api/goals` - fetch all goals for current user
- `POST /api/goals` - create new goal
- `PUT /api/goals/:id` - update goal
- `DELETE /api/goals/:id` - delete goal

Same pattern for chat and profile.

**Decision**: Use Supabase client from `@/utils/supabase/server.ts` for server-side API routes, matching the pattern in `/api/statements/route.ts`.

**Alternative considered**: Using direct PostgreSQL queries. Rejected because Supabase client provides better type safety and is already integrated.

### React Hook Migration
Modify existing hooks to replace localStorage operations with API calls:
- Remove `localStorage.getItem`/`setItem` from initialization
- Replace state updates with API calls
- Keep the same hook interface (no breaking changes to components)

**Decision**: Keep hook signatures identical to minimize component changes. The migration will be transparent to UI components.

**Alternative considered**: Creating new hooks (e.g., `useFinancialGoalsDB`). Rejected because it would require updating all consuming components unnecessarily.

### Data Migration Strategy
Provide an optional one-time migration script that:
1. Reads data from localStorage
2. Posts to new API endpoints
3. Clears localStorage after successful migration
4. Can be triggered manually by users or run automatically on first visit

**Decision**: Implement as a client-side utility that runs on app initialization, checking if localStorage has data and database is empty, then migrating automatically.

**Alternative considered**: Server-side migration script. Rejected because localStorage is client-side only and can't be accessed from server.

### Authentication Integration
Since this is a Supabase migration, we need user authentication. The application already has Clerk authentication (see `clerk-authentication` spec).

**Decision**: Use Clerk user ID as the `user_id` field in all three tables, ensuring data isolation between users.

**Alternative considered**: Using Supabase Auth. Rejected because Clerk is already implemented and integrated.

## Risks / Trade-offs

### Risk: Data loss during migration
[Mitigation] Migration script will verify successful API writes before clearing localStorage. Add rollback capability to restore from localStorage if migration fails.

### Risk: Performance impact from API calls
[Mitigation] API calls replace localStorage reads/writes. This is slightly slower but acceptable for this data volume (goals: <100, chat: <1000 messages, profile: 1 record). Consider adding optimistic UI updates if needed.

### Risk: Breaking existing functionality
[Mitigation] Keep hook interfaces identical. Add comprehensive tests for the modified hooks. Run migration in staging environment first.

### Trade-off: Increased complexity
Moving from simple localStorage to API+database adds complexity (network errors, loading states, authentication). However, this is necessary for cross-device sync and is consistent with the overall architecture direction.

### Trade-off: Offline functionality
localStorage worked offline. Database requires network. [Mitigation] This is acceptable for a financial application where offline use is limited and data accuracy is prioritized.

## Migration Plan

1. **Database migration**: Run SQL migration to add three new tables in Supabase
2. **API routes**: Implement CRUD endpoints for goals, chat, and profile
3. **Hook updates**: Modify React hooks to use API instead of localStorage
4. **Migration script**: Add client-side migration utility
5. **Testing**: Test all three data flows end-to-end
6. **Deployment**: Deploy to production with migration script enabled

**Rollback strategy**: Keep localStorage fallback code commented out for 1-2 weeks. If issues arise, can quickly revert by switching back to localStorage code.

## Open Questions

- Should we add pagination for chat history if it grows large? (Current design loads all messages, which is fine for <1000 but may need pagination later)
- Should we add soft delete for goals/chat instead of hard delete? (Current design uses hard delete to match existing pattern)
- Should we add timestamps for all CRUD operations on these tables? (Current design only has created_at, may need updated_at)
