## Why

The current UI is functional but lacks the premium, emotionally engaging feel expected from a wealth-building platform. Users tracking their journey to ₹1Cr need a visually rich experience that motivates consistent engagement — glassmorphism, smooth animations, and insight-driven messaging. The home, pricing, and dashboard pages need a design uplift with Framer Motion animations, Recharts-powered interactive charts, and reusable component architecture to match the quality bar of Stripe/Linear/Vercel-tier SaaS products. No business logic changes — purely UI/UX.

## What Changes

- **Home Page**: Replace static SVG chart with animated Recharts projection chart; upgrade hero copy and CTA with glow/scale animations; add glassmorphism background; add social proof section (avatar group + trust badge)
- **Pricing Page**: Convert to client component with monthly/yearly toggle (useState); add gradient border and scale effect on highlighted "Professional" plan; add "🔥 Most Popular" badge; add trust signals ("No credit card required", "Cancel anytime"); rewrite feature copy to be outcome-focused
- **Dashboard Hub Page**: Convert to client component; add personalized greeting header ("Welcome back, Jayanth 👋") with growth indicator; add Net Worth Summary top card; add Assets vs Liabilities line chart (Recharts); add Insights section with trend indicators; add Goals progress section; add Quick Actions row
- **New Reusable Components**: `NetWorthCard`, `InsightCard`, `PricingCard`, `GradientBackground`, `SectionContainer` — all with Framer Motion micro-interactions (hover lift, fade-in on scroll, button scale/tap)
- **Design System**: Consistent use of `rounded-2xl`, `shadow-lg`/`hover:shadow-xl`, purple-to-indigo gradients, glassmorphism (`backdrop-blur-md bg-white/70`), and Framer Motion entrance animations across all pages
- **New Dependency**: Add `framer-motion` package

## Capabilities

### New Capabilities
- `premium-ui-components`: Reusable animated UI components (NetWorthCard, InsightCard, PricingCard, GradientBackground, SectionContainer) with Framer Motion micro-interactions and consistent design tokens

### Modified Capabilities
- `home-page`: Hero section redesign with animated Recharts chart, glassmorphism background, updated copy, social proof, and animated CTA
- `pricing-page`: Monthly/yearly toggle, PricingCard component with gradient borders, outcome-focused copy, trust signals
- `dashboard-hub`: Personalized header, net worth summary card, interactive line chart, insight cards, goals progress, quick action buttons

## Impact

- **Code**: `app/src/app/page.tsx`, `app/src/app/pricing/page.tsx`, `app/src/app/dashboard/page.tsx` — significant UI rewrites (no API/logic changes)
- **New files**: `app/src/components/ui/NetWorthCard.tsx`, `InsightCard.tsx`, `PricingCard.tsx`, `GradientBackground.tsx`, `SectionContainer.tsx`
- **Dependencies**: `framer-motion` added to `package.json`
- **Client components**: Pricing page and dashboard hub page become `"use client"` (for useState/Framer Motion); home page gains a client sub-component for the animated chart
- **No breaking changes**: All existing business logic, API routes, hooks, and data flows remain untouched
