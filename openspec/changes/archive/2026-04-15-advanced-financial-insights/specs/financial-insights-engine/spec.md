# Financial Insights Engine

## Purpose

This specification defines the requirements for a pure computation module that analyses snapshot history and produces structured financial insights across six domains: Growth & Real Wealth, Leverage & Debt Drag, Liquidity & Resilience, Efficiency & Cash Utilization, Risk & Scenario Stress, and Behavioral Signals.

## ADDED Requirements

### Requirement: Compute nominal net worth delta
The system SHALL compute the nominal net worth change between consecutive snapshots as `NW_t − NW_(t−1)` and return an insight indicating direction and magnitude.

#### Scenario: Positive nominal growth
- **WHEN** the latest snapshot net worth is 5,500,000 and the previous is 5,000,000
- **THEN** the engine SHALL return an insight with title containing "Net Worth Grew", metricValue of 500,000, trend "up", and severity "info"

#### Scenario: Negative nominal change
- **WHEN** the latest snapshot net worth is 4,800,000 and the previous is 5,000,000
- **THEN** the engine SHALL return an insight with metricValue of −200,000, trend "down", and severity "warning"

### Requirement: Compute real net worth delta
The system SHALL compute real net worth change as `Nominal Δ − (CPI_rate × NW_(t−1))` using a configurable annual CPI rate (default 6%) prorated to the period between snapshots, and flag inflation erosion when real delta is negative.

#### Scenario: Inflation erosion detected
- **WHEN** nominal delta is 25,000 over a 1-month period and CPI-adjusted erosion is 25,000 (i.e., 6%/12 × 5,000,000 = 25,000)
- **THEN** the engine SHALL return an insight with severity "warning" and description indicating wealth did not grow in real terms

#### Scenario: Real growth positive
- **WHEN** nominal delta exceeds the CPI-adjusted erosion amount
- **THEN** the engine SHALL return an insight with severity "info" and trend "up"

### Requirement: Compute net worth CAGR
The system SHALL compute the compound annual growth rate over the full snapshot history as `((NW_latest / NW_earliest) ^ (12 / N_months)) − 1` when at least 2 snapshots spanning 2+ months exist.

#### Scenario: CAGR with sufficient history
- **WHEN** the earliest snapshot (12 months ago) has net worth 4,000,000 and the latest has 4,800,000
- **THEN** the engine SHALL return an insight with metricValue approximately 0.20 (20% CAGR) and severity "info"

#### Scenario: Insufficient history for CAGR
- **WHEN** all snapshots fall within the same calendar month
- **THEN** the engine SHALL return the insight with unavailable set to true

### Requirement: Compute asset growth rate per class
The system SHALL compute percentage change per asset class between the two most recent snapshots and flag underperformers (classes with negative or zero growth when overall assets grew).

#### Scenario: Underperforming asset class
- **WHEN** total assets grew 5% but "Fixed Deposit" class value decreased by 2%
- **THEN** the engine SHALL return an insight with severity "warning" identifying "Fixed Deposit" as an underperformer

#### Scenario: All classes growing
- **WHEN** every asset class shows positive growth
- **THEN** the engine SHALL return an insight with severity "info" summarising growth rates

### Requirement: Compute debt-to-asset ratio
The system SHALL compute `Total Liabilities / Total Assets` from the latest snapshot and trigger warnings at configurable thresholds (default: warning at 40%, critical at 50%).

#### Scenario: Ratio exceeds critical threshold
- **WHEN** total liabilities are 600,000 and total assets are 1,000,000 (ratio 60%)
- **THEN** the engine SHALL return an insight with severity "critical" and metricValue 0.6

#### Scenario: Ratio within healthy range
- **WHEN** total liabilities are 200,000 and total assets are 1,000,000 (ratio 20%)
- **THEN** the engine SHALL return an insight with severity "info" and metricValue 0.2

### Requirement: Compute debt-to-net-worth ratio
The system SHALL compute `Total Liabilities / Net Worth` from the latest snapshot. When net worth is zero or negative, the system SHALL return severity "critical".

#### Scenario: High debt-to-net-worth
- **WHEN** liabilities are 800,000 and net worth is 200,000 (ratio 4.0)
- **THEN** the engine SHALL return an insight with severity "critical" and metricValue 4.0

#### Scenario: Negative net worth
- **WHEN** net worth is negative
- **THEN** the engine SHALL return an insight with severity "critical" and description indicating liabilities exceed assets

### Requirement: Compute interest coverage proxy
The system SHALL mark the interest coverage proxy insight as unavailable with reason "Requires income and interest rate data" until those fields are added to the data model.

#### Scenario: Data not available
- **WHEN** the snapshot data does not include income or interest rate fields
- **THEN** the engine SHALL return an insight with unavailable set to true and unavailableReason explaining the missing data

### Requirement: Compute debt drag
The system SHALL mark the debt drag insight as unavailable with reason "Requires average liability rate and asset yield data" until rate fields are added to the data model.

#### Scenario: Data not available
- **WHEN** the snapshot data does not include rate-of-return or interest-rate fields
- **THEN** the engine SHALL return an insight with unavailable set to true

### Requirement: Compute liquid coverage ratio
The system SHALL compute `Liquid Assets / Short-term Liabilities` where liquid assets are entries matching configurable liquid statement types (default: "Savings Bank Account", "Fixed Deposit") and short-term liabilities are entries matching configurable short-term liability types (default: "Credit Card Outstanding", "Personal Loan"). The system SHALL flag when the ratio is below 1.

#### Scenario: Low liquidity
- **WHEN** liquid assets total 100,000 and short-term liabilities total 150,000 (ratio 0.67)
- **THEN** the engine SHALL return an insight with severity "critical" and metricValue approximately 0.67

#### Scenario: Healthy liquidity
- **WHEN** liquid assets total 500,000 and short-term liabilities total 100,000 (ratio 5.0)
- **THEN** the engine SHALL return an insight with severity "info" and metricValue 5.0

### Requirement: Compute emergency fund months
The system SHALL mark the emergency fund months insight as unavailable with reason "Requires monthly expense data" until expense tracking is added. When unavailable, the description SHALL suggest the user can estimate this by dividing liquid assets by their monthly expenses.

#### Scenario: Data not available
- **WHEN** no monthly expense data exists
- **THEN** the engine SHALL return an insight with unavailable set to true and a helpful description

### Requirement: Compute asset concentration
The system SHALL compute `max(assetClass%) / totalAssets` and flag when any single asset class exceeds configurable thresholds (default: warning at 50%, critical at 60%).

#### Scenario: Over-concentrated portfolio
- **WHEN** "Real Estate" represents 70% of total assets
- **THEN** the engine SHALL return an insight with severity "critical", identifying "Real Estate" as the concentrated class

#### Scenario: Well-diversified portfolio
- **WHEN** no single asset class exceeds 50% of total assets
- **THEN** the engine SHALL return an insight with severity "info"

### Requirement: Compute idle cash share
The system SHALL compute `(Cash + Low-yield deposits) / Total Assets` where cash/low-yield types are configurable (default: "Savings Bank Account"). The system SHALL suggest redeployment when the ratio exceeds a configurable threshold (default: 15%).

#### Scenario: High idle cash
- **WHEN** savings bank accounts total 800,000 out of 2,000,000 total assets (40%)
- **THEN** the engine SHALL return an insight with severity "warning" suggesting redeployment of idle funds

#### Scenario: Acceptable cash level
- **WHEN** savings bank accounts total 200,000 out of 2,000,000 total assets (10%)
- **THEN** the engine SHALL return an insight with severity "info"

### Requirement: Compute asset turnover proxy
The system SHALL compute the ratio of income-producing asset types (configurable, default: "Mutual Fund", "Stock Holdings", "Fixed Deposit") to total assets and flag when the ratio is low (below configurable threshold, default: 30%).

#### Scenario: Low productive asset ratio
- **WHEN** income-producing assets total 200,000 out of 2,000,000 total assets (10%)
- **THEN** the engine SHALL return an insight with severity "warning" hinting at inactive wealth

#### Scenario: Healthy productive asset ratio
- **WHEN** income-producing assets total 1,200,000 out of 2,000,000 total assets (60%)
- **THEN** the engine SHALL return an insight with severity "info"

### Requirement: Compute loan-to-value per secured asset
The system SHALL mark the LTV insight as unavailable with reason "Requires loan-to-asset mapping data" until secured-asset linking is added to the data model.

#### Scenario: Data not available
- **WHEN** no loan-to-asset mapping exists
- **THEN** the engine SHALL return an insight with unavailable set to true

### Requirement: Compute insurance gap
The system SHALL mark the insurance gap insight as unavailable with reason "Requires insurance coverage data" until insurance fields are added.

#### Scenario: Data not available
- **WHEN** no insurance data exists
- **THEN** the engine SHALL return an insight with unavailable set to true

### Requirement: Detect snapshot staleness
The system SHALL compute the number of days since the most recent snapshot and trigger a reminder insight when the gap exceeds a configurable threshold (default: 45 days).

#### Scenario: Stale data
- **WHEN** the latest snapshot is 60 days old
- **THEN** the engine SHALL return an insight with severity "warning" and description prompting the user to update their data

#### Scenario: Fresh data
- **WHEN** the latest snapshot is 10 days old
- **THEN** the engine SHALL return an insight with severity "info"

### Requirement: Detect savings consistency
The system SHALL compute the standard deviation of month-over-month net worth additions across all snapshots (minimum 3 required). High volatility (coefficient of variation > 0.5) SHALL trigger a discipline insight.

#### Scenario: High volatility
- **WHEN** monthly net worth changes are [+50000, −20000, +80000, −10000] (CV > 0.5)
- **THEN** the engine SHALL return an insight with severity "warning" about inconsistent savings patterns

#### Scenario: Consistent savings
- **WHEN** monthly net worth changes are [+30000, +28000, +32000, +31000] (CV < 0.5)
- **THEN** the engine SHALL return an insight with severity "info" commending discipline

#### Scenario: Insufficient data
- **WHEN** fewer than 3 snapshots exist
- **THEN** the engine SHALL return the insight with unavailable set to true

### Requirement: Return structured insight result
The system SHALL return all computed insights in an `InsightResult` structure containing insights grouped by domain, a summary object with total/critical/warning counts, and a `computedAt` ISO timestamp.

#### Scenario: Full computation
- **WHEN** `computeAllInsights` is called with 5 snapshots
- **THEN** the result SHALL contain keys for all six domains, each with an array of InsightItems, and a summary object

#### Scenario: Minimal data (single snapshot)
- **WHEN** only 1 snapshot exists
- **THEN** the engine SHALL still compute single-snapshot metrics (debt-to-asset, concentration, idle cash, asset turnover) and mark multi-snapshot metrics as unavailable
