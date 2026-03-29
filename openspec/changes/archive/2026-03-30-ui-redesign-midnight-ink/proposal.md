## Why

The current UI uses a standard purple-to-indigo theme which lacks the "premium, private, and editorial" feel desired for a high-end personal balance sheet platform. To better align with the "Wealth Trek" brand identity, we need to transition to the "Midnight Ink" aesthetic—a sophisticated, dark-mode design with warm gold accents and fluid animations. This will significantly enhance the user experience and perceived value of the application.

## What Changes

- **Design System**: Replace the current color system with OKLCH tokens (Midnight Ink palette: charcoal, gold, amber).
- **Global Styles**: Implement "Gold Horizon" radial backgrounds and `surface-dark-glass` utilities.
- **Typography**: Integrate Plus Jakarta Sans (sans-serif) and Cormorant Garamond (italic serif) for an editorial look.
- **Navigation**: Redesign the navigation bar with glassmorphism, the new "WaveMark" logo, and high-impact gold CTA buttons.
- **Home Page**: Complete overhaul of the landing page featuring:
    - `FluidHero`: Parallax scroll-driven hero section.
    - `ProductReveal`: 3D rising dashboard reveal on scroll.
    - `StaggeredFeatures`: Updated feature cards with Midnight Ink styling.
    - `FluidCTA`: Massive heading-display and glowing CTA.
- **Component Library**: Update all existing premium UI components (`GradientBackground`, `NetWorthCard`, `InsightCard`, `PricingCard`) to match the new aesthetic.

## Capabilities

### New Capabilities
- `ui-foundations`: Defines the core OKLCH design system, typography, and global layout patterns (Gold Horizon, Midnight Ink).
- `fluid-animations`: Requirements for scroll-driven parallax and 3D reveal effects using Framer Motion.

### Modified Capabilities
- `home-page`: Overhaul requirements to include `FluidHero`, `ProductReveal`, and Midnight Ink styling.
- `premium-ui-components`: Update visual requirements from purple/indigo to Midnight Ink (charcoal/gold).
- `wealth-tracker`: Update dashboard requirements to align with the new Midnight Ink theme.

## Impact

- **CSS**: Major changes to `app/src/app/globals.css`.
- **Layout**: Updates to `app/src/app/layout.tsx`.
- **Components**: Updates to most files in `app/src/components/ui/` and `app/src/components/Navigation.tsx`.
- **Dependencies**: Ensure `framer-motion`, `recharts`, `lucide-react`, and `oklch` are available.
