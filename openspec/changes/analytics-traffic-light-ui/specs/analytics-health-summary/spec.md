# Analytics Health Summary

## Purpose

This specification defines the requirements for the traffic-light health summary view on the analytics page, replacing the current grid-of-cards layout with a glanceable per-domain health overview.

## ADDED Requirements

### Requirement: Display overall health status
The system SHALL display an overall financial health status at the top of the analytics page derived from the worst severity across all domains. The status SHALL be one of "All Clear" (green), "Mostly Healthy" (amber), or "Needs Attention" (red), accompanied by a count of domains needing attention.

#### Scenario: All domains healthy
- **WHEN** the insights engine returns no critical or warning items across any domain
- **THEN** the system SHALL display overall status "All Clear" with a green indicator

#### Scenario: Some warnings present
- **WHEN** the insights engine returns warning-severity items but no critical items
- **THEN** the system SHALL display overall status "Mostly Healthy" with an amber indicator and text like "2 areas need attention"

#### Scenario: Critical issues present
- **WHEN** the insights engine returns at least one critical-severity item
- **THEN** the system SHALL display overall status "Needs Attention" with a red indicator

### Requirement: Display per-domain health rows
The system SHALL display one row per financial domain (Growth, Leverage, Liquidity, Efficiency, Risk, Behavior) showing a traffic-light indicator (green/amber/red/grey), the domain name, and a short verdict phrase.

#### Scenario: Healthy domain
- **WHEN** all available insights in the Growth domain have severity "info"
- **THEN** the system SHALL display the Growth row with a green indicator and verdict like "on track"

#### Scenario: Warning domain
- **WHEN** the Leverage domain contains a warning-severity insight for debt-to-asset ratio at 42%
- **THEN** the system SHALL display the Leverage row with an amber indicator and verdict like "getting heavy"

#### Scenario: Critical domain
- **WHEN** the Leverage domain contains a critical-severity insight for debt-to-asset ratio above 50%
- **THEN** the system SHALL display the Leverage row with a red indicator and verdict like "high debt load"

#### Scenario: No-data domain
- **WHEN** all insights in the Risk domain are marked unavailable
- **THEN** the system SHALL display the Risk row with a grey indicator and verdict like "not enough data"

### Requirement: Domain rows are clickable
The system SHALL make each domain row clickable, navigating to the domain detail view for that domain.

#### Scenario: User clicks a domain row
- **WHEN** the user clicks the Leverage row
- **THEN** the system SHALL display the domain detail view for the Leverage domain with a back button to return to the overview

### Requirement: Display composition section below health rows
The system SHALL display a "Composition" section below the domain rows containing the asset/liability pie charts and top movements list.

#### Scenario: Composition visible with data
- **WHEN** the user has at least one snapshot with entries
- **THEN** the system SHALL display asset and liability pie charts and the top 5 movements list below the health summary

#### Scenario: No movements available
- **WHEN** the user has only one snapshot (no pair for comparison)
- **THEN** the system SHALL display pie charts but omit the top movements section

### Requirement: Handle zero-snapshot state
The system SHALL display an empty state directing the user to the Net Worth Calculator when no snapshots exist.

#### Scenario: No snapshots
- **WHEN** the user has zero snapshots
- **THEN** the system SHALL display an empty state with a prompt to create a first snapshot in the Calculator

### Requirement: Handle single-snapshot state
The system SHALL display available single-snapshot insights in the health summary and prompt for more data where multi-snapshot insights are needed.

#### Scenario: Single snapshot
- **WHEN** the user has exactly one snapshot
- **THEN** the system SHALL display domain rows for domains with available single-snapshot insights and show a prompt encouraging the user to add more snapshots for full analysis
