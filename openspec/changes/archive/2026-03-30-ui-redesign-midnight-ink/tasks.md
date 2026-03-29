## 1. Foundation Setup

- [x] 1.1 Install UI dependencies: `framer-motion`, `recharts`, `lucide-react`, `oklch`
- [x] 1.2 Configure Google Fonts in `app/src/app/layout.tsx`: Plus Jakarta Sans, Cormorant Garamond, Geist Mono
- [x] 1.3 Apply OKLCH design tokens and "Gold Horizon" background in `app/src/app/globals.css`
- [x] 1.4 Create `surface-dark-glass` and `surface-card` utility classes in `globals.css`
- [x] 1.5 Add `text-liquid-gold` animated shimmer utility class in `globals.css`

## 2. Core Navigation & Global UI

- [x] 2.1 Update `app/src/components/Navigation.tsx` with `.surface-dark-glass` and WaveMark logo
- [x] 2.2 Implement high-impact gold "Sign Up" button in `Navigation.tsx`
- [x] 2.3 Redesign `GradientBackground` component using `oklch(0.09 0.005 60 / 0.85)` and backdrop blur

## 3. Premium UI Component Refresh

- [x] 3.1 Update `NetWorthCard` with `.surface-card` styling and editorial typography
- [x] 3.2 Update `PricingCard` with gold highlight border and glowing shadows
- [x] 3.3 Ensure all cards in `app/src/components/ui/` use "Midnight Ink" tokens

## 4. Home Page Reconstruction

- [x] 4.1 Implement `FluidHero` in `page.tsx` with scroll-driven parallax effect
- [x] 4.2 Implement `ProductReveal` 3D dashboard rotation on scroll in `page.tsx`
- [x] 4.3 Update Home Page `AreaChart` with liquid gold gradient and editorial styling
- [x] 4.4 Implement `StaggeredFeatures` and `FluidCTA` sections with "Midnight Ink" theme

## 5. Dashboard & Wealth Tracker Updates

- [x] 5.1 Update Wealth Tracker chart in `app/src/app/dashboard/wealth-tracker/page.tsx` with gold stroke and charcoal surface
- [x] 5.2 Align dashboard sidebar and layout with `.surface-dark-glass` and dark-mode tokens
- [x] 5.3 Verify consistent theme application across all dashboard routes
