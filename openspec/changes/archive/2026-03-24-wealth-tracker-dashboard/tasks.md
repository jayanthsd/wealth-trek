## 1. Setup & Dependencies

- [x] 1.1 Install Recharts charting library (`npm install recharts`)
- [x] 1.2 Define TypeScript interfaces for `NetWorthSnapshot` and `FinancialGoal` in `app/src/types/index.ts` (or existing types file)

## 2. Dashboard Layout & Hub

- [x] 2.1 Create shared dashboard layout at `app/src/app/dashboard/layout.tsx` with header, back-to-hub navigation, and Clerk auth gate
- [x] 2.2 Create the dashboard hub page at `app/src/app/dashboard/page.tsx` — replace current content with card-based navigation (Wealth Tracker, Net Worth Calculator, Analytics, Chat, Goals) each with icon, description, and link

## 3. Net Worth Calculator (Relocate Existing)

- [x] 3.1 Move the existing dashboard page logic (profile form, document upload, statement management, PDF generation) to `app/src/app/dashboard/calculator/page.tsx`
- [x] 3.2 Add "Save Snapshot" button to the calculator page that persists current net worth data as a `NetWorthSnapshot` to localStorage under `networth-history`
- [x] 3.3 Implement duplicate date detection — prompt user to overwrite if a snapshot with the same as-on date already exists
- [x] 3.4 Enforce 50-snapshot limit with oldest-first eviction

## 4. Net Worth History Hook

- [x] 4.1 Create `app/src/hooks/useNetWorthHistory.ts` hook for reading/writing/deleting snapshots from localStorage (`networth-history` key)

## 5. Wealth Tracker Page

- [x] 5.1 Create `app/src/app/dashboard/wealth-tracker/page.tsx` with a Recharts line chart showing Total Assets, Total Liabilities, and Net Worth trends over time
- [x] 5.2 Add snapshot summary table below the chart (date, assets, liabilities, net worth) sorted most-recent-first
- [x] 5.3 Implement expandable row or detail view to show full line-item breakdown for a snapshot
- [x] 5.4 Add delete snapshot action from the table
- [x] 5.5 Show empty state when no snapshots exist, prompting user to use the calculator

## 6. Analytics Page

- [x] 6.1 Create `app/src/app/dashboard/analytics/page.tsx` with net worth change summary card (absolute and percentage change between two most recent snapshots)
- [x] 6.2 Implement largest asset/liability movement detection between the two most recent snapshots and display as insight cards
- [x] 6.3 Generate actionable suggestion cards (e.g., loan restructuring if liabilities increased, encouragement if 3+ consecutive positive snapshots)
- [x] 6.4 Add asset vs liability breakdown chart (bar or pie) from the latest snapshot using Recharts
- [x] 6.5 Show empty/insufficient-data state when fewer than 2 snapshots exist

## 7. Financial Chat Page

- [x] 7.1 Create API route at `app/src/app/api/chat/route.ts` that proxies messages to OpenAI with financial advisor system prompt and streams responses
- [x] 7.2 Include user's latest net worth snapshot summary in the system prompt for personalized advice
- [x] 7.3 Create `app/src/app/dashboard/chat/page.tsx` with chat UI — message list, input box, send button, streaming response display
- [x] 7.4 Implement "Save as Goal" button on agent messages that suggest goals — saves a `FinancialGoal` to localStorage
- [x] 7.5 Create `app/src/hooks/useChatHistory.ts` hook for persisting chat conversation to localStorage
- [x] 7.6 Add "New Conversation" button to clear current chat and start fresh

## 8. Goals Page

- [x] 8.1 Create `app/src/hooks/useFinancialGoals.ts` hook for CRUD operations on goals in localStorage (`financial-goals` key)
- [x] 8.2 Create `app/src/app/dashboard/goals/page.tsx` displaying all goals with title, description, target amount, target date, and status
- [x] 8.3 Implement goal status management — mark as completed, pause, resume
- [x] 8.4 Add delete goal action
- [x] 8.5 Show empty state suggesting user visit Chat to set goals with the financial advisor

## 9. Home Page Update

- [x] 9.1 Update the home page to reflect wealth tracker branding — update product name, tagline, and features section to highlight Wealth Tracking, Analytics, AI Advisor, and Goal Setting
- [x] 9.2 Update navigation to show "Dashboard" link for authenticated users instead of direct certificate generation link
