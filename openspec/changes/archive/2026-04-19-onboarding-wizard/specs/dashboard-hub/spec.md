## ADDED Requirements

### Requirement: Dashboard shows onboarding wizard for zero-snapshot users
The system SHALL display the onboarding wizard component instead of the standard dashboard hub when the authenticated user has zero snapshots and has not dismissed the onboarding prompt. The trigger condition SHALL be `allLoaded && !hasSnapshots && !dismissed`, matching the existing conditional render location.

#### Scenario: New user sees onboarding wizard
- **WHEN** an authenticated user with zero snapshots and no dismissal navigates to `/dashboard`
- **THEN** the system SHALL render the `OnboardingWizard` component in place of the standard dashboard content

#### Scenario: User with snapshots sees standard dashboard
- **WHEN** an authenticated user with one or more snapshots navigates to `/dashboard`
- **THEN** the system SHALL render the standard dashboard hub (not the wizard)

#### Scenario: FirstSnapshotOnboarding component is replaced
- **WHEN** the dashboard page is rendered for a zero-snapshot user
- **THEN** the system SHALL render `OnboardingWizard` instead of the former `FirstSnapshotOnboarding` component
