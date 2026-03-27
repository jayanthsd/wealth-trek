## MODIFIED Requirements

### Requirement: Home page displays product overview
The system SHALL display a Home page with a glassmorphism gradient background, an animated hero section with the headline "Build your ₹1Cr journey with clarity, consistency, and confidence", a Recharts animated AreaChart showing net worth projection data, a social proof section ("Trusted by 10,000+ users" with avatar group), and feature cards — all with Framer Motion entrance animations.

#### Scenario: User visits home page
- **WHEN** user navigates to the root URL "/"
- **THEN** system SHALL display the Home page with a glassmorphism gradient background (`backdrop-blur-md bg-white/70`), hero section with headline, subtext, and animated chart in a responsive grid layout

#### Scenario: Home page shows animated chart
- **WHEN** user views the Home page hero section
- **THEN** system SHALL display an animated Recharts AreaChart with net worth projection data that animates smoothly on initial load with a fade-in effect

#### Scenario: Home page shows social proof
- **WHEN** user views the Home page below the hero
- **THEN** system SHALL display a "Trusted by 10,000+ users" badge with an overlapping avatar group UI

#### Scenario: Home page shows key features
- **WHEN** user views the Home page
- **THEN** system SHALL display a features section with consistent iconography, spacing, typography, and Framer Motion staggered entrance animations on each feature card

### Requirement: Home page includes call-to-action elements
The system SHALL provide a primary CTA button labeled "Start Building Wealth" with Framer Motion hover animation (scale + glow effect) and a secondary "View pricing" button, both above the fold.

#### Scenario: Unauthenticated user sees CTA
- **WHEN** an unauthenticated user views the Home page
- **THEN** system SHALL display a "Start Building Wealth" primary button with hover scale (1.03) and glow animation, and a "View pricing" secondary button

#### Scenario: CTA redirects to authentication
- **WHEN** user clicks the "Start Building Wealth" button
- **THEN** system SHALL open the Clerk sign-up modal with visible interactive feedback during the action

### Requirement: Home page is publicly accessible
The system SHALL allow access to the Home page without requiring authentication.

#### Scenario: Anonymous user accesses home page
- **WHEN** an unauthenticated user navigates to "/"
- **THEN** system SHALL display the Home page without redirecting to sign-in

### Requirement: Home page includes navigation
The system SHALL display a responsive navigation bar with links to public pages and authentication options, preserving brand consistency and mobile usability.

#### Scenario: Navigation shows public pages
- **WHEN** user views the Home page
- **THEN** system SHALL display navigation links to Home and Pricing pages in a layout appropriate for the current viewport

#### Scenario: Navigation shows authentication state
- **WHEN** an unauthenticated user views the navigation
- **THEN** system SHALL display a clear "Sign In" option with accessible focus and tap behavior

#### Scenario: Authenticated user sees sign out option
- **WHEN** an authenticated user views the navigation
- **THEN** system SHALL display "Sign Out" option instead of "Sign In" using the same interaction and accessibility standards
