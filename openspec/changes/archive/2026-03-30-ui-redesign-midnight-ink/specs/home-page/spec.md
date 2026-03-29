## MODIFIED Requirements

### Requirement: Home page displays product overview
The system SHALL display a Home page with a "Gold Horizon" radial gradient background, an animated `FluidHero` section with the headline "Build your *1 Crore journey* with clarity.", a `ProductReveal` 3D dashboard mockup, a Recharts animated AreaChart with a liquid gold gradient, and `StaggeredFeatures` cards—all with Framer Motion scroll-driven animations.

#### Scenario: User visits home page
- **WHEN** user navigates to the root URL "/"
- **THEN** system SHALL display the Home page with a "Gold Horizon" radial background on the body tag, a parallax `FluidHero` with editorial typography, and a 3D rising dashboard mockup on scroll

#### Scenario: Home page shows animated chart
- **WHEN** user views the Home page hero section
- **THEN** system SHALL display an animated Recharts AreaChart with net worth projection data using a gold gradient (`oklch(0.78 0.12 80)` @ 35% opacity) and a 2.5px stroke

#### Scenario: Home page shows social proof
- **WHEN** user views the Home page below the hero
- **THEN** system SHALL display a "Trusted by 10,000+ users" badge with an overlapping avatar group UI consistent with the "Midnight Ink" theme

#### Scenario: Home page shows key features
- **WHEN** user views the Home page
- **THEN** system SHALL display a features section with `StaggeredFeatures` cards using `.surface-card` styling and consistent "Midnight Ink" iconography

### Requirement: Home page includes navigation
The system SHALL display a responsive navigation bar with `.surface-dark-glass` styling, the "WaveMark" logo, and public links including a primary gold "Sign Up" button.

#### Scenario: Navigation shows public pages
- **WHEN** user views the Home page
- **THEN** system SHALL display navigation links in a `.surface-dark-glass` container with the "WaveMark" logo and a high-impact gold CTA button

#### Scenario: Navigation shows authentication state
- **WHEN** an unauthenticated user views the navigation
- **THEN** system SHALL display a primary "Sign Up" button with a gold border (`border-primary/50`) and subtle gold background (`bg-primary/10`)

#### Scenario: Authenticated user sees sign out option
- **WHEN** an authenticated user views the navigation
- **THEN** system SHALL display a "Sign Out" option instead of "Sign Up" using consistent "Midnight Ink" styling
