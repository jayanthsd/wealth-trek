# Dashboard Hub

## Purpose

This specification defines the requirements for the dashboard hub that provides a comprehensive wealth tracking overview with personalized insights, charts, and navigation via a persistent sidebar.

## Requirements

### Requirement: Dashboard hub displays navigation cards
The system SHALL display a card-based dashboard hub at `/dashboard` showing five navigation cards: Wealth Tracker, Net Worth Calculator, Analytics, Chat, and Goals — each with Framer Motion hover lift animation (shadow-xl + slight translateY) and staggered entrance animation.

#### Scenario: Authenticated user views dashboard hub
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL display five cards with icons, descriptions, and Framer Motion hover/entrance animations in a responsive grid

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

### Requirement: Dashboard hub displays personalized header
The system SHALL display a personalized greeting header with "Welcome back, [Name] 👋" and a subtext showing wealth growth summary (e.g., "Your wealth grew 3% this month") with Framer Motion entrance animation.

#### Scenario: Header shows personalized greeting
- **WHEN** an authenticated user views the dashboard hub
- **THEN** the system SHALL display "Welcome back, [Name] 👋" with a growth indicator subtext below it

#### Scenario: Header entrance animation
- **WHEN** the dashboard hub page loads
- **THEN** the header section SHALL animate in with fade and slide-up using Framer Motion

### Requirement: Dashboard hub displays net worth summary card
The system SHALL display a `NetWorthCard` component at the top of the dashboard hub showing current net worth, monthly change amount, and percentage change with color-coded trend indicators.

#### Scenario: Net worth summary is visible
- **WHEN** an authenticated user views the dashboard hub
- **THEN** the system SHALL display a NetWorthCard with the net worth value formatted in INR, monthly change, and percentage change

### Requirement: Dashboard hub displays assets vs liabilities chart
The system SHALL display a Recharts `LineChart` showing assets vs liabilities trend over time in the dashboard hub, with smooth animation on mount.

#### Scenario: Chart renders with sample data
- **WHEN** an authenticated user views the dashboard hub
- **THEN** the system SHALL display a LineChart with two lines (assets in green, liabilities in amber) using sample/mock data with animate-on-mount behavior

#### Scenario: Chart is responsive
- **WHEN** user views the chart on mobile
- **THEN** the chart SHALL resize appropriately using Recharts `ResponsiveContainer`

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

### Requirement: Dashboard hub insight cards display severity styling
The system SHALL apply severity-based styling to insight cards in the Intelligence Feed: critical insights SHALL have a red accent, warning insights SHALL have an amber accent, and info insights SHALL use the default primary accent.

#### Scenario: Critical insight in feed
- **WHEN** the top insight from the engine has severity "critical"
- **THEN** the InsightCard SHALL render with a red border/icon accent distinguishing it from info-level cards

#### Scenario: Mixed severity insights
- **WHEN** the engine returns insights with mixed severities
- **THEN** each InsightCard SHALL reflect its individual severity styling

### Requirement: Dashboard hub displays goals progress section
The system SHALL display a goals section with progress bars and milestone indicators showing financial goal progress.

#### Scenario: Goals progress is visible
- **WHEN** an authenticated user views the dashboard hub
- **THEN** the system SHALL display goal items with progress bars showing percentage completion and target amounts

### Requirement: Dashboard hub displays quick action buttons
The system SHALL display a quick actions row with buttons for "Add Asset", "Add Liability", and "Generate Report" with Framer Motion button micro-interactions.

#### Scenario: Quick action buttons are displayed
- **WHEN** an authenticated user views the dashboard hub
- **THEN** the system SHALL display three quick action buttons with icons and Framer Motion hover (scale 1.03) and tap (scale 0.97) animations

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
