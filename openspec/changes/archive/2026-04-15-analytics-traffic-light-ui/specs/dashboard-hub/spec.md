# Dashboard Hub (Delta)

## MODIFIED Requirements

### Requirement: Dashboard hub displays insight cards
The system SHALL display an Intelligence Feed section with `InsightCard` components showing financial observations sourced from the insights engine when 2+ snapshots are available, with sample data fallback otherwise. The "View all insights" link SHALL navigate to the health summary analytics page at `/dashboard/analytics`.

#### Scenario: Insight cards are displayed with real data
- **WHEN** an authenticated user has 2+ snapshots and views the dashboard hub
- **THEN** the system SHALL display up to 4 engine-sourced insight cards sorted by severity then magnitude, with severity props for color-coded rendering, and a "View all insights →" link to `/dashboard/analytics`

#### Scenario: Insight cards fallback to sample data
- **WHEN** an authenticated user has fewer than 2 snapshots
- **THEN** the system SHALL display sample insight cards with a Simulation Mode badge
