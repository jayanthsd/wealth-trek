## ADDED Requirements

### Requirement: OKLCH Design Tokens
The system SHALL define a core set of OKLCH design tokens in `app/src/app/globals.css` that establish the "Midnight Ink" palette.

#### Scenario: Background and foreground tokens are defined
- **WHEN** the `globals.css` file is loaded
- **THEN** the `:root` SHALL include `--background` as `oklch(0.09 0.005 60)` and `--foreground` as `oklch(0.94 0.008 80)`

#### Scenario: Primary gold and accent tokens are defined
- **WHEN** the `globals.css` file is loaded
- **THEN** the `:root` SHALL include `--primary` as `oklch(0.78 0.12 80)` and `--card` as `oklch(0.13 0.007 60)`

### Requirement: Gold Horizon Background
The system SHALL implement a multi-layered radial gradient background on the `body` tag to create the "Gold Horizon" effect.

#### Scenario: Body background uses three-layer radial gradient
- **WHEN** the `body` tag is rendered
- **THEN** it SHALL apply a fixed background-image consisting of a top-right gold gradient (18% opacity), a bottom-left charcoal gradient (12% opacity), and a center atmospheric glow (4% opacity)

### Requirement: Typography System
The system SHALL integrate Plus Jakarta Sans as the primary sans-serif font and Cormorant Garamond (Italic) as the secondary editorial serif font.

#### Scenario: Sans-serif font is applied to UI
- **WHEN** UI elements are rendered
- **THEN** they SHALL use the `--font-sans` variable mapped to `Plus_Jakarta_Sans`

#### Scenario: Editorial serif is applied to highlights
- **WHEN** editorial headings or emphasized text are rendered
- **THEN** they SHALL use the `--font-display` variable mapped to `Cormorant_Garamond` (italic)

### Requirement: Surface Utility Classes
The system SHALL provide utility classes for standard "Midnight Ink" materials.

#### Scenario: surface-dark-glass utility applies blur and saturation
- **WHEN** the `.surface-dark-glass` class is applied
- **THEN** the element SHALL have `backdrop-filter: blur(24px) saturate(160%)` and a semi-transparent background

#### Scenario: surface-card utility applies charcoal background and inner glow
- **WHEN** the `.surface-card` class is applied
- **THEN** the element SHALL have a solid charcoal background and an inner gold glow (`box-shadow: inset 0 0 20px oklch(0.78 0.12 80 / 0.05)`)
