## Context

The Wealth Tracker app is built with Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, shadcn/ui, Recharts 3, and Clerk auth. The current UI is functional but utilitarian — flat cards, static SVG charts, no animations, and no emotional engagement. The app already uses `recharts` and `lucide-react`. Framer Motion is not yet installed.

The three pages being redesigned:
- **Home** (`app/src/app/page.tsx`) — Server component with static SVG illustration
- **Pricing** (`app/src/app/pricing/page.tsx`) — Server component with static tier cards
- **Dashboard Hub** (`app/src/app/dashboard/page.tsx`) — Server component with navigation cards

## Goals / Non-Goals

**Goals:**
- Deliver a premium, Stripe/Linear/Vercel-quality visual experience across home, pricing, and dashboard pages
- Create 5 reusable animated components: `NetWorthCard`, `InsightCard`, `PricingCard`, `GradientBackground`, `SectionContainer`
- Add Framer Motion micro-interactions (hover lift, entrance fade, button scale/tap) consistently
- Replace static SVG chart on home page with animated Recharts `AreaChart` showing net worth projection
- Add monthly/yearly pricing toggle with smooth transition
- Enrich dashboard hub with summary cards, line chart, insights, goals progress, and quick actions
- Maintain full responsiveness (mobile + desktop)
- Use strict TypeScript (no `any`)

**Non-Goals:**
- No changes to business logic, API routes, hooks, or data fetching
- No changes to authentication flow or Clerk integration behavior
- No changes to the calculator, analytics, chat, goals, or wealth-tracker sub-pages
- No new API endpoints or data models
- No CSS modules or external CSS files — Tailwind only

## Decisions

### 1. Framer Motion as the animation library

**Choice**: Add `framer-motion` as a dependency.
**Rationale**: Industry standard for React animations, works seamlessly with Next.js App Router, supports `"use client"` components, and provides declarative animation primitives (`motion.div`, `whileHover`, `whileTap`, `AnimatePresence`).
**Alternatives considered**:
- CSS-only animations: Insufficient for orchestrated entrance animations and gesture-based interactions.
- `react-spring`: Less ergonomic API for the hover/tap patterns needed.

### 2. Client/Server component boundary strategy

**Choice**: Keep page-level files as thin server component wrappers where possible; extract animated sections into `"use client"` sub-components.
**Rationale**: Preserves SEO benefits for home and pricing pages. Only the interactive parts (chart, toggle, animated cards) need client-side JS.
**Specifics**:
- Home page: Server component shell → client `HeroChart` sub-component for the animated Recharts chart; client `AnimatedHero` for entrance animations
- Pricing page: Must be full `"use client"` due to `useState` for the monthly/yearly toggle pervading the entire page
- Dashboard hub: Must be full `"use client"` due to Framer Motion animations on all sections + potential data hooks for summary cards

### 3. Component architecture — 5 reusable components in `components/ui/`

| Component | Purpose | Props |
|---|---|---|
| `GradientBackground` | Glassmorphism backdrop with configurable gradient | `variant?: "purple" \| "emerald" \| "mixed"`, `blur?: boolean`, `children` |
| `SectionContainer` | Framer Motion wrapper for section entrance animations | `children`, `className?`, `delay?` |
| `NetWorthCard` | Top-level net worth display with change indicators | `netWorth: number`, `monthlyChange: number`, `percentageChange: number` |
| `InsightCard` | Insight message with trend direction | `title: string`, `description: string`, `trend?: "up" \| "down"` |
| `PricingCard` | Individual pricing tier with highlight/gradient border | `name`, `price`, `billing`, `features`, `cta`, `highlighted`, `yearlyPrice?` |

**Rationale**: Each component encapsulates a single UI concern, is independently testable, and follows existing shadcn/ui patterns in the codebase.

### 4. Design token consistency

**Choice**: Use Tailwind utility classes directly with a consistent vocabulary:
- Corners: `rounded-2xl` (cards), `rounded-xl` (buttons, inner elements)
- Shadows: `shadow-lg` default, `hover:shadow-xl` on interactive cards
- Gradients: `bg-gradient-to-r from-purple-500 to-indigo-500` (primary), `from-emerald-400 to-teal-500` (success)
- Glass: `backdrop-blur-md bg-white/70 dark:bg-gray-900/70`
- Entrance: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- Buttons: `whileHover={{ scale: 1.03 }}` `whileTap={{ scale: 0.97 }}`

**Rationale**: No custom CSS needed; Tailwind classes are already the project convention. Consistent tokens prevent visual drift.

### 5. Dashboard hub data approach

**Choice**: Use static/mock data for the redesigned dashboard hub's summary cards, chart, insights, and goals sections. The hub remains a navigation page — real data integration is a separate concern.
**Rationale**: The proposal explicitly states no business logic changes. The hub currently shows only navigation cards with no data. Adding real data hooks would require API changes out of scope. Mock data demonstrates the premium UI structure.

### 6. Chart library usage

**Choice**: Use Recharts (already installed, v3.8.0) for both the home page projection chart (AreaChart) and dashboard hub line chart (LineChart).
**Rationale**: Already a project dependency. Recharts 3 supports React 19. No need for a second charting library.

## Risks / Trade-offs

- **Bundle size increase** — Adding `framer-motion` (~30KB gzipped) increases client JS. → Mitigation: Only import in `"use client"` components; tree-shaking removes unused features.
- **Dashboard hub shows mock data** — Users may expect real data in summary/chart/insights sections. → Mitigation: Add subtle "sample data" indicators and connect to real hooks in a future change.
- **Pricing page becomes full client component** — Loses server-side rendering for SEO. → Mitigation: Pricing pages have low SEO impact; meta tags in layout still work. Acceptable trade-off for the toggle UX.
- **Animation performance on low-end devices** — Framer Motion animations could lag on old mobile devices. → Mitigation: Use `will-change` sparingly, keep animations to opacity/transform (GPU-composited properties only).
