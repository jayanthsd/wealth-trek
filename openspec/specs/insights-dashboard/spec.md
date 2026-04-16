# Insights Dashboard

## Purpose

This specification defines the requirements for the redesigned insights dashboard UI at `/dashboard/analytics` that displays computed financial insights grouped by domain with severity indicators, collapsible sections, and contextual explanations.

## Requirements

### Requirement: Display insight summary strip
The system SHALL display a summary strip at the top of the insights dashboard showing the total number of insights, count of critical-severity insights, and count of warning-severity insights.

#### Scenario: Summary with mixed severities
- **WHEN** the engine returns 18 total insights with 2 critical and 5 warnings
- **THEN** the summary strip SHALL display "18 Insights · 2 Critical · 5 Warnings" with appropriate color coding

#### Scenario: No critical or warning insights
- **WHEN** all insights have severity "info"
- **THEN** the summary strip SHALL display only the total count with a positive indicator

### Requirement: Group insights by domain sections
The system SHALL render one collapsible section per insight domain (Growth & Real Wealth, Leverage & Debt Drag, Liquidity & Resilience, Efficiency & Cash Utilization, Risk & Scenario Stress, Behavioral Signals), each with a domain icon and heading.

#### Scenario: All six domains rendered
- **WHEN** the insights dashboard loads with snapshot data producing insights across all domains
- **THEN** the system SHALL display six collapsible sections, each with its domain name as heading and a representative icon

#### Scenario: Domain section is collapsible
- **WHEN** the user clicks on a domain section header
- **THEN** the section SHALL toggle between expanded and collapsed states with smooth animation

### Requirement: Render insight cards with severity styling
The system SHALL render each `InsightItem` as a card with color-coded severity indicator (info = primary/blue, warning = amber, critical = red), trend icon, title, description, and optional metric value.

#### Scenario: Critical severity card
- **WHEN** an insight has severity "critical"
- **THEN** the card SHALL display with a red border accent, red severity icon, and the metric value prominently displayed

#### Scenario: Info severity card
- **WHEN** an insight has severity "info"
- **THEN** the card SHALL display with a subtle primary-color accent and standard styling

### Requirement: Render unavailable insight cards
The system SHALL render insights with `unavailable: true` as muted/greyed-out cards showing the insight title, the `unavailableReason`, and a prompt indicating what data is needed to unlock the metric.

#### Scenario: Unavailable metric display
- **WHEN** the Interest Coverage Proxy insight has unavailable set to true with reason "Requires income and interest rate data"
- **THEN** the card SHALL render in a muted style with the reason text and a lock or placeholder icon

### Requirement: Display domain-level metric visualisations
The system SHALL display small inline visualisations (spark values, gauge indicators, or mini bar comparisons) alongside key metrics within each domain section where numeric values are available.

#### Scenario: Debt-to-asset ratio gauge
- **WHEN** the debt-to-asset ratio insight has metricValue 0.45
- **THEN** the system SHALL display a visual gauge or progress bar showing 45% with the warning threshold marked

#### Scenario: Asset concentration bar
- **WHEN** the asset concentration insight identifies "Real Estate" at 65%
- **THEN** the system SHALL display a proportional bar showing the concentrated class vs others

### Requirement: Retain existing analytics content
The system SHALL retain the existing top-movements list and asset/liability pie-chart breakdowns from the current analytics page, integrated as sections within the new layout.

#### Scenario: Top movements visible
- **WHEN** the user views the insights dashboard with 2+ snapshots
- **THEN** the system SHALL display the top movements section showing the largest asset and liability changes between recent snapshots

#### Scenario: Pie charts visible
- **WHEN** the user views the insights dashboard
- **THEN** the system SHALL display asset breakdown and liability breakdown pie charts from the latest snapshot

### Requirement: Handle insufficient data state
The system SHALL display a meaningful empty state when fewer than 2 snapshots exist, showing which single-snapshot insights are available and prompting the user to add more snapshots to unlock the full suite.

#### Scenario: Single snapshot available
- **WHEN** only 1 snapshot exists
- **THEN** the system SHALL display available single-snapshot insights (debt-to-asset, concentration, idle cash, asset turnover) and a prompt to add a second snapshot

#### Scenario: No snapshots available
- **WHEN** no snapshots exist
- **THEN** the system SHALL display an empty state directing the user to the Net Worth Calculator

### Requirement: Provide navigation to full analytics from dashboard hub
The system SHALL display a "View all insights" link in the dashboard hub Intelligence Feed section that navigates to `/dashboard/analytics`.

#### Scenario: Link visible on dashboard hub
- **WHEN** the user views the dashboard hub with insights available
- **THEN** a "View all insights" link SHALL be visible below the insight cards, navigating to the analytics page
