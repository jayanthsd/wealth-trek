# Analytics

## Purpose

This specification defines the requirements for the Analytics page that provides insights and analysis of net worth trends and financial movements.

## Requirements

### Requirement: Display net worth change summary
The system SHALL display the year-over-year (or snapshot-over-snapshot) net worth change on the Analytics page at `/dashboard/analytics`.

#### Scenario: Positive net worth growth
- **WHEN** the latest snapshot shows net worth of 1,000,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a summary card showing "+₹2,00,000 (+25%)" with a positive indicator

#### Scenario: Negative net worth change
- **WHEN** the latest snapshot shows net worth of 700,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a summary card showing "-₹1,00,000 (-12.5%)" with a negative indicator

#### Scenario: Insufficient data
- **WHEN** user has fewer than 2 snapshots
- **THEN** the system SHALL display a message indicating that at least 2 snapshots are needed for analytics

### Requirement: Identify largest asset and liability movements
The system SHALL identify and display the largest changes in individual asset and liability categories between the two most recent snapshots.

#### Scenario: New liability detected
- **WHEN** the latest snapshot contains a "Home Loan" entry that did not exist in the previous snapshot
- **THEN** the system SHALL display an insight card: "New liability detected: Home Loan of ₹X"

#### Scenario: Significant asset growth
- **WHEN** a "Mutual Fund" entry increased by more than 20% between snapshots
- **THEN** the system SHALL display an insight card highlighting the growth

### Requirement: Provide actionable suggestions
The system SHALL generate actionable suggestions based on the movement analysis.

#### Scenario: Loan restructuring suggestion
- **WHEN** total liabilities increased and resulted in lower net worth compared to previous snapshot
- **THEN** the system SHALL display a suggestion such as "Your liabilities increased by ₹X, resulting in lower net worth. Consider restructuring your loans."

#### Scenario: Positive trend encouragement
- **WHEN** net worth has increased in the last 3 consecutive snapshots
- **THEN** the system SHALL display an encouraging message acknowledging the positive trend

### Requirement: Display asset vs liability breakdown chart
The system SHALL display a chart showing the composition of assets and liabilities from the latest snapshot.

#### Scenario: Asset breakdown chart
- **WHEN** user views the Analytics page with snapshot data
- **THEN** the system SHALL display a bar or pie chart showing the proportion of each asset type in total assets
