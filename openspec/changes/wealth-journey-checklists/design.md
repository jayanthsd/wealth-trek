## Context

WealthTrek has a mature analytics engine (`insightsEngine.ts` + `advancedDimensions.ts`) computing 12 dimensions across growth, leverage, liquidity, efficiency, risk, behavior, inflation audit, gap analysis, debt quality, tax efficiency, trajectory, and protection. These are presented uniformly on the analytics page regardless of the user's wealth stage.

The user sees all dimensions at once — a ₹5L user gets the same diversification analysis as a ₹5Cr user. There is no stage-aware prioritization or guided checklist.

The existing data model captures `NetWorthSnapshot` with full entries, `AdvancedInputs` for optional financial details, and `BalanceSheet` parsed from entries. The `computeAllInsights()` function already returns `InsightResult` with `advancedResults` containing structured outputs from all dimension computations.

A `wealth-percentile-section` change is in progress that will add peer-relative positioning — the journey checklist complements this by adding stage-aware action guidance.

## Goals / Non-Goals

**Goals:**
- Classify users into one of five wealth stages based on net worth
- Present stage-specific checklists where each item evaluates against existing analytics
- Compute a single composite score per stage that summarizes financial readiness
- Show historical progress (checklist completion improving over snapshots)
- Keep the checklist engine as a thin orchestration layer over existing analytics — no duplicate computation

**Non-Goals:**
- No new database tables — checklist results are computed on the fly from existing snapshot data
- No peer comparison / aggregate data collection (future phase)
- No push notifications or email nudges for checklist items
- No gamification mechanics beyond scores (no badges, streaks, leaderboards)
- No changes to the analytics page presentation — the journey page is additive

## Decisions

### D1: Stage Classification — Static Thresholds

**Decision**: Use fixed INR thresholds for stage boundaries.

| Stage | Range | ID |
|---|---|---|
| Foundation | < ₹10,00,000 | `foundation` |
| Stability | ₹10L – ₹25L | `stability` |
| Acceleration | ₹25L – ₹1Cr | `acceleration` |
| Optimization | ₹1Cr – ₹3.5Cr | `optimization` |
| Preservation | ₹3.5Cr – ₹10Cr | `preservation` |

**Rationale**: India-specific thresholds aligned with common financial planning milestones. Static thresholds are simple, predictable, and don't require external data.

**Alternative considered**: Dynamic thresholds based on age/income → rejected because it adds complexity without proportional value at this stage. Can be layered on later.

### D2: Checklist Evaluation — Delegate to Existing Analytics

**Decision**: Each checklist item's `evaluate()` function receives the full `InsightResult` (including `advancedResults`) and reads pre-computed dimension outputs. No new financial computations.

**Rationale**: The insights engine already computes debt quality, protection, gap analysis, tax efficiency, inflation audit, trajectory, and behavioral signals. Duplicating logic creates drift risk. The checklist is a presentation/filtering layer.

**Example delegation chain**:
- "Eliminate high-interest debt" → `advancedResults.debtQuality.credit_card_flag === false`
- "Health insurance adequate" → `advancedResults.protection.health_status === 'adequate'`
- "Basic asset allocation" → `advancedResults.gapAnalysis.gap_count === 0`

### D3: Composite Score — Weighted Per-Stage Formula

**Decision**: Each stage defines a scoring formula as a weighted sum of checklist item pass/partial/fail states.

```
stageScore = Σ (item.weight × item.score) / Σ item.weight × 100
```

Where `item.score` is 0 (todo), 50 (partial), or 100 (done).

Each stage has a distinct score name:
- Foundation → "Financial Stability Score"
- Stability → "Consistency Score"
- Acceleration → "Compounding Rate Score"
- Optimization → "Diversification Score"
- Preservation → "Capital Preservation Score"

**Rationale**: Weighted scoring allows prioritizing critical items (insurance, emergency fund) over nice-to-haves (VPF). The score label changing per stage reinforces the narrative.

### D4: Dedicated Page vs Inline Section

**Decision**: New page at `/dashboard/wealth-journey`.

**Rationale**: The analytics page already displays 12 domain cards and is information-dense. The wealth tracker page will soon have the percentile section. A dedicated page gives room for the stage stepper, checklist, score gauge, and historical progress without overwhelming existing pages. Dashboard hub gets a new navigation card.

### D5: API Route — Compute on Request

**Decision**: Single `GET /api/wealth/journey` endpoint that fetches snapshots, computes insights, classifies stage, evaluates checklist, and returns the full result.

**Rationale**: Stateless computation avoids schema changes and cache invalidation. The computation is lightweight (all in-memory, no external calls). If performance becomes an issue, memoization at the API layer is trivial.

**Response shape**:
```typescript
{
  stage: StageConfig;
  previousStage?: StageConfig; // from second-latest snapshot, for transition detection
  checklist: ChecklistResult[];
  score: { value: number; label: string; };
  stageHistory: { date: string; stage: WealthStage; score: number; }[];
}
```

### D6: AdvancedInputs Extension

**Decision**: Add 3 optional fields to `AdvancedInputs`:

- `monthly_sip_amount?: number` — for SIP percentage checks
- `has_will_created?: boolean` — estate planning flag
- `has_international_funds?: boolean` — international diversification flag

**Rationale**: These are the only missing inputs for checklist evaluation. All other data points are derivable from existing snapshots + advancedInputs. Boolean flags keep the form lightweight.

**Alternative considered**: Adding a full estate planning section → rejected as over-scoped; binary flags suffice for checklist pass/fail.

## Risks / Trade-offs

- **Stage boundary rigidity** → Users near boundaries (e.g., ₹9.8L) may flip between stages with minor fluctuations. Mitigation: Show "approaching next stage" indicator when within 10% of boundary, don't show the previous stage's checklist items disappearing.

- **Checklist items depend on AdvancedInputs being filled** → Many items will show as "not applicable" or "needs more data" if the user hasn't entered advanced inputs. Mitigation: Show a clear prompt to fill advanced inputs, and ensure the checklist is still useful with just snapshot data (at least 3-4 items per stage evaluate from snapshots alone).

- **Score may feel arbitrary** → Weighted scores without transparent methodology can frustrate power users. Mitigation: Show per-item contribution to the score on hover/expand.

- **No server-side persistence of checklist results** → Historical progress is recomputed from all snapshots on each page load. For users with many snapshots this could be slow. Mitigation: The computation is O(n × items) where n = snapshots and items ≈ 7 per stage — acceptable for hundreds of snapshots. Add server-side caching if profiling shows issues.
