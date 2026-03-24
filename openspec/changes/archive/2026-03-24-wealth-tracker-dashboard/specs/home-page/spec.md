## MODIFIED Requirements

### Requirement: Home page displays product overview
The system SHALL display a Home page that serves as the landing page with product overview, key features, and value proposition for the wealth tracker application (previously net worth certificate generator).

#### Scenario: User visits home page
- **WHEN** user navigates to the root URL "/"
- **THEN** system displays the Home page with product name, tagline, and overview reflecting the wealth tracker positioning

#### Scenario: Home page shows key features
- **WHEN** user views the Home page
- **THEN** system displays a features section highlighting the main capabilities: Wealth Tracking, Net Worth Calculator, Analytics, AI Financial Advisor, and Goal Setting

### Requirement: Home page includes navigation
The system SHALL display a navigation bar with links to other public pages and authentication options.

#### Scenario: Navigation shows public pages
- **WHEN** user views the Home page
- **THEN** system displays navigation links to Home and Pricing pages

#### Scenario: Navigation shows authentication state
- **WHEN** an unauthenticated user views the navigation
- **THEN** system displays "Sign In" option in the navigation bar

#### Scenario: Authenticated user sees dashboard link
- **WHEN** an authenticated user views the navigation
- **THEN** system displays a "Dashboard" link and "Sign Out" option instead of "Sign In"
