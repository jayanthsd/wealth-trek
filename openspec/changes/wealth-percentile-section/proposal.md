## Why

Users can track their net worth over time but have no context for how they compare to peers. Adding India-specific wealth percentile positioning turns raw numbers into motivational insight, increasing engagement and perceived value.

## What Changes

- New `src/lib/wealthPercentile.ts` engine: logarithmic interpolation against India wealth distribution anchors, milestone tracking, stage classification, and insight generation
- New `GET /api/wealth/percentile` route: authenticates user, fetches latest snapshot net worth, returns full percentile result
- New `<WealthPercentileSection />` component: self-contained section with loading skeleton, empty state, gauge, stage stepper, and milestones list
- Integration into the existing Wealth Tracker page (`/dashboard/wealth-tracker`) below the net worth trend chart

## Capabilities

### New Capabilities
- `wealth-percentile-engine`: Logarithmic percentile interpolation, wealth stage classification, milestone tracking, and insight message generation for India wealth distribution
- `wealth-percentile-ui`: Self-fetching frontend section with SVG gauge, stage stepper, milestone list, loading/empty states, and refresh capability

### Modified Capabilities
- `wealth-tracker`: Add the `<WealthPercentileSection />` below the existing trend chart and snapshot history (layout addition only — no existing behavior changes)

## Impact

- **New files**: `src/lib/wealthPercentile.ts`, `src/app/api/wealth/percentile/route.ts`, `src/components/WealthPercentileSection.tsx`
- **Modified file**: `src/app/dashboard/wealth-tracker/page.tsx` (import + render new section)
- **API**: New route `/api/wealth/percentile` using existing auth + snapshots table
- **Dependencies**: No new packages — uses existing Recharts, Lucide, Tailwind, Clerk, Supabase
