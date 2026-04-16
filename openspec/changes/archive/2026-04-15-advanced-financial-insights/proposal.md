## Why

The current Analytics page (`/dashboard/analytics`) only compares the two most recent snapshots and offers surface-level insights — net worth delta, top movements, and a handful of generic suggestions. Users cannot see *how* their wealth is growing in real terms, whether their leverage is healthy, how liquid or resilient they are, or whether their cash is being deployed efficiently. WealthTrek's promise is to be a financial operating system, not just a scoreboard. Delivering deeper, formula-driven insights turns passive snapshot-takers into informed decision-makers.

## What Changes

- **New computation engine**: A pure-logic module that accepts snapshot history and produces a full suite of financial metrics across six domains — Growth & Real Wealth, Leverage & Debt Drag, Liquidity & Resilience, Efficiency & Cash Utilization, Risk & Scenario Stress, and Behavioral Signals.
- **Redesigned Insights page**: Replace the current basic analytics view with a sectioned, card-based insights dashboard that surfaces computed metrics with contextual explanations, severity indicators, and actionable nudges.
- **Insight severity & classification system**: Each insight is tagged with a category (growth, leverage, liquidity, efficiency, risk, behavior), severity (info / warning / critical), and trend direction — enabling filtering, prioritisation, and future use in notifications.
- **Dashboard hub integration**: The Intelligence Feed on the dashboard hub will pull from the new engine to show the most impactful insights instead of the current simplistic 3-card view.
- **Configurable thresholds**: Key trigger thresholds (e.g., debt-to-asset > 50%, asset concentration > 60%, emergency fund < 3 months) are defined as constants so they can later be made user-configurable.

## Capabilities

### New Capabilities
- `financial-insights-engine`: Pure computation module that takes snapshot history and returns structured insight objects for all six metric domains (growth, leverage, liquidity, efficiency, risk, behavior).
- `insights-dashboard`: Redesigned `/dashboard/analytics` page with sectioned layout, severity-coded insight cards, and metric visualisations for each domain.

### Modified Capabilities
- `analytics`: Existing analytics spec gains new requirements — the page must display the full insight suite instead of only net-worth-change / movements / suggestions. The current top-movements and pie-chart sections remain but are folded into the new layout.
- `dashboard-hub`: The Intelligence Feed section on the dashboard hub must source insights from the new engine when real snapshot data is available.

## Impact

- **Code — new**: `app/src/lib/insightsEngine.ts` (computation), new UI components for insight sections and severity badges.
- **Code — modified**: `app/src/app/dashboard/analytics/page.tsx` (major rewrite), `app/src/app/dashboard/page.tsx` (Intelligence Feed wiring), `app/src/components/ui/InsightCard.tsx` (extend props for severity/category).
- **Types**: New interfaces for `InsightResult`, `InsightItem`, severity enum, category enum in `app/src/types/index.ts`.
- **Dependencies**: No new runtime packages required — all computations are pure math on existing snapshot data. Recharts already available for any new charts.
- **Data model**: No schema changes. All metrics are derived client-side from existing `NetWorthSnapshot[]` data. Some metrics (Interest Coverage, Insurance Gap) will show as unavailable until the data model later adds income/insurance fields — the engine gracefully degrades.
