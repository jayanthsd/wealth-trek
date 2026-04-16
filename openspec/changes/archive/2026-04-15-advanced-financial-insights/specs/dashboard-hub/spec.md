# Dashboard Hub — Delta Spec

## MODIFIED Requirements

### Requirement: Dashboard hub displays insight cards
The system SHALL display an Intelligence Feed section with insight cards sourced from the financial insights engine (`computeAllInsights`), showing the top 4 most impactful insights sorted by severity (critical first, then warning, then info) and metric magnitude. When real snapshot data is available, sample/mock insights SHALL NOT be shown.

#### Scenario: Insight cards sourced from engine with real data
- **WHEN** an authenticated user views the dashboard hub with 2+ snapshots
- **THEN** the system SHALL display up to 4 InsightCards populated from the financial insights engine, each showing title, description, trend indicator, and severity styling

#### Scenario: Insight cards fall back to sample data
- **WHEN** an authenticated user views the dashboard hub with fewer than 2 snapshots
- **THEN** the system SHALL display sample insight cards as before, with the "Simulation Mode" badge

#### Scenario: View all insights link
- **WHEN** the Intelligence Feed section is displayed with real insight data
- **THEN** the system SHALL display a "View all insights" link below the cards that navigates to `/dashboard/analytics`

## ADDED Requirements

### Requirement: Dashboard hub insight cards display severity styling
The system SHALL apply severity-based styling to insight cards in the Intelligence Feed: critical insights SHALL have a red accent, warning insights SHALL have an amber accent, and info insights SHALL use the default primary accent.

#### Scenario: Critical insight in feed
- **WHEN** the top insight from the engine has severity "critical"
- **THEN** the InsightCard SHALL render with a red border/icon accent distinguishing it from info-level cards

#### Scenario: Mixed severity insights
- **WHEN** the engine returns insights with mixed severities
- **THEN** each InsightCard SHALL reflect its individual severity styling
