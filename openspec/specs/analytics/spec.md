# Analytics

## Purpose

This specification defines the requirements for the Analytics page that provides insights and analysis of net worth trends and financial movements.

## Requirements

### Requirement: Display net worth change summary
The system SHALL display the net worth change on the Analytics page at `/dashboard/analytics` as part of a broader insights dashboard. The summary strip SHALL show nominal change, percentage change, and real (inflation-adjusted) change sourced from the financial insights engine.

#### Scenario: Positive net worth growth
- **WHEN** the latest snapshot shows net worth of 1,000,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a summary card showing "+₹2,00,000 (+25%)" with a positive indicator, plus a real-growth annotation accounting for assumed CPI

#### Scenario: Negative net worth change
- **WHEN** the latest snapshot shows net worth of 700,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a summary card showing "−₹1,00,000 (−12.5%)" with a negative indicator

#### Scenario: Insufficient data
- **WHEN** user has fewer than 2 snapshots
- **THEN** the system SHALL display single-snapshot insights (debt-to-asset, concentration, idle cash, asset turnover) and prompt the user to add more snapshots for the full insight suite

### Requirement: Identify largest asset and liability movements
The system SHALL identify and display the largest changes in individual asset and liability categories between the two most recent snapshots.

#### Scenario: New liability detected
- **WHEN** the latest snapshot contains a "Home Loan" entry that did not exist in the previous snapshot
- **THEN** the system SHALL display an insight card: "New liability detected: Home Loan of ₹X"

#### Scenario: Significant asset growth
- **WHEN** a "Mutual Fund" entry increased by more than 20% between snapshots
- **THEN** the system SHALL display an insight card highlighting the growth

### Requirement: Provide actionable suggestions
The system SHALL generate actionable suggestions based on the full financial insights engine output, replacing the previous hardcoded suggestion logic. Suggestions SHALL be derived from warning and critical severity insights across all six domains.

#### Scenario: Loan restructuring suggestion
- **WHEN** the debt-to-asset ratio exceeds the critical threshold (default 50%)
- **THEN** the system SHALL display a critical-severity insight with a suggestion to review debt structure

#### Scenario: Positive trend encouragement
- **WHEN** net worth CAGR is positive and savings consistency is high
- **THEN** the system SHALL display info-severity insights acknowledging the positive trajectory

#### Scenario: Multiple domain warnings
- **WHEN** the engine produces warnings across leverage, liquidity, and efficiency domains
- **THEN** the system SHALL display all warnings grouped by domain section with individual explanations

### Requirement: Display asset vs liability breakdown chart
The system SHALL display pie charts showing the composition of assets and liabilities in a "Composition" section below the health summary rows on the main analytics page.

#### Scenario: Asset breakdown chart
- **WHEN** user views the Analytics page with snapshot data
- **THEN** the system SHALL display a pie chart showing the proportion of each asset type in total assets within the Composition section below the health summary

### Requirement: Display insights grouped by financial domain
The system SHALL display computed insights from the financial insights engine grouped into six collapsible domain sections: Growth & Real Wealth, Leverage & Debt Drag, Liquidity & Resilience, Efficiency & Cash Utilization, Risk & Scenario Stress, and Behavioral Signals.

#### Scenario: Domain sections rendered
- **WHEN** the user views the analytics page with 2+ snapshots
- **THEN** the system SHALL display six domain sections, each containing severity-coded insight cards from the engine

### Requirement: Display insight severity summary
The system SHALL display a summary strip at the top of the analytics page showing total insight count, critical count, and warning count.

#### Scenario: Summary strip content
- **WHEN** the engine returns 15 insights with 1 critical and 4 warnings
- **THEN** the summary strip SHALL display "15 Insights · 1 Critical · 4 Warnings"
