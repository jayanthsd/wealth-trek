## 1. Health Verdict Helper

- [x] 1.1 Add `computeDomainHealth(items: InsightItem[]): { status, verdict }` helper function in the analytics page file that maps engine output to traffic-light status per domain
- [x] 1.2 Add `computeOverallHealth(domainStatuses): { status, label, attentionCount }` helper that derives overall health from worst domain status

## 2. Health Summary View (Overview)

- [x] 2.1 Replace the current analytics page content with a two-view structure using `selectedDomain` state (null = overview, domain = detail)
- [x] 2.2 Build `OverallHealthBanner` component displaying overall status icon (green checkmark / amber warning / red alert), label text ("All Clear" / "Mostly Healthy" / "Needs Attention"), and attention count
- [x] 2.3 Build `HealthRow` component displaying domain icon, domain name, traffic-light indicator (green/amber/red/grey circle), and short verdict text — clickable to set `selectedDomain`
- [x] 2.4 Render 6 `HealthRow` components in domain order below the `OverallHealthBanner`
- [x] 2.5 Render "Composition" section below health rows containing retained pie charts and top movements list
- [x] 2.6 Handle zero-snapshot state: show empty state directing to Calculator (retain existing behavior)
- [x] 2.7 Handle single-snapshot state: show health rows for available single-snapshot insights with prompt for more data

## 3. Domain Detail View

- [x] 3.1 Build `DomainDetailView` component accepting domain key and insight items, displaying domain name + icon + plain-English verdict header
- [x] 3.2 Render available (non-unavailable) insights as stacked cards with description as primary text and metric value as secondary context
- [x] 3.3 Add contextual gauge bar for ratio-type metrics (values between 0 and 1) showing value relative to warning/critical thresholds
- [x] 3.4 Collapse unavailable insights into a single muted footer line ("N metrics need more data")
- [x] 3.5 Add "← Back to Overview" button that resets `selectedDomain` to null

## 4. Cleanup & Polish

- [x] 4.1 Remove old `SummaryStrip`, `DomainSection`, and `MetricGauge` components from the analytics page (no longer used)
- [x] 4.2 Verify build compiles cleanly with `next build`
- [x] 4.3 Run full test suite to confirm no regressions
- [x] 4.4 Verify dashboard hub Intelligence Feed still renders correctly (no changes needed, just confirm)
