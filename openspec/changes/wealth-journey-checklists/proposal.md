## Why

Users can see their net worth and analytics dimensions but lack a stage-aware, actionable roadmap that tells them "given where you are right now, here's what matters most." The existing 12-dimension analytics engine computes deep metrics, but presents them uniformly regardless of whether the user has ₹5L or ₹5Cr. Adding net-worth-tiered checklists with composite scores turns raw analytics into a guided wealth journey — increasing engagement, clarity, and perceived value.

## What Changes

- New **wealth stage classification** engine that maps net worth to one of five stages (Foundation < ₹10L, Stability ₹10L–₹25L, Acceleration ₹25L–₹1Cr, Optimization ₹1Cr–₹3.5Cr, Preservation ₹3.5Cr–₹10Cr)
- New **checklist evaluation** engine with ~35 stage-specific checklist items, each backed by existing analytics computations (debt quality, protection, gap analysis, tax efficiency, inflation audit, trajectory, behavioral signals)
- New **composite stage scores** (Financial Stability Score, Consistency Score, Compounding Rate, Diversification Score, Capital Preservation Score) computed as weighted aggregations of checklist results
- New **Wealth Journey page** (`/dashboard/wealth-journey`) with stage visualization, interactive checklist, composite score display, and historical progress tracking
- Extended `AdvancedInputs` with optional fields for SIP amount, estate planning flags, and international diversification flag to support checklist evaluation
- New API route `GET /api/wealth/journey` that returns stage, checklist results, and scores for the authenticated user

## Capabilities

### New Capabilities
- `wealth-stage-engine`: Net worth to wealth stage classification, stage configuration (thresholds, labels, colors, mindset), and stage transition detection across snapshots
- `wealth-checklist-engine`: Stage-specific checklist item definitions, evaluator functions that delegate to existing analytics dimensions, and composite score computation per stage
- `wealth-journey-ui`: Dedicated wealth journey page with stage stepper, checklist cards with pass/partial/todo states, composite score gauge, and historical progress view
- `wealth-journey-api`: API route returning stage classification, evaluated checklist results, and composite scores for the authenticated user's latest snapshot

### Modified Capabilities
- `financial-insights-engine`: Expose individual dimension results (debt quality, protection, gap analysis, tax efficiency, inflation audit, trajectory) in a structured format consumable by the checklist evaluator

## Impact

- **New files**: `src/lib/wealthStage.ts`, `src/lib/wealthChecklist.ts`, `src/app/api/wealth/journey/route.ts`, `src/components/WealthJourneySection.tsx`, `src/app/dashboard/wealth-journey/page.tsx`
- **Modified files**: `src/types/index.ts` (new types + AdvancedInputs extension), `src/lib/insightsEngine.ts` (structured result exposure), `src/components/AdvancedInputsForm.tsx` (new optional fields), `src/app/dashboard/page.tsx` (nav card for wealth journey)
- **API**: New `GET /api/wealth/journey` using existing auth + snapshots infrastructure
- **Dependencies**: No new packages — uses existing Recharts, Lucide, Tailwind, Framer Motion, Clerk
