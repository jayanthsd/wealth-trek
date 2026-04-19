## Context

The app tracks users' net worth via snapshots stored in Supabase (`snapshots` table with `net_worth` column). Users authenticate via Clerk. Data fetching uses plain `fetch` in custom React hooks (`useEffect` + state). The Wealth Tracker page at `/dashboard/wealth-tracker` displays trend charts and a snapshot history table.

We're adding a percentile engine + UI section that contextualizes a user's net worth against India's wealth distribution. The data source is the latest stored snapshot — no new data entry or re-computation is required.

## Goals / Non-Goals

**Goals:**
- Pure TypeScript percentile engine with logarithmic interpolation (no external stats library)
- Single API route matching existing auth/db patterns
- Self-contained React component that manages its own data lifecycle
- Smooth loading, empty, and data states

**Non-Goals:**
- Real-time updating or polling
- User-editable percentile parameters
- Age/city/profession segmentation (future)
- Mobile app integration in this change

## Decisions

### 1. Logarithmic interpolation over linear

Wealth distributions are log-normal. Linear interpolation between anchors would vastly overestimate percentiles at lower ranges. Log interpolation (`t = (log(nw) - log(nw1)) / (log(nw2) - log(nw1))`) correctly models the exponential spacing.

### 2. Latest snapshot as net worth source

The `snapshots` table already stores computed `net_worth`. Rather than re-aggregating entries on every request, we query the most recent snapshot ordered by date. This is fast (single row fetch) and consistent with what the user sees on the Wealth Tracker chart.

Alternative considered: Summing entries from the `statements` table live — rejected because the snapshot is the user's confirmed, dated computation.

### 3. Dedicated API route (`/api/wealth/percentile`)

Matches the existing route pattern (`/api/snapshots`, `/api/goals`, `/api/documents`). A dedicated route keeps concerns separated and allows the component to fetch independently without prop-drilling from a parent page.

### 4. Custom hook with fetch (no React Query)

The project doesn't use React Query or SWR. All hooks use `useState` + `useEffect` + `fetch`. We'll follow the same pattern with a `useWealthPercentile` hook (or inline fetch in the component).

### 5. SVG gauge rendered inline

No charting library needed for the semicircle gauge. A simple `<svg>` with two `<path>` arcs (track + fill) is lightweight and fully customizable. Recharts is only used for the existing line charts.

## Risks / Trade-offs

- **Stale data** → Percentile reflects the latest snapshot date. If user hasn't taken a snapshot recently, the section shows a "last updated" date. Mitigation: subtitle shows snapshot date; refresh button re-fetches (but won't create new snapshot).
- **Hardcoded anchors** → India wealth distribution anchors are static. If data changes, we update the constant array. Mitigation: anchors are isolated in a single config block for easy updates.
- **No snapshot = no percentile** → Users who haven't created any snapshot see an empty state prompting them to the snapshot page. This is intentional — we don't guess.
