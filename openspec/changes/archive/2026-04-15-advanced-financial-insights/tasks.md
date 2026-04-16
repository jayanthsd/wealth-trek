## 1. Types & Constants

- [x] 1.1 Add `InsightDomain`, `InsightSeverity`, `InsightItem`, and `InsightResult` interfaces/types to `app/src/types/index.ts`
- [x] 1.2 Define `INSIGHT_THRESHOLDS` constant object in `app/src/lib/insightsEngine.ts` with all configurable thresholds (debt-to-asset bands, concentration bands, emergency fund months, idle cash %, CPI rate, staleness days, liquid types, short-term liability types, income-producing types, savings consistency CV threshold)

## 2. Insights Engine — Growth & Real Wealth Domain

- [x] 2.1 Implement `computeNominalDelta(latest, previous)` returning `InsightItem` with direction, magnitude, and severity
- [x] 2.2 Implement `computeRealDelta(latest, previous, config)` returning `InsightItem` accounting for CPI-adjusted erosion prorated to the period between snapshots
- [x] 2.3 Implement `computeNetWorthCAGR(snapshots)` returning `InsightItem` with CAGR value or unavailable when span < 2 months
- [x] 2.4 Implement `computeAssetGrowthPerClass(latest, previous)` returning `InsightItem[]` flagging underperformers

## 3. Insights Engine — Leverage & Debt Drag Domain

- [x] 3.1 Implement `computeDebtToAssetRatio(snapshot, config)` returning `InsightItem` with severity based on threshold bands
- [x] 3.2 Implement `computeDebtToNetWorthRatio(snapshot)` returning `InsightItem` with critical severity for zero/negative net worth
- [x] 3.3 Implement `computeInterestCoverageProxy()` returning unavailable `InsightItem` stub with reason
- [x] 3.4 Implement `computeDebtDrag()` returning unavailable `InsightItem` stub with reason

## 4. Insights Engine — Liquidity & Resilience Domain

- [x] 4.1 Implement `computeLiquidCoverageRatio(snapshot, config)` returning `InsightItem` flagging ratio < 1
- [x] 4.2 Implement `computeEmergencyFundMonths()` returning unavailable `InsightItem` stub with helpful description
- [x] 4.3 Implement `computeAssetConcentration(snapshot, config)` returning `InsightItem` identifying the most concentrated class

## 5. Insights Engine — Efficiency & Cash Utilization Domain

- [x] 5.1 Implement `computeIdleCashShare(snapshot, config)` returning `InsightItem` suggesting redeployment above threshold
- [x] 5.2 Implement `computeAssetTurnoverProxy(snapshot, config)` returning `InsightItem` flagging low productive-asset ratio

## 6. Insights Engine — Risk & Scenario Stress Domain

- [x] 6.1 Implement `computeLoanToValue()` returning unavailable `InsightItem` stub with reason
- [x] 6.2 Implement `computeInsuranceGap()` returning unavailable `InsightItem` stub with reason

## 7. Insights Engine — Behavioral Signals Domain

- [x] 7.1 Implement `computeSnapshotStaleness(snapshots, config)` returning `InsightItem` with reminder when latest snapshot exceeds staleness threshold
- [x] 7.2 Implement `computeSavingsConsistency(snapshots, config)` returning `InsightItem` based on coefficient of variation of monthly net additions (min 3 snapshots)

## 8. Insights Engine — Orchestrator

- [x] 8.1 Implement `computeAllInsights(snapshots, config?)` that calls all domain functions, groups results into `InsightResult` with domain map and summary counts, and handles edge cases (0 or 1 snapshot)
- [x] 8.2 Write unit tests for `computeAllInsights` covering: 5-snapshot happy path, single-snapshot partial results, negative net worth, zero assets, empty entries array

## 9. InsightCard Component Extension

- [x] 9.1 Extend `InsightCard` props to accept optional `severity` (`info` | `warning` | `critical`), `domain` (InsightDomain), `metricValue`, `metricLabel`, and `unavailable` fields
- [x] 9.2 Add severity-based styling: red border/icon for critical, amber for warning, primary for info
- [x] 9.3 Add unavailable state rendering: muted card with lock icon, unavailableReason text, and CTA prompt
- [x] 9.4 Add optional metricValue display (formatted number with label) inline within the card

## 10. Insights Dashboard Page (Analytics Rewrite)

- [x] 10.1 Refactor `app/src/app/dashboard/analytics/page.tsx` to call `computeAllInsights` and render the `InsightResult`
- [x] 10.2 Build summary strip component showing total/critical/warning counts at page top
- [x] 10.3 Build collapsible domain section component with icon, heading, and toggle animation
- [x] 10.4 Render six domain sections each containing a grid of InsightCards from the engine output
- [x] 10.5 Integrate existing top-movements list and pie-chart breakdowns as retained sections within the new layout
- [x] 10.6 Handle single-snapshot state: show available single-snapshot insights and prompt for more data
- [x] 10.7 Handle zero-snapshot state: show empty state directing to Net Worth Calculator
- [x] 10.8 Add inline metric visualisations (gauge/progress bar for ratios, proportional bar for concentration) within domain sections

## 11. Dashboard Hub Intelligence Feed Update

- [x] 11.1 Update `app/src/app/dashboard/page.tsx` to call `computeAllInsights` when snapshots are available and select top 4 insights by severity then magnitude
- [x] 11.2 Pass severity prop to InsightCards in the Intelligence Feed for color-coded rendering
- [x] 11.3 Add "View all insights →" link below the Intelligence Feed that navigates to `/dashboard/analytics`
- [x] 11.4 Retain sample insight fallback with Simulation Mode badge when < 2 snapshots

## 12. Integration Testing & Polish

- [x] 12.1 Verify analytics page renders correctly with 0, 1, 2, and 5+ snapshots
- [x] 12.2 Verify dashboard hub Intelligence Feed shows engine-sourced insights with real data and sample fallback
- [x] 12.3 Verify all unavailable insights render with muted styling and correct reason text
- [x] 12.4 Verify collapsible sections expand/collapse with smooth animation
- [x] 12.5 Verify responsive layout on mobile (single column) and desktop (grid)
