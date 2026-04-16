## Context

The current analytics page (`app/src/app/dashboard/analytics/page.tsx`) computes insights inline — comparing only the two most recent snapshots to produce net-worth change, top movements, basic suggestions, and pie breakdowns. All logic is co-located in the page component. The dashboard hub (`app/src/app/dashboard/page.tsx`) has a hardcoded `InsightData[]` with three simplistic cards.

The data model stores `NetWorthSnapshot[]` where each snapshot contains `StatementEntry[]` with `statementType`, `category` (asset | liability), `closingBalance`, and `ownershipPercentage`. No income, expense, interest-rate, or insurance fields exist today.

The user's request introduces six metric domains with ~20 distinct computations. This design must accommodate metrics that are fully computable today (most of them) and gracefully handle metrics that depend on data not yet in the model (interest rates, insurance amounts, income).

## Goals / Non-Goals

**Goals:**
- Extract all financial insight logic into a single, testable, pure-function module (`insightsEngine.ts`) that takes `NetWorthSnapshot[]` and returns structured results.
- Define a clear `InsightItem` interface with category, severity, trend, metric value, and human-readable explanation so the UI layer is decoupled from computation.
- Redesign the analytics page into a sectioned dashboard that groups insights by domain.
- Wire the dashboard hub's Intelligence Feed to the same engine.
- Make threshold constants explicit and centralized for future configurability.

**Non-Goals:**
- Adding new data-entry fields (income, interest rates, insurance) to the data model — that is a separate change. The engine will mark metrics as `unavailable` when input data is missing.
- Real-time or server-side computation — all insights are computed client-side from the fetched snapshot array.
- Notification / push-alert infrastructure — insights are displayed on-page only.
- CPI data integration — real CPI requires an external API. For now the engine accepts an optional CPI rate parameter (default 6% annual) as a constant.

## Decisions

### D1: Pure computation module (`insightsEngine.ts`) separated from UI

**Decision**: All metric computations live in `app/src/lib/insightsEngine.ts` as pure functions. The module exports a single entry point `computeAllInsights(snapshots, config?)` that returns `InsightResult`.

**Rationale**: The current analytics page mixes computation with rendering. Separating them enables unit testing of every formula, reuse from both the analytics page and dashboard hub, and future use in PDF reports or AI advisor context.

**Alternative considered**: Compute inside a custom hook (`useInsights`). Rejected because a hook couples to React lifecycle; a pure function is more portable and testable.

### D2: Insight data structure

**Decision**: Each insight is an `InsightItem`:
```ts
interface InsightItem {
  id: string;                       // e.g., "growth.nominal-delta"
  domain: InsightDomain;            // "growth" | "leverage" | "liquidity" | "efficiency" | "risk" | "behavior"
  title: string;                    // Human-readable heading
  description: string;              // Contextual explanation with numbers
  severity: "info" | "warning" | "critical";
  trend: "up" | "down" | "neutral";
  metricValue?: number;             // Raw numeric value for display/sorting
  metricLabel?: string;             // e.g., "Debt-to-Asset Ratio"
  unavailable?: boolean;            // True when required data fields are missing
  unavailableReason?: string;       // e.g., "Requires income data"
}
```

The top-level return is:
```ts
interface InsightResult {
  domains: Record<InsightDomain, InsightItem[]>;
  summary: { total: number; critical: number; warnings: number };
  computedAt: string;               // ISO timestamp
}
```

**Rationale**: Flat list per domain is simple to render in sections. Severity enables sorting/filtering. `unavailable` flag lets the UI show "unlock this insight by adding X data" prompts, turning missing data into engagement.

### D3: Threshold constants as a config object

**Decision**: All trigger thresholds are defined in a `INSIGHT_THRESHOLDS` constant object in the engine module:
```ts
const INSIGHT_THRESHOLDS = {
  debtToAssetWarning: 0.4,
  debtToAssetCritical: 0.5,
  concentrationWarning: 0.5,
  concentrationCritical: 0.6,
  emergencyFundWarning: 3,   // months
  emergencyFundCritical: 1,
  idleCashThreshold: 0.15,
  snapshotStalenessDays: 45,
  assumedAnnualCPI: 0.06,
  liquidTypes: ["Savings Bank Account", "Fixed Deposit"],
  // ... etc
};
```

**Rationale**: Centralised constants are easy to find, test against, and later promote to user-configurable settings stored in profile/localStorage.

### D4: Graceful degradation for missing data

**Decision**: Metrics requiring data not in the current model (Interest Coverage Proxy, Insurance Gap, LTV per secured asset) return `InsightItem` with `unavailable: true`. The UI renders these as muted cards with a CTA to add the relevant data when that feature ships.

**Rationale**: Showing the *possibility* of richer analysis educates users and creates demand for future features without blocking this change.

### D5: Reuse existing InsightCard with extended props

**Decision**: Extend `InsightCard` component to accept optional `severity`, `domain`, and `unavailable` props. The existing `trend` prop remains. New styling is additive — severity maps to border/icon color, domain maps to a small badge.

**Alternative considered**: Create an entirely new component. Rejected to avoid duplication; the existing card's animation and layout are already correct.

### D6: Analytics page layout — domain sections with collapsible groups

**Decision**: The redesigned analytics page renders one section per domain. Each section has a header (icon + domain name), a grid of InsightCards, and is collapsible. A top summary strip shows total insights count and critical/warning counts.

**Rationale**: Six domains could produce 15-20 insights. Sectioned + collapsible keeps the page scannable. Users can focus on the domain they care about.

### D7: Dashboard hub Intelligence Feed — top N by severity

**Decision**: The dashboard hub's Intelligence Feed shows up to 4 insights, selected by highest severity first, then by absolute metric magnitude. It calls the same `computeAllInsights` and picks the top items.

**Rationale**: The hub is a summary view; it should surface the most urgent items. The "See all insights" link navigates to the full analytics page.

## Risks / Trade-offs

- **Performance with many snapshots**: Computing all metrics client-side for 50+ snapshots involves O(S × E) iteration where S = snapshots, E = entries. For typical users (< 50 snapshots, < 30 entries each) this is negligible. → Mitigation: memoize with `useMemo`; if perf issues arise, add a web worker later.
- **CPI assumption is static**: Using a fixed 6% CPI is a simplification. → Mitigation: Make it a config constant; document it in the UI ("assumes 6% annual inflation"). Future change can fetch RBI CPI data.
- **Statement type classification for liquidity**: Determining which asset types are "liquid" relies on matching `statementType` strings against a hardcoded list. → Mitigation: Use the existing `STATEMENT_TYPE_PRESETS` labels as the classification source. Document the mapping.
- **Unavailable metrics may confuse users**: Showing greyed-out cards for metrics that can't be computed yet. → Mitigation: Clear copy explaining what data is needed and that the feature is coming.
