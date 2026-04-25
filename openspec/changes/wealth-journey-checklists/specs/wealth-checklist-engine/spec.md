## ADDED Requirements

### Requirement: Define stage-specific checklist items
The system SHALL define checklist items grouped by stage. Each item SHALL have: `id` (unique string), `stage` (WealthStage), `label` (display text), `category` (one of "protection", "growth", "behavior", "tax", "diversification"), and `weight` (numeric importance for score computation). The system SHALL define at minimum 5 items per stage.

#### Scenario: Foundation stage items
- **WHEN** requesting checklist items for "foundation" stage
- **THEN** the system SHALL return items including: emergency fund built, health insurance adequate, term insurance (if dependents), high-interest debt eliminated, SIP started, and savings rate adequate

#### Scenario: Stability stage items
- **WHEN** requesting checklist items for "stability" stage
- **THEN** the system SHALL return items including: emergency fund fully built (6 months), insurance optimized, SIP at 25-30% of income, basic asset allocation started, no credit card rollover, and goal-based investing started

#### Scenario: Acceleration stage items
- **WHEN** requesting checklist items for "acceleration" stage
- **THEN** the system SHALL return items including: equity exposure optimized (65-80%), diversification across fund types, annual rebalancing, tax efficiency (ELSS/80C utilized), no concentration risk, and net worth CAGR tracked

#### Scenario: Optimization stage items
- **WHEN** requesting checklist items for "optimization" stage
- **THEN** the system SHALL return items including: portfolio diversification across asset classes, international diversification, tax optimization strategies, estate planning started, no overexposure to real estate, and risk audit completed

#### Scenario: Preservation stage items
- **WHEN** requesting checklist items for "preservation" stage
- **THEN** the system SHALL return items including: risk-adjusted allocation, advanced diversification (REITs/international), structured tax planning, liquidity planning (2-3 years), estate planning finalized, and professional review flag

### Requirement: Evaluate checklist items from existing analytics
Each checklist item SHALL have an evaluator function that accepts a `ChecklistContext` (containing netWorth, balanceSheet, advancedInputs, insightResult with advancedResults, and snapshots array) and returns a `ChecklistResult` with `status` ("done", "partial", "todo", or "not_applicable"), `score` (0, 50, or 100), `message` (explanation text), and optional `actionHint` (next step suggestion).

#### Scenario: Emergency fund — done
- **WHEN** advancedResults.protection exists and liquid assets cover 6+ months of expenses (derived from monthly_income in advancedInputs)
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: Emergency fund — partial
- **WHEN** liquid assets cover 1-5 months of expenses
- **THEN** the evaluator SHALL return status "partial" with score 50 and actionHint suggesting the target amount

#### Scenario: Emergency fund — no data
- **WHEN** monthly_income is not provided in advancedInputs
- **THEN** the evaluator SHALL return status "not_applicable" with message explaining that monthly income is needed

#### Scenario: High-interest debt — done
- **WHEN** advancedResults.debtQuality exists and credit_card_flag is false and consumptive_pct is below 10
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: High-interest debt — todo
- **WHEN** advancedResults.debtQuality.credit_card_flag is true
- **THEN** the evaluator SHALL return status "todo" with score 0 and actionHint about clearing credit card debt first

#### Scenario: Health insurance — done
- **WHEN** advancedResults.protection exists and health_status is "adequate"
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: Health insurance — not entered
- **WHEN** advancedResults.protection exists and health_status is "not_entered"
- **THEN** the evaluator SHALL return status "not_applicable" with message prompting user to enter health cover in advanced inputs

#### Scenario: Asset allocation — done
- **WHEN** advancedResults.gapAnalysis exists and gap_count is 0
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: Asset allocation — gaps exist
- **WHEN** advancedResults.gapAnalysis exists and gap_count is 2
- **THEN** the evaluator SHALL return status "partial" with score 50 and message referencing the gap count

#### Scenario: Tax efficiency — done
- **WHEN** advancedResults.taxEfficiency exists and grade is "A"
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: Concentration risk — done
- **WHEN** the insights engine's asset concentration insight has severity "info" (no single class > 50%)
- **THEN** the evaluator SHALL return status "done" with score 100

#### Scenario: Concentration risk — failing
- **WHEN** the insights engine's asset concentration insight has severity "critical"
- **THEN** the evaluator SHALL return status "todo" with score 0

### Requirement: Compute composite stage score
The system SHALL compute a composite score for the user's current stage as `Σ(item.weight × item.score) / Σ(item.weight)` where only items with status other than "not_applicable" are included. The score SHALL be a number from 0 to 100. Items with "not_applicable" status SHALL be excluded from both numerator and denominator.

#### Scenario: All items done
- **WHEN** all applicable checklist items for a stage return score 100
- **THEN** the composite score SHALL be 100

#### Scenario: Mixed results
- **WHEN** three items with weight 1 return scores [100, 50, 0] and one item is not_applicable
- **THEN** the composite score SHALL be (100 + 50 + 0) / 3 = 50.0

#### Scenario: All items not applicable
- **WHEN** all checklist items return status "not_applicable"
- **THEN** the composite score SHALL be 0 with a flag indicating insufficient data

### Requirement: Return stage score label
The system SHALL return a stage-specific score label alongside the composite score value: "Financial Stability Score" for foundation, "Consistency Score" for stability, "Compounding Rate Score" for acceleration, "Diversification Score" for optimization, "Capital Preservation Score" for preservation.

#### Scenario: Foundation score label
- **WHEN** user is in foundation stage with composite score 65
- **THEN** the system SHALL return label "Financial Stability Score" with value 65

### Requirement: Compute historical stage progress
The system SHALL accept an array of snapshots and compute the stage classification and composite score for each snapshot, returning an ordered array of `{ date, stage, score }` entries for historical trend visualization.

#### Scenario: Stage progression over time
- **WHEN** 4 snapshots exist with net worths [500000, 800000, 1200000, 1500000]
- **THEN** the system SHALL return 4 entries where the first two are "foundation" stage and the last two are "stability" stage, each with a computed score

#### Scenario: Single snapshot
- **WHEN** only 1 snapshot exists
- **THEN** the system SHALL return an array with 1 entry
