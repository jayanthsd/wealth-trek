## 1. Types & Constants

- [x] 1.1 Add `WealthStage`, `StageConfig`, `ChecklistItem`, `ChecklistResult`, `ChecklistContext`, `JourneyResult` types to `src/types/index.ts`
- [x] 1.2 Extend `AdvancedInputs` with optional fields: `monthly_sip_amount`, `has_will_created`, `has_international_funds`

## 2. Wealth Stage Engine

- [x] 2.1 Create `src/lib/wealthStage.ts` with `classifyWealthStage(netWorth)` returning `StageConfig`
- [x] 2.2 Implement `detectStageTransition(currentNW, previousNW)` returning transition info
- [x] 2.3 Implement `computeStageProgress(netWorth)` returning percentage toward next stage
- [x] 2.4 Export `ALL_STAGES` ordered array of all five `StageConfig` objects
- [x] 2.5 Add unit tests for stage classification edge cases (boundaries, negative NW, above max)

## 3. Checklist Engine

- [x] 3.1 Create `src/lib/wealthChecklist.ts` with checklist item definitions for all five stages (~35 items total)
- [x] 3.2 Implement evaluator functions for Foundation stage items (emergency fund, health insurance, term insurance, high-interest debt, SIP started, savings rate)
- [x] 3.3 Implement evaluator functions for Stability stage items (full emergency fund, insurance optimized, SIP ≥25-30%, asset allocation, no credit card rollover, goal-based investing)
- [x] 3.4 Implement evaluator functions for Acceleration stage items (equity exposure, diversification, rebalancing, tax efficiency, concentration risk, CAGR tracked)
- [x] 3.5 Implement evaluator functions for Optimization stage items (multi-asset diversification, international diversification, tax optimization, estate planning, real estate exposure, risk audit)
- [x] 3.6 Implement evaluator functions for Preservation stage items (risk-adjusted allocation, advanced diversification, structured tax planning, liquidity planning, estate finalized, professional review)
- [x] 3.7 Implement `computeStageScore(stage, results)` composite score function with weighted aggregation
- [x] 3.8 Implement `computeStageHistory(snapshots, advancedInputs)` for historical progress tracking
- [x] 3.9 Add unit tests for evaluator functions (done/partial/todo/not_applicable states)

## 4. Insights Engine Modification

- [x] 4.1 Make `advancedResults` non-optional in `InsightResult` type (always present, partial when data is limited)
- [x] 4.2 Update `computeAllInsights()` to always initialize and return `advancedResults` even without advanced inputs

## 5. Advanced Inputs Form Extension

- [x] 5.1 Add `monthly_sip_amount` field to `AdvancedInputsForm` component
- [x] 5.2 Add `has_will_created` boolean toggle to `AdvancedInputsForm` component
- [x] 5.3 Add `has_international_funds` boolean toggle to `AdvancedInputsForm` component

## 6. API Route

- [x] 6.1 Create `src/app/api/wealth/journey/route.ts` with POST handler
- [x] 6.2 Implement Clerk auth guard, snapshot fetch, insight computation, stage classification, checklist evaluation, and score computation
- [x] 6.3 Return structured `JourneyResult` JSON response (stage, previousStage, transitioned, progress, checklist, score, stageHistory)
- [x] 6.4 Handle edge case: no snapshots → return null stage with empty arrays

## 7. Wealth Journey UI Page

- [x] 7.1 Create `src/app/dashboard/wealth-journey/page.tsx` with page layout and data fetching
- [x] 7.2 Implement stage stepper component showing all five stages with current stage highlighted, completed stages filled, and progress bar
- [x] 7.3 Implement checklist card list with done/partial/todo/not_applicable visual states (green check, amber half, red circle, grey lock icons)
- [x] 7.4 Implement composite score gauge display with stage-specific label
- [x] 7.5 Implement historical progress chart (line chart of score over time with stage transition markers)
- [x] 7.6 Implement advanced inputs prompt banner (shown when ≥3 items are "not_applicable")
- [x] 7.7 Implement loading skeleton and empty state (no snapshots)
- [x] 7.8 Add stage transition congratulatory indicator

## 8. Dashboard Integration

- [x] 8.1 Add "Wealth Journey" navigation card to the dashboard hub page with icon and description
