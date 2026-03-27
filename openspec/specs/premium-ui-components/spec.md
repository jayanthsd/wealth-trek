# Premium UI Components

## Purpose

This specification defines reusable UI components for the net worth certificate generator application, providing glassmorphism styling, animations, and consistent design tokens across the application.

## Requirements

### Requirement: GradientBackground component renders glassmorphism backdrop
The system SHALL provide a `GradientBackground` component at `components/ui/GradientBackground.tsx` that renders a full-section glassmorphism backdrop with configurable gradient variant and optional blur effect.

#### Scenario: Default gradient background renders
- **WHEN** `GradientBackground` is rendered with `children` and no explicit props
- **THEN** the component SHALL render a container with a purple-to-indigo radial gradient overlay, `backdrop-blur-md`, and semi-transparent white background (`bg-white/70`)

#### Scenario: Variant prop changes gradient colors
- **WHEN** `GradientBackground` is rendered with `variant="emerald"`
- **THEN** the component SHALL render an emerald-to-teal gradient instead of the default purple-to-indigo

#### Scenario: Blur can be disabled
- **WHEN** `GradientBackground` is rendered with `blur={false}`
- **THEN** the component SHALL not apply `backdrop-blur-md` to the container

### Requirement: SectionContainer component animates children on mount
The system SHALL provide a `SectionContainer` component at `components/ui/SectionContainer.tsx` that wraps children in a Framer Motion `motion.div` with fade-in and slide-up entrance animation.

#### Scenario: Section animates on mount
- **WHEN** `SectionContainer` is rendered
- **THEN** the component SHALL animate from `opacity: 0, y: 20` to `opacity: 1, y: 0` with a smooth easing

#### Scenario: Delay prop staggers entrance
- **WHEN** `SectionContainer` is rendered with `delay={0.2}`
- **THEN** the entrance animation SHALL begin after a 200ms delay

#### Scenario: Custom className is forwarded
- **WHEN** `SectionContainer` is rendered with `className="mt-8"`
- **THEN** the custom class SHALL be applied to the outer `motion.div` element

### Requirement: NetWorthCard component displays net worth with change indicators
The system SHALL provide a `NetWorthCard` component at `components/ui/NetWorthCard.tsx` that displays the current net worth value, monthly change amount, and percentage change with appropriate color-coded trend indicators.

#### Scenario: Positive net worth change displays green indicators
- **WHEN** `NetWorthCard` is rendered with `monthlyChange={50000}` and `percentageChange={3}`
- **THEN** the component SHALL display the change in green text with an upward arrow icon

#### Scenario: Negative net worth change displays red indicators
- **WHEN** `NetWorthCard` is rendered with `monthlyChange={-20000}` and `percentageChange={-1.5}`
- **THEN** the component SHALL display the change in red text with a downward arrow icon

#### Scenario: Net worth value is formatted in INR currency
- **WHEN** `NetWorthCard` is rendered with `netWorth={2500000}`
- **THEN** the component SHALL display the value formatted as Indian Rupee currency (e.g., "₹25,00,000")

#### Scenario: Card has hover lift animation
- **WHEN** user hovers over the `NetWorthCard`
- **THEN** the card SHALL lift with increased shadow (`shadow-xl`) using a smooth Framer Motion transition

### Requirement: InsightCard component displays trend-aware insights
The system SHALL provide an `InsightCard` component at `components/ui/InsightCard.tsx` that displays a title, description, and optional trend direction with appropriate visual indicators.

#### Scenario: Upward trend insight renders with green indicator
- **WHEN** `InsightCard` is rendered with `trend="up"`
- **THEN** the component SHALL display a green upward trend icon alongside the title

#### Scenario: Downward trend insight renders with red indicator
- **WHEN** `InsightCard` is rendered with `trend="down"`
- **THEN** the component SHALL display a red downward trend icon alongside the title

#### Scenario: No trend renders neutral card
- **WHEN** `InsightCard` is rendered without a `trend` prop
- **THEN** the component SHALL render without any trend icon, displaying only title and description

#### Scenario: Card entrance animation
- **WHEN** `InsightCard` is mounted
- **THEN** the component SHALL animate in with fade and slide-up using Framer Motion

### Requirement: PricingCard component displays pricing tier with highlight support
The system SHALL provide a `PricingCard` component at `components/ui/PricingCard.tsx` that renders a single pricing tier with name, price, billing period, features list, CTA button, and optional highlight styling with gradient border.

#### Scenario: Highlighted card has gradient border and scale
- **WHEN** `PricingCard` is rendered with `highlighted={true}`
- **THEN** the component SHALL display with a gradient border (purple-to-indigo), slight default scale-up, and a "🔥 Most Popular" badge

#### Scenario: Non-highlighted card renders standard styling
- **WHEN** `PricingCard` is rendered with `highlighted={false}`
- **THEN** the component SHALL render with standard border, no badge, and no scale effect

#### Scenario: Hover interaction on card
- **WHEN** user hovers over any `PricingCard`
- **THEN** the card SHALL lift with `shadow-xl` and slight scale increase via Framer Motion `whileHover`

#### Scenario: CTA button has micro-interaction
- **WHEN** user hovers over the CTA button inside `PricingCard`
- **THEN** the button SHALL scale to 1.03 on hover and 0.97 on tap

### Requirement: All premium UI components use strict TypeScript
The system SHALL define explicit TypeScript interfaces for all component props without using the `any` type.

#### Scenario: Component props are typed
- **WHEN** any premium UI component is imported and used
- **THEN** TypeScript SHALL enforce correct prop types at compile time with no `any` usage in the component files

### Requirement: All premium UI components are responsive
The system SHALL ensure all premium UI components render correctly on mobile (320px), tablet (768px), and desktop (1280px) viewports.

#### Scenario: Components adapt to mobile viewport
- **WHEN** any premium UI component is viewed on a 320px-wide viewport
- **THEN** the component SHALL render without horizontal overflow, with appropriately sized text and spacing
