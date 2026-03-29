## MODIFIED Requirements

### Requirement: Display net worth trend over time
The system SHALL display a line chart showing net worth values over time on the Wealth Tracker page using the "Midnight Ink" theme (charcoal surface, gold stroke).

#### Scenario: User has multiple snapshots
- **WHEN** user navigates to `/dashboard/wealth-tracker` and has 3 or more historical net worth snapshots
- **THEN** the system SHALL display a line chart with a 2.5px gold stroke (`oklch(0.78 0.12 80)`) and a liquid gold area gradient inside a `.surface-card` container

### Requirement: Display assets and liabilities trends
The system SHALL display a chart showing total assets and total liabilities trends over time with "Midnight Ink" color-coded series.

#### Scenario: Trend chart shows all three series
- **WHEN** user views the Wealth Tracker page with historical data
- **THEN** the system SHALL display three series: Net Worth (Gold), Total Assets (Sage Green), and Total Liabilities (Amber)
