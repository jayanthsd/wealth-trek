## MODIFIED Requirements

### Requirement: GradientBackground component renders glassmorphism backdrop
The system SHALL provide a `GradientBackground` component that renders a "Midnight Ink" charcoal glassmorphism backdrop (`.surface-dark-glass`).

#### Scenario: Default charcoal gradient background renders
- **WHEN** `GradientBackground` is rendered
- **THEN** it SHALL apply the `.surface-dark-glass` utility with `oklch(0.09 0.005 60 / 0.85)` background and `backdrop-filter: blur(24px)`

### Requirement: NetWorthCard component displays net worth with gold styling
The system SHALL provide a `NetWorthCard` component that uses the "Midnight Ink" palette and editorial typography.

#### Scenario: Card uses surface-card and gold indicators
- **WHEN** `NetWorthCard` is rendered
- **THEN** it SHALL use `.surface-card` for its container and `oklch(0.62 0.14 150)` (sage green) for positive changes or red for negative changes

### Requirement: PricingCard component displays pricing tier with highlight support
The system SHALL provide a `PricingCard` component that uses "Midnight Ink" styling, where highlighted cards have a gold border and inner glow.

#### Scenario: Highlighted card has gold border and glow
- **WHEN** `PricingCard` is rendered with `highlighted={true}`
- **THEN** it SHALL display a gold border (`border-primary/50`) and an inner gold glow shadow

#### Scenario: CTA button uses liquid gold style
- **WHEN** user views the CTA button inside `PricingCard`
- **THEN** it SHALL have high-impact gold styling with glowing shadows (`shadow-primary/20`)
