## ADDED Requirements

### Requirement: Scroll-Driven Parallax (FluidHero)
The system SHALL provide a `FluidHero` component that uses `framer-motion`'s `useScroll` to create a parallax movement of background elements synchronized with the page scroll.

#### Scenario: Background gradient moves on scroll
- **WHEN** the user scrolls the page
- **THEN** the `FluidHero` component SHALL map the scroll position to the `y` transform of its background gradient blobs

### Requirement: 3D Product Reveal
The system SHALL provide a `ProductReveal` component that performs a "rising" 3D transform on an element as it enters the viewport during scrolling.

#### Scenario: Dashboard mockup rotates and scales on scroll
- **WHEN** the user scrolls past the `ProductReveal` trigger
- **THEN** the target element SHALL scale from 0.8 to 1.0 and rotate from `rotateX(25deg)` to `rotateX(0deg)`

### Requirement: Staggered Entrance Animations
The system SHALL use `framer-motion`'s `staggerChildren` to animate groups of feature cards or list items.

#### Scenario: Feature cards animate in sequence
- **WHEN** a feature section enters the viewport
- **THEN** each individual card SHALL animate in with a slight delay relative to the previous one
