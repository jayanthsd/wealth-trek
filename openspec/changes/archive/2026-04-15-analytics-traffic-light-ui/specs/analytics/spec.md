# Analytics (Delta)

## MODIFIED Requirements

### Requirement: Display net worth change summary
The system SHALL display net worth change information within the domain detail view for the Growth domain, rather than as a standalone summary card on the main analytics page. The net worth delta is now surfaced as an insight within the Growth domain health row and its detail view.

#### Scenario: Positive net worth growth
- **WHEN** the latest snapshot net worth is 1,000,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a Growth domain row with green status and the detail view SHALL show an insight with "+₹2,00,000 (+25%)" as secondary metric context

#### Scenario: Negative net worth change
- **WHEN** the latest snapshot net worth is 700,000 and the previous snapshot shows 800,000
- **THEN** the system SHALL display a Growth domain row with warning status and the detail view SHALL show an insight with "-₹1,00,000 (-12.5%)" as secondary metric context

#### Scenario: Insufficient data
- **WHEN** user has fewer than 2 snapshots
- **THEN** the system SHALL display Growth domain row with grey "not enough data" status for multi-snapshot metrics, while single-snapshot insights remain available

### Requirement: Display asset vs liability breakdown chart
The system SHALL display pie charts showing the composition of assets and liabilities in a "Composition" section below the health summary rows on the main analytics page.

#### Scenario: Asset breakdown chart
- **WHEN** user views the Analytics page with snapshot data
- **THEN** the system SHALL display a pie chart showing the proportion of each asset type in total assets within the Composition section below the health summary
