# UI & Components

## Page Hierarchy

```
/                              Landing page (public)
/pricing                       Pricing page (public, auth-aware)
/dashboard                     Dashboard overview (protected)
/dashboard/wealth-tracker      Wealth Tracker — charts & snapshot history
/dashboard/snapshot            Net Worth Snapshot — statement entry & PDF generation
/dashboard/analytics           Analytics — comparisons, breakdowns, suggestions
/dashboard/health              Health Report — 12-domain financial health score
/dashboard/position            My Position — wealth stage, percentile, portfolio breakdown
/dashboard/chat                AI Financial Chat — streaming conversation
/dashboard/goals               Financial Goals — manage goals from chat or manual
/dashboard/action-plan         Action Plan — prioritised checklist items by stage
/dashboard/wealth-journey      Wealth Journey — stage history and progression
```

### Public Pages

- **Landing (`/`)** — Server-rendered. Hero section with animated chart, feature cards, social proof, CTA to sign up. Uses `Navigation` for the top bar.
- **Pricing (`/pricing`)** — Client-rendered. Three-tier pricing cards with monthly/yearly toggle. Auth-aware: unauthenticated users see sign-up CTA, authenticated users see Razorpay checkout or "Go to Dashboard".

### Protected Pages (Dashboard)

All dashboard pages are wrapped by `DashboardLayout` which:
1. Checks auth state via `useAuth()` — shows loading spinner or redirects to sign-in
2. Renders `DashboardSidebar` (collapsible on mobile) + top bar with Clerk `<UserButton />`
3. Passes children to a scrollable main content area

Dashboard sub-pages:

| Page | Key hooks | Key components | Purpose |
|---|---|---|---|
| **Overview** | `useNetWorthHistory`, `useFinancialGoals`, `useUserProfile` | `NetWorthCard`, `InsightCard`, Recharts `LineChart` | At-a-glance summary: net worth trend, quick actions, intelligence feed |
| **Wealth Tracker** | `useNetWorthHistory` | Recharts charts, snapshot table | Historical net worth line chart, expandable snapshot table |
| **Snapshot** | `useStatements`, `useDocuments`, `useUserProfile` | `StatementForm`, `StatementList`, `NetWorthSummary`, `DocumentUpload`, `DocumentList`, `ExtractionReview`, `UserProfileForm` | Full statement management, document extraction, PDF generation |
| **Analytics** | `useNetWorthHistory`, `useAdvancedInputs` | Recharts `PieChart`, dimension cards | Advanced dimension analysis (12 domains) with drill-down |
| **Health Report** | `useNetWorthHistory`, `useAdvancedInputs` | `WealthHealthScoreCard`, `DomainGroup`, `ScoreGauge` | Overall health score + 4 grouped domain breakdowns (Growing, Protecting, Optimising, Borrowing) |
| **My Position** | `useNetWorthHistory`, `useAdvancedInputs` | `StageStepper`, `WealthPercentileSection`, `BreakdownCard`, `ProgressChart` | Wealth stage, percentile ranking, portfolio pie charts, stage score history |
| **Wealth Journey** | `useNetWorthHistory`, `useAdvancedInputs` | `StageStepper`, `ProgressChart`, `ChecklistCard` | Stage checklist progress and multi-snapshot stage history |
| **Action Plan** | `useNetWorthHistory`, `useAdvancedInputs` | Prioritised checklist items | Top action items ranked by weight and current score gap |
| **Chat** | `useChatHistory`, `useNetWorthHistory`, `useFinancialGoals` | Custom chat UI, streaming message display | AI financial advisor with goal extraction |
| **Goals** | `useFinancialGoals` | Goal cards with status actions | List, create, pause, resume, complete, delete financial goals |

---

## Component Categories

### Layout Components

| Component | File | Purpose |
|---|---|---|
| `Navigation` | `components/Navigation.tsx` | Public site top navbar. Logo, nav links (Home, Pricing, Dashboard), Clerk sign-in/sign-up buttons. Responsive with mobile hamburger menu. |
| `DashboardSidebar` | `components/DashboardSidebar.tsx` | Dashboard left sidebar. Six nav items with Lucide icons: Overview, Wealth Tracker, Calculator, Analytics, Chat, Goals. Highlights active route via `usePathname()`. Collapsible on mobile with animated toggle. |
| `DashboardLayout` | `app/dashboard/layout.tsx` | Auth gate + sidebar + top bar. Wraps all `/dashboard/*` pages. |

### Domain Components

| Component | File | Purpose |
|---|---|---|
| `StatementForm` | `components/StatementForm.tsx` | Add/edit a financial statement entry. Dropdown for statement type (from `STATEMENT_TYPE_PRESETS`), category auto-fill, closing balance input, ownership percentage slider. Supports both create and edit modes. |
| `StatementList` | `components/StatementList.tsx` | Table of all statement entries. Columns: type, description, category, closing balance, ownership %, effective value. Inline edit and delete actions. |
| `NetWorthSummary` | `components/NetWorthSummary.tsx` | Summary card showing total assets, total liabilities, and net worth. Computed from current statements using `computeTotals()`. Color-coded (green for positive, red for negative). |
| `DocumentUpload` | `components/DocumentUpload.tsx` | Drag-and-drop file upload zone. Accepts PDF, PNG, JPG (max 20MB). Shows upload progress. Calls `POST /api/documents/upload`. |
| `DocumentList` | `components/DocumentList.tsx` | List of uploaded documents with file info. "Extract" button triggers AI extraction. "Delete" button removes file from server. |
| `ExtractionReview` | `components/ExtractionReview.tsx` | Review modal for AI-extracted entries. Shows extracted entries in a table. User can accept, edit, or reject individual entries before saving as statements. |
| `UserProfileForm` | `components/UserProfileForm.tsx` | Form for user profile data (full name, address, certificate date, as-on date). Persisted via `useUserProfile` → `/api/profile`. Used for PDF certificate personalization. |
| `AdvancedInputsForm` | `components/AdvancedInputsForm.tsx` | Collapsible form for 9 numeric inputs (income, EMIs, monthly investment, age, insurance covers, PPF/VPF) and 2 boolean toggles (will, international funds). Saved via `useAdvancedInputs` → `/api/advanced-inputs`. Powers checklist evaluations and projections. |
| `WealthStageComponents` | `components/WealthStageComponents.tsx` | Collection of wealth-journey UI atoms: `StageStepper`, `DeltaBanner`, `TransitionBanner`, `ProjectionCallout`, `ProgressChart`, `ScoreGauge`. Used across Position and Health pages. |
| `HeroChart` | `components/HeroChart.tsx` | Animated sample chart on the landing page hero section. Displays a mock net worth growth curve using Recharts. |
| `AnimatedHero` | `components/AnimatedHero.tsx` | Landing page animated text blocks and CTA button. Uses Framer Motion for staggered fade-in entrance animations. |

### UI Primitives (shadcn/ui)

These are standard shadcn/ui components installed via the CLI. They follow the Radix UI + Tailwind pattern.

| Component | File | Notes |
|---|---|---|
| `Button` | `ui/button.tsx` | Variants: `default`, `outline`, `ghost`, `destructive`, `link`. Sizes: `default`, `sm`, `lg`, `icon`. |
| `Card` | `ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| `Dialog` | `ui/dialog.tsx` | Modal dialog with overlay. Used for edit forms and confirmations. |
| `Input` | `ui/input.tsx` | Standard text input with consistent styling. |
| `Label` | `ui/label.tsx` | Form field label. |
| `Select` | `ui/select.tsx` | Dropdown select with trigger, content, items, groups. |
| `Separator` | `ui/separator.tsx` | Horizontal or vertical divider line. |
| `Table` | `ui/table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |

### Custom UI Components

| Component | File | Purpose |
|---|---|---|
| `PricingCard` | `ui/PricingCard.tsx` | Pricing tier card with name, price, billing period, description, feature list, and a CTA action slot (accepts any React node). `highlighted` prop adds gradient border for the recommended plan. |
| `NetWorthCard` | `ui/NetWorthCard.tsx` | Dashboard card displaying a financial metric (e.g., total assets) with a label, formatted INR value, and optional trend indicator. |
| `InsightCard` | `ui/InsightCard.tsx` | Dashboard card for a financial insight. Title, description, and up/down trend arrow with color coding. |
| `IconBadge` | `ui/icon-badge.tsx` | Circular badge with a Lucide icon inside. Supports color tones: `primary`, `success`, `warning`. Used in feature showcases. |
| `GradientBackground` | `ui/GradientBackground.tsx` | Decorative radial gradient overlay. Used behind hero sections and cards for visual depth. |
| `SectionContainer` | `ui/SectionContainer.tsx` | Framer Motion wrapper that applies a fade-in-up animation with configurable delay. Wraps most page sections for consistent entrance animation. |

---

## Design Rationale

### Styling: TailwindCSS 4 + shadcn/ui

- **TailwindCSS 4** for utility-first styling with CSS-native variables. No `tailwind.config.js` — configuration is in `globals.css` using `@theme`.
- **shadcn/ui** provides accessible, unstyled component primitives (built on Radix UI) that are copy-pasted into the project and customized via Tailwind classes. This avoids dependency lock-in.
- **`cn()` utility** (`lib/utils.ts`) merges Tailwind classes using `clsx` + `tailwind-merge` to avoid class conflicts.

### Animation: Framer Motion

- Used for page section entrance animations (`SectionContainer`), button hover/tap micro-interactions, sidebar toggle, and the landing page hero.
- `AnimatePresence` is used for mount/unmount transitions (e.g., payment result feedback toast).

### Data Visualization: Recharts

- `LineChart` for net worth trends over time (dashboard overview, wealth tracker)
- `PieChart` for asset/liability composition breakdown (analytics)
- Responsive containers ensure charts adapt to all screen sizes.

### Icons: Lucide React

- Consistent icon set across the entire app. Used in sidebar nav, feature cards, badges, buttons, and status indicators.

### Theming & Dark Mode

- CSS custom properties defined in `globals.css` control colors, radii, and spacing
- Dark mode is supported via CSS `prefers-color-scheme` media query (automatic)
- Color tokens follow the shadcn/ui naming convention: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, etc.

### PDF Generation: Client-Side

- `jsPDF` + `jspdf-autotable` generates net worth certificates entirely in the browser
- No server round-trip needed — the PDF is built from the current statements and user profile data
- The certificate includes: header, user details, asset table, liability table, net worth total, and footer
