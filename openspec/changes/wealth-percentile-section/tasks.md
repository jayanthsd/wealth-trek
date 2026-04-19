## 1. Percentile Engine

- [x] 1.1 Create `src/lib/wealthPercentile.ts` with types (`WealthStage`, `MilestoneStatus`, `WealthPercentileResult`)
- [x] 1.2 Implement `getPercentile(netWorth)` with logarithmic interpolation between ANCHORS, below-lowest scaling, above-highest capping at 99.9, and zero/negative guard
- [x] 1.3 Implement `getWealthStage(percentile)` returning highest stage whose minPercentile ≤ percentile
- [x] 1.4 Implement `getNextMilestone(netWorth)` and `getProgress(netWorth)`
- [x] 1.5 Implement `getInsightMessage(percentile, netWorth)` with formatINR helper (private)
- [x] 1.6 Implement `getWealthPercentileResult(netWorth)` composing all functions into the result object
- [x] 1.7 Add unit tests for the engine in `src/lib/__tests__/wealthPercentile.test.ts`

## 2. API Route

- [x] 2.1 Create `src/app/api/wealth/percentile/route.ts` with GET handler
- [x] 2.2 Authenticate user via `getAuthenticatedClient()`, return 401 if unauthenticated
- [x] 2.3 Query latest snapshot by date for the user, return `{ error: "NO_STATEMENTS" }` if none exist
- [x] 2.4 Call `getWealthPercentileResult(snapshot.net_worth)` and return JSON response

## 3. Frontend Component

- [x] 3.1 Create `src/components/WealthPercentileSection.tsx` with data fetching hook (fetch on mount, refresh support)
- [x] 3.2 Implement loading skeleton state (pulse-animated placeholders for gauge, metrics, stepper)
- [x] 3.3 Implement empty state (NO_STATEMENTS) with icon, message, and CTA link to `/dashboard/snapshot`
- [x] 3.4 Implement SVG semicircle gauge (180° arc, track + fill, color gradient, center percentile label)
- [x] 3.5 Implement info card (ordinal percentile, top X% subtext, stage badge, insight message box)
- [x] 3.6 Implement 2-column metric tiles (formatted net worth, next milestone + distance)
- [x] 3.7 Implement horizontal stage stepper (6 stages, past/active/future visual states)
- [x] 3.8 Implement milestones list (reached/next/future with progress bar for next)
- [x] 3.9 Implement refresh button with spinner (re-fetch without full skeleton)

## 4. Integration

- [x] 4.1 Import and render `<WealthPercentileSection />` in `src/app/dashboard/wealth-tracker/page.tsx` below existing content
