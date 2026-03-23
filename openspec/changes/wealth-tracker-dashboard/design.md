## Context

The application is a Next.js 16 app using Clerk authentication, shadcn/ui components, TailwindCSS, and localStorage for data persistence. Currently, authenticated users land on a single `/dashboard` page that combines user profile, document upload, statement management, net worth computation, and PDF certificate generation into one monolithic page.

The proposal calls for expanding this into a wealth tracker with a card-based dashboard hub routing to five dedicated pages: Wealth Tracker, Net Worth Calculator, Analytics, Chat, and Goals.

**Tech stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, shadcn/ui, Clerk auth, OpenAI SDK, jsPDF, localStorage.

## Goals / Non-Goals

**Goals:**
- Create a card-based dashboard hub at `/dashboard` as the authenticated landing page
- Move the existing certificate generation workflow into `/dashboard/calculator`
- Add new pages for Wealth Tracker, Analytics, Chat, and Goals
- Persist net worth snapshots so historical data is available for trend visualization
- Use the existing OpenAI integration for the financial advisor chat agent
- Keep all data in localStorage (consistent with current architecture)

**Non-Goals:**
- Backend database or server-side persistence (stay with localStorage for now)
- Real payment/subscription integration
- Multi-user data sharing
- Mobile-native app
- Automated document import scheduling

## Decisions

### 1. Route Structure — Nested under `/dashboard`

All authenticated pages live under `/dashboard/*`:
- `/dashboard` — Hub with navigation cards
- `/dashboard/calculator` — Current certificate generation page (moved from `/dashboard`)
- `/dashboard/wealth-tracker` — Trend charts
- `/dashboard/analytics` — Insight cards
- `/dashboard/chat` — Financial advisor agent
- `/dashboard/goals` — Goal list

**Rationale**: Grouping under `/dashboard` allows a shared layout with sidebar/back-navigation and keeps the Clerk middleware config simple (protect `/dashboard(.*)` pattern). Alternatives like top-level routes (`/tracker`, `/analytics`) would scatter protected routes and complicate layout sharing.

### 2. Shared Dashboard Layout

Create `app/src/app/dashboard/layout.tsx` with:
- A header/breadcrumb bar with the app name and a link back to the hub
- Consistent navigation across all dashboard sub-pages
- Clerk auth gate (redirect unauthenticated users)

**Rationale**: Avoids repeating navigation in every page component. The current `Navigation` component is used on public pages too, so the dashboard layout will have its own internal navigation.

### 3. Net Worth History Storage — localStorage with Structured Snapshots

Each time a user completes a net worth calculation (or explicitly saves), a snapshot is stored:

```typescript
interface NetWorthSnapshot {
  id: string;
  date: string;           // ISO date (the as-on date from profile)
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entries: StatementEntry[];  // full line items for drill-down
  createdAt: string;      // ISO timestamp of when snapshot was saved
}
```

Stored in localStorage under key `networth-history` as a JSON array sorted by date.

**Rationale**: Keeps the architecture consistent (localStorage-only). A "Save Snapshot" action on the calculator page triggers persistence. This avoids auto-saving incomplete work. Alternatives: IndexedDB (overkill for current scale), backend DB (out of scope).

### 4. Charting Library — Recharts

Use Recharts for trend visualization in Wealth Tracker and Analytics pages. It's React-native, composable, and works well with shadcn/ui theming.

**Rationale**: Recharts is lightweight, well-maintained, and has good TypeScript support. Alternatives considered: Chart.js (requires wrapper), D3 (too low-level for standard line/bar charts), Nivo (heavier bundle).

### 5. Chat Implementation — OpenAI Streaming with Chat History

The Chat page uses the existing OpenAI SDK (`openai` package already in dependencies) with:
- A system prompt defining the financial advisor persona
- Conversation history maintained in component state
- localStorage persistence of chat sessions
- Goal extraction: when the agent identifies a goal in conversation, it suggests saving it
- API route at `/api/chat` to proxy OpenAI calls (keeps API key server-side)

**Rationale**: OpenAI integration already exists for document extraction. Reuse the same pattern. Streaming provides better UX for longer responses.

### 6. Goals Data Model

```typescript
interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}
```

Stored in localStorage under key `financial-goals`. Goals are created from the Chat page and viewed/managed on the Goals page.

**Rationale**: Simple flat structure. No complex dependency tracking — goals are informational targets that the user tracks manually. The chat agent can suggest goals, but the user confirms before saving.

### 7. Analytics — Computed from Snapshot Diffs

Analytics insights are derived by comparing consecutive net worth snapshots:
- Year-over-year net worth change
- Largest asset/liability movements
- New liabilities detected
- Actionable suggestions (e.g., "Loan X increased liabilities by Y — consider restructuring")

All computation happens client-side from the snapshot history.

**Rationale**: No additional data storage needed. Insights are deterministic computations on existing data. For richer insights, the Chat agent can provide personalized advice.

## Risks / Trade-offs

- **localStorage limits (~5-10MB)** → Mitigation: Snapshots with full line items could grow; implement a cap (e.g., max 50 snapshots) with oldest-first eviction. Show warning when approaching limit.
- **No cross-device sync** → Mitigation: Acceptable for MVP. Future work can add backend sync. Document this limitation clearly to users.
- **OpenAI API costs for Chat** → Mitigation: Rate-limit chat messages per session. Use `gpt-4o-mini` for cost efficiency. Existing API key management applies.
- **Chart rendering performance with large datasets** → Mitigation: Aggregate data points by year/quarter if snapshot count exceeds threshold.
- **Goal tracking is manual** → Mitigation: The chat agent can prompt users to update goals, but automated progress tracking (e.g., "you're 60% to your goal") requires matching goal targets to snapshot data — implement as a stretch enhancement.
