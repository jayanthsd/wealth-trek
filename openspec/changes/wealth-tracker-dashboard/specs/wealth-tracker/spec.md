## ADDED Requirements

### Requirement: Display net worth trend over time
The system SHALL display a line chart showing net worth values over time on the Wealth Tracker page at `/dashboard/wealth-tracker`.

#### Scenario: User has multiple snapshots
- **WHEN** user navigates to `/dashboard/wealth-tracker` and has 3 or more historical net worth snapshots
- **THEN** the system SHALL display a line chart with date on the x-axis and net worth on the y-axis

#### Scenario: User has no snapshots
- **WHEN** user navigates to `/dashboard/wealth-tracker` and has no historical snapshots
- **THEN** the system SHALL display an empty state message prompting the user to calculate their net worth first

### Requirement: Display assets and liabilities trends
The system SHALL display a chart showing total assets and total liabilities trends over time alongside the net worth trend.

#### Scenario: Trend chart shows all three series
- **WHEN** user views the Wealth Tracker page with historical data
- **THEN** the system SHALL display three series on the chart: Total Assets, Total Liabilities, and Net Worth, each in a distinct color

### Requirement: Display snapshot summary table
The system SHALL display a summary table below the chart listing each historical snapshot with date, total assets, total liabilities, and net worth.

#### Scenario: Table shows all snapshots
- **WHEN** user views the Wealth Tracker page with 5 historical snapshots
- **THEN** the system SHALL display a table with 5 rows sorted by date (most recent first)

#### Scenario: User can view snapshot details
- **WHEN** user clicks on a row in the snapshot summary table
- **THEN** the system SHALL expand or navigate to show the full line-item breakdown (assets and liabilities) for that snapshot
