## Context

The analytics page at `/dashboard/analytics` currently renders the full output of `computeAllInsights()` as a flat grid of ~17 InsightCards across 6 collapsible domain sections, plus metric gauges, top movements, and pie charts. User feedback indicates this feels like a wall of numbers rather than clear, actionable information.

The insights engine (`insightsEngine.ts`) and its types are stable and well-tested (50 tests passing). This change is purely presentation-layer — the engine output stays identical, only how it's rendered changes.

Current page structure:
- Summary strip (total/critical/warning counts)
- Metric gauge bars (debt-to-asset, concentration)
- 6 domain sections × ~3 cards each (many locked/unavailable)
- Top movements list
- Asset/liability pie charts

## Goals / Non-Goals

**Goals:**
- Replace the analytics page with a traffic-light health summary that answers "Am I doing okay?" at a glance
- Provide a focused domain detail view when users want to dig deeper into a specific area
- Lead with plain English verdicts, support with numbers as secondary context
- Reduce visual noise from unavailable/locked insights

**Non-Goals:**
- Changing the insights engine computation or types
- Adding new financial metrics or domains
- Modifying the dashboard hub Intelligence Feed (already wired, works fine)
- Adding sub-routes under `/dashboard/analytics/*` (use client-side state instead to keep it simple)

## Decisions

### 1. Client-side view state instead of sub-routes

**Decision:** Use a `selectedDomain: InsightDomain | null` state variable to toggle between the health summary (null) and domain detail view. No new Next.js routes.

**Rationale:** The domain detail is conceptually a drill-down, not a separate page. Client state keeps navigation instant and avoids route-level complexity. A "← Back to Overview" button resets state to null.

**Alternative considered:** `/dashboard/analytics/[domain]` dynamic route — rejected because it adds file-system routing overhead for what is fundamentally a UI toggle, and the data is already loaded.

### 2. Derive per-domain health verdict from engine output

**Decision:** Add a pure helper function `computeDomainHealth(items: InsightItem[]): { status: "healthy" | "warning" | "critical" | "no-data"; verdict: string }` that maps engine output to a single traffic-light status per domain.

Logic:
- If all items are unavailable → `"no-data"`
- If any item has severity `"critical"` → `"critical"` with the most severe item's title as verdict
- If any item has severity `"warning"` → `"warning"` with that item's title as verdict
- Otherwise → `"healthy"` with a positive summary

This lives in the page file as a local helper (not in the engine — it's a presentation concern).

**Alternative considered:** Adding health status to the engine itself — rejected because severity-to-verdict mapping is a UI decision, not a financial computation.

### 3. Overall health status derived from domain statuses

**Decision:** Overall status = worst across all domains (critical > warning > healthy). Display text like "Mostly Healthy — 2 areas need attention" or "All Clear" or "Needs Attention".

### 4. Domain detail layout: verdict → metrics → unavailable footer

**Decision:** When a domain is selected, render:
1. Domain name + icon + overall verdict sentence (plain English)
2. Available insights as stacked cards — each with description text as primary, metric as secondary context, and a contextual gauge if applicable
3. Unavailable items collapsed into a single muted line at the bottom: "2 metrics need more data"

This replaces the current equal-weight grid where locked cards take as much space as real insights.

### 5. Keep pie charts and movements on health summary page

**Decision:** Retain pie charts and top movements below the traffic-light rows as a "Composition" section. They provide valuable visual context and don't add cognitive load when placed below the fold.

**Alternative considered:** Moving them into relevant domain detail views (pie charts into "liquidity" domain, movements into "growth") — rejected because they span multiple domains and are useful as standalone context.

## Risks / Trade-offs

- **Less information upfront** → Users who want to see all metrics at once need more clicks. Mitigated by the domain detail view being one click away and the "Composition" section staying visible.
- **Verdict text quality** → The plain-English verdicts are only as good as the insight descriptions from the engine. Current descriptions are reasonable but could be refined later.
- **No-data domains clutter** → If most domains show "no data" (e.g., single snapshot), the traffic light has many grey rows. Mitigated by keeping them compact (single line each) and showing a clear prompt to add more snapshots.
