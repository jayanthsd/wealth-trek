## MODIFIED Requirements

### Requirement: Return structured insight result
The system SHALL return all computed insights in an `InsightResult` structure containing insights grouped by domain, a summary object with total/critical/warning counts, an `advancedResults` object containing the structured outputs from all advanced dimension computations (inflationAudit, gapAnalysis, debtQuality, taxEfficiency, trajectory, protection), and a `computedAt` ISO timestamp. The `advancedResults` field SHALL always be present in the return type (not optional) and SHALL contain only the dimensions that could be computed given the available data.

#### Scenario: Full computation
- **WHEN** `computeAllInsights` is called with 5 snapshots and advanced inputs
- **THEN** the result SHALL contain keys for all twelve domains, each with an array of InsightItems, a summary object, and an advancedResults object with all six dimension results populated

#### Scenario: Minimal data (single snapshot)
- **WHEN** only 1 snapshot exists
- **THEN** the engine SHALL still compute single-snapshot metrics (debt-to-asset, concentration, idle cash, asset turnover, and all advanced dimensions possible from a single snapshot) and mark multi-snapshot metrics as unavailable. The advancedResults object SHALL be present with whichever dimensions were computable.

#### Scenario: No advanced inputs
- **WHEN** `computeAllInsights` is called without advancedInputs
- **THEN** the advancedResults object SHALL still be present, with dimensions that don't require advanced inputs (inflationAudit, gapAnalysis partial, debtQuality) populated and others (trajectory, protection requiring income) omitted
