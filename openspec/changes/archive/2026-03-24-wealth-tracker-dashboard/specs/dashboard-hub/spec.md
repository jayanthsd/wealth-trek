## ADDED Requirements

### Requirement: Dashboard hub displays navigation cards
The system SHALL display a card-based dashboard hub at `/dashboard` showing five navigation cards: Wealth Tracker, Net Worth Calculator, Analytics, Chat, and Goals.

#### Scenario: Authenticated user views dashboard hub
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL display five cards: "Wealth Tracker", "Net Worth Calculator", "Analytics", "Chat", and "Goals", each with an icon and brief description

#### Scenario: Each card navigates to its dedicated page
- **WHEN** user clicks the "Wealth Tracker" card
- **THEN** the system SHALL navigate to `/dashboard/wealth-tracker`

#### Scenario: Net Worth Calculator card navigates to calculator
- **WHEN** user clicks the "Net Worth Calculator" card
- **THEN** the system SHALL navigate to `/dashboard/calculator`

#### Scenario: Analytics card navigates to analytics page
- **WHEN** user clicks the "Analytics" card
- **THEN** the system SHALL navigate to `/dashboard/analytics`

#### Scenario: Chat card navigates to chat page
- **WHEN** user clicks the "Chat" card
- **THEN** the system SHALL navigate to `/dashboard/chat`

#### Scenario: Goals card navigates to goals page
- **WHEN** user clicks the "Goals" card
- **THEN** the system SHALL navigate to `/dashboard/goals`

### Requirement: Dashboard hub is protected
The system SHALL restrict access to the dashboard hub to authenticated users only.

#### Scenario: Unauthenticated user redirected to sign-in
- **WHEN** an unauthenticated user navigates to `/dashboard`
- **THEN** the system SHALL redirect to the Clerk sign-in page

### Requirement: Dashboard hub uses shared layout
The system SHALL provide a shared layout for all `/dashboard/*` pages with a header containing the app name, navigation back to the hub, and consistent styling.

#### Scenario: Sub-page shows back navigation
- **WHEN** user is on any dashboard sub-page (e.g., `/dashboard/wealth-tracker`)
- **THEN** the system SHALL display a header with a link back to the dashboard hub
