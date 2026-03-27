## 1. Setup & Dependencies

- [x] 1.1 Install `framer-motion` package in `app/` directory
- [x] 1.2 Verify framer-motion works with Next.js 16 and React 19 by checking compatibility

## 2. Reusable UI Components

- [x] 2.1 Create `GradientBackground` component at `app/src/components/ui/GradientBackground.tsx` with variant prop (`"purple"` | `"emerald"` | `"mixed"`), optional blur, glassmorphism styling, and strict TypeScript interface
- [x] 2.2 Create `SectionContainer` component at `app/src/components/ui/SectionContainer.tsx` with Framer Motion fade-in/slide-up entrance animation, configurable delay, and className forwarding
- [x] 2.3 Create `NetWorthCard` component at `app/src/components/ui/NetWorthCard.tsx` with `netWorth`, `monthlyChange`, `percentageChange` props, INR currency formatting, color-coded trend arrows, and hover lift animation
- [x] 2.4 Create `InsightCard` component at `app/src/components/ui/InsightCard.tsx` with `title`, `description`, `trend` props, trend-aware icons (green up / red down / neutral), and entrance animation
- [x] 2.5 Create `PricingCard` component at `app/src/components/ui/PricingCard.tsx` with `name`, `price`, `billing`, `features`, `cta`, `highlighted`, `yearlyPrice` props, gradient border on highlighted, "🔥 Most Popular" badge, hover lift, and CTA button micro-interactions

## 3. Home Page Redesign

- [x] 3.1 Create client sub-component `HeroChart` at `app/src/components/HeroChart.tsx` with animated Recharts AreaChart showing net worth projection sample data
- [x] 3.2 Create client sub-component `AnimatedHero` at `app/src/components/AnimatedHero.tsx` wrapping the hero section with Framer Motion entrance animations and the glassmorphism GradientBackground
- [x] 3.3 Update `app/src/app/page.tsx` — replace static SVG chart with `HeroChart`, update headline to "Build your ₹1Cr journey with clarity, consistency, and confidence", change primary CTA to "Start Building Wealth" with hover scale+glow
- [x] 3.4 Add social proof section to home page — "Trusted by 10,000+ users" text with overlapping avatar group UI
- [x] 3.5 Wrap feature cards section with `SectionContainer` for staggered entrance animations
- [x] 3.6 Verify home page responsiveness on mobile (320px), tablet (768px), and desktop (1280px)

## 4. Pricing Page Redesign

- [x] 4.1 Convert `app/src/app/pricing/page.tsx` to `"use client"` component
- [x] 4.2 Add monthly/yearly toggle with `useState`, update all tier prices dynamically on toggle
- [x] 4.3 Replace inline tier card markup with `PricingCard` component usage for all three tiers
- [x] 4.4 Rewrite feature copy to be outcome-focused (e.g., "Track unlimited assets" → "Never lose sight of any asset in your portfolio")
- [x] 4.5 Add trust signals: "No credit card required" and "Cancel anytime" text below pricing section
- [x] 4.6 Add Framer Motion staggered entrance animations on all PricingCard components
- [x] 4.7 Verify pricing page responsiveness on mobile, tablet, and desktop

## 5. Dashboard Hub Page Redesign

- [x] 5.1 Convert `app/src/app/dashboard/page.tsx` to `"use client"` component
- [x] 5.2 Add personalized greeting header — "Welcome back, Jayanth 👋" with growth indicator subtext "Your wealth grew 3% this month" and entrance animation
- [x] 5.3 Add `NetWorthCard` at top of dashboard with sample net worth data (formatted INR, monthly change, percentage)
- [x] 5.4 Add Recharts `LineChart` section for assets vs liabilities trend using sample data, wrapped in `ResponsiveContainer`, with animate-on-mount
- [x] 5.5 Add insights section with 2-3 `InsightCard` components using sample data (e.g., "You saved ₹20,000 more than last month")
- [x] 5.6 Add goals progress section with progress bars and milestone labels using sample data
- [x] 5.7 Add quick actions row — "Add Asset", "Add Liability", "Generate Report" buttons with icons and Framer Motion hover/tap micro-interactions
- [x] 5.8 Wrap existing navigation cards grid with Framer Motion staggered entrance and hover lift animations
- [x] 5.9 Verify dashboard hub responsiveness on mobile, tablet, and desktop

## 6. Cross-Cutting Polish

- [x] 6.1 Ensure consistent design tokens across all pages: `rounded-2xl` cards, `shadow-lg`/`hover:shadow-xl`, purple-to-indigo gradients, glassmorphism where specified
- [x] 6.2 Verify no `any` types exist in any new or modified files
- [x] 6.3 Verify no business logic, API calls, hooks, or data flows were changed
- [x] 6.4 Run `npm run build` to confirm no TypeScript or build errors
