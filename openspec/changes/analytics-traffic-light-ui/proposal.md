## Why

The current analytics page dumps ~17 insight cards, 2 gauge bars, 5 movement rows, and 2 pie charts onto a single screen. Users see a wall of numbers and ratios rather than clear, actionable information. The page needs to shift from "show every metric" to "tell me if I'm okay, and let me dig deeper if I want."

## What Changes

- **Replace the analytics page layout** with a traffic-light health summary showing one verdict per domain (green/amber/red/grey) and an overall health status
- **Add a domain detail view** — clicking a domain row navigates to a focused single-domain deep-dive with plain-English verdict, contextual gauges, actionable advice, and collapsed unavailable items
- **Relocate pie charts and top movements** below the traffic-light summary as a "Composition" section, keeping them accessible but secondary
- **Simplify the InsightCard rendering** — lead with words, support with numbers (metrics become secondary context, not the headline)
- **Hide unavailable insights by default** — collapse locked items into a quiet footer line ("2 metrics need more data") instead of rendering full muted cards

## Capabilities

### New Capabilities

- `analytics-health-summary`: Traffic-light overview page with per-domain health verdict, overall status, and composition section
- `analytics-domain-detail`: Focused single-domain detail view with verdict, metric gauges, actionable advice, and unavailable item footer

### Modified Capabilities

- `analytics`: Existing analytics page requirements are superseded by the new health summary and domain detail views
- `dashboard-hub`: Intelligence Feed on dashboard hub should link to the new health summary page (route unchanged: `/dashboard/analytics`)

## Impact

- **Pages**: `app/src/app/dashboard/analytics/page.tsx` — full rewrite to health summary
- **New route/view**: Domain detail view (either a sub-route like `/dashboard/analytics/[domain]` or client-side state toggle)
- **Components**: `InsightCard` may need a compact variant; new `HealthRow` component for domain rows; new `DomainDetail` component
- **Engine**: `insightsEngine.ts` unchanged — computation stays the same, only presentation changes
- **Dashboard hub**: Minor update to Intelligence Feed link text (already points to `/dashboard/analytics`)
