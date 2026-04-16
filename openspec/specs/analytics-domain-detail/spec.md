# Analytics Domain Detail

## Purpose

This specification defines the requirements for the focused single-domain detail view that users navigate to from the health summary by clicking a domain row.

## Requirements

### Requirement: Display domain verdict header
The system SHALL display the domain name, icon, and a plain-English verdict sentence at the top of the detail view. The verdict SHALL lead with words, not numbers.

#### Scenario: Leverage domain with warning
- **WHEN** the user navigates to the Leverage domain detail and the debt-to-asset ratio is 42%
- **THEN** the system SHALL display a header like "Leverage & Debt Drag" with verdict "Your debt is 42% of your assets — above the 40% comfort zone."

#### Scenario: Growth domain healthy
- **WHEN** the user navigates to the Growth domain detail and all insights are info-severity
- **THEN** the system SHALL display the domain name with a positive verdict like "Your wealth is growing steadily."

### Requirement: Display available insight details
The system SHALL display each available (non-unavailable) insight as a stacked card with the description text as the primary element and the metric value as secondary context.

#### Scenario: Insight with metric gauge
- **WHEN** an insight has a metricValue between 0 and 1 (ratio)
- **THEN** the system SHALL display a progress-bar gauge alongside the description showing the value relative to warning/critical thresholds

#### Scenario: Insight with currency metric
- **WHEN** an insight has a metricValue representing a currency amount
- **THEN** the system SHALL display the formatted currency value below the description text

#### Scenario: Insight without metric
- **WHEN** an insight has no metricValue
- **THEN** the system SHALL display only the title and description text

### Requirement: Collapse unavailable insights into footer
The system SHALL collapse all unavailable insights in a domain into a single muted footer line instead of rendering full-sized cards.

#### Scenario: Domain has unavailable insights
- **WHEN** the Leverage domain has 2 unavailable insights (Interest Coverage, Debt Drag)
- **THEN** the system SHALL display a muted footer line like "2 metrics need more data" instead of two full locked cards

#### Scenario: Domain has no unavailable insights
- **WHEN** all insights in the Growth domain are available
- **THEN** the system SHALL not display any unavailable footer

### Requirement: Back navigation to overview
The system SHALL display a back button that returns the user to the health summary overview.

#### Scenario: User clicks back
- **WHEN** the user clicks "← Back to Overview" in the domain detail view
- **THEN** the system SHALL return to the traffic-light health summary
