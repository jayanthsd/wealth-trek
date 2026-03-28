# Directory Structure

Annotated tree of the repository. Each entry explains what the directory or file is responsible for.

## Root

```
networth-certificate-generator/
├── app/                    # Next.js application (all source code lives here)
├── docs/                   # Developer documentation (you are here)
├── openspec/               # Change management — proposals, designs, specs, tasks
├── .windsurf/              # IDE workflows and skill definitions
├── VISION.md               # Product vision, roadmap, and design principles
└── vercel.json             # Vercel deployment config (disables telemetry)
```

## `app/` — Next.js Application

```
app/
├── src/                    # All application source code
│   ├── app/                # Next.js App Router — pages and API routes
│   ├── components/         # React components (domain + UI primitives)
│   ├── hooks/              # Custom React hooks (data fetching, state)
│   ├── lib/                # Server utilities, shared logic, configs
│   ├── types/              # TypeScript type definitions
│   └── proxy.ts            # Clerk middleware (route protection)
├── public/                 # Static assets (SVGs, favicons)
├── scripts/                # Server-side scripts
│   ├── extract_pdf_text.py # Python script for PDF text extraction via pdfplumber
│   └── requirements.txt    # Python dependencies (pdfplumber)
├── uploads/                # Uploaded documents (gitignored, created at runtime)
├── data/                   # SQLite database directory (gitignored, created at runtime)
├── .env.local              # Environment variables (gitignored)
├── package.json            # Node dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── components.json         # shadcn/ui component config
├── eslint.config.mjs       # ESLint configuration
└── next.config.ts          # Next.js configuration
```

## `app/src/app/` — Pages & API Routes

```
src/app/
├── layout.tsx              # Root layout — ClerkProvider, fonts, Vercel Analytics
├── page.tsx                # Landing page (/) — hero, features, CTA
├── globals.css             # Global styles, CSS custom properties, dark mode
├── favicon.ico             # App favicon
│
├── pricing/
│   └── page.tsx            # Pricing page — plan cards, billing toggle, Razorpay checkout
│
├── dashboard/
│   ├── layout.tsx          # Dashboard layout — auth gate, sidebar, top bar
│   ├── page.tsx            # Dashboard overview — net worth summary, charts, goals, insights
│   ├── wealth-tracker/
│   │   └── page.tsx        # Wealth Tracker — line chart (assets/liabilities/net worth over time), snapshot table
│   ├── calculator/
│   │   └── page.tsx        # Net Worth Calculator — statement entry, document upload, PDF generation
│   ├── analytics/
│   │   └── page.tsx        # Analytics — snapshot comparison, top movements, pie breakdown, suggestions
│   ├── chat/
│   │   └── page.tsx        # AI Financial Chat — streaming conversation with goal extraction
│   └── goals/
│       └── page.tsx        # Financial Goals — list, create, pause/resume/complete/delete goals
│
└── api/
    ├── statements/
    │   ├── route.ts        # GET (list) / POST (create) statements
    │   └── [id]/
    │       └── route.ts    # PUT (update) / DELETE a single statement
    ├── snapshots/
    │   ├── route.ts        # GET (list) / POST (create/upsert) snapshots
    │   └── [id]/
    │       └── route.ts    # DELETE a single snapshot
    ├── documents/
    │   ├── upload/
    │   │   └── route.ts    # POST — upload PDF/image files to server
    │   ├── extract/
    │   │   └── route.ts    # POST — AI extraction of financial entries from documents
    │   └── [id]/
    │       └── route.ts    # DELETE — remove uploaded document file
    ├── chat/
    │   └── route.ts        # POST — AI chat with SSE streaming response
    ├── payments/
    │   ├── create-order/
    │   │   └── route.ts    # POST — create Razorpay order for a plan
    │   └── verify/
    │       └── route.ts    # POST — verify Razorpay payment signature, create subscription
    └── subscription/
        └── route.ts        # GET — fetch current user's active subscription
```

## `app/src/components/` — React Components

```
components/
├── Navigation.tsx          # Public site navbar — logo, links, Clerk sign-in/up buttons
├── DashboardSidebar.tsx    # Dashboard sidebar — nav items with icons, mobile toggle
├── StatementForm.tsx       # Form for adding/editing a financial statement entry
├── StatementList.tsx       # Table displaying all statement entries with edit/delete
├── NetWorthSummary.tsx     # Summary card showing total assets, liabilities, net worth
├── DocumentUpload.tsx      # Drag-and-drop file upload for PDFs and images
├── DocumentList.tsx        # List of uploaded documents with extract/delete actions
├── ExtractionReview.tsx    # Review AI-extracted entries before saving as statements
├── UserProfileForm.tsx     # Form for name, address, certificate/as-on dates
├── HeroChart.tsx           # Animated chart displayed on the landing page hero
├── AnimatedHero.tsx        # Landing page animated text blocks and CTA button
│
└── ui/                     # Reusable UI primitives
    ├── button.tsx          # shadcn/ui Button with variants
    ├── card.tsx            # shadcn/ui Card, CardHeader, CardContent, CardFooter
    ├── dialog.tsx          # shadcn/ui Dialog (modal)
    ├── input.tsx           # shadcn/ui Input
    ├── label.tsx           # shadcn/ui Label
    ├── select.tsx          # shadcn/ui Select with trigger, content, items
    ├── separator.tsx       # shadcn/ui Separator
    ├── table.tsx           # shadcn/ui Table with header, body, row, cell
    ├── PricingCard.tsx     # Pricing tier card — price, features, CTA slot
    ├── NetWorthCard.tsx    # Dashboard card for net worth display with trend
    ├── InsightCard.tsx     # Dashboard card for financial insights
    ├── IconBadge.tsx       # Circular icon badge with color tones
    ├── GradientBackground.tsx  # Decorative gradient background overlay
    └── SectionContainer.tsx    # Framer Motion fade-in wrapper for page sections
```

## `app/src/hooks/` — Custom React Hooks

```
hooks/
├── useStatements.ts        # CRUD operations for statement entries via /api/statements
├── useNetWorthHistory.ts   # Fetch snapshots via /api/snapshots, compute chart data
├── useDocuments.ts         # Manage uploaded documents (client-side state)
├── useChatHistory.ts       # Chat message history (localStorage persistence)
├── useFinancialGoals.ts    # Financial goals CRUD (localStorage persistence)
├── useUserProfile.ts       # User profile form state (localStorage persistence)
├── useRazorpayCheckout.ts  # Full Razorpay checkout flow (create order → modal → verify)
└── useSubscription.ts      # Fetch active subscription status via /api/subscription
```

## `app/src/lib/` — Server Utilities & Shared Logic

```
lib/
├── db.ts                   # SQLite database initialization, schema, singleton connection
├── openai.ts               # OpenAI client singleton with API key validation
├── pricing.ts              # Canonical pricing config — plan IDs, amounts (paise), display strings
├── razorpay.ts             # Dynamic Razorpay Checkout script loader with caching
├── computations.ts         # Financial computations — effective value, totals, INR formatting
├── generatePdf.ts          # Client-side PDF certificate generation using jsPDF + autotable
├── extractionPrompt.ts     # System prompt for AI document extraction
└── utils.ts                # General utilities (cn class merger for Tailwind)
```

## `app/src/types/` — TypeScript Definitions

```
types/
└── index.ts                # All shared types: StatementEntry, UserProfile, NetWorthSnapshot,
                            # FinancialGoal, ChatMessage, ExtractedEntry, UploadedDocument,
                            # STATEMENT_TYPE_PRESETS constant
```

## `openspec/` — Change Management

```
openspec/
├── config.yaml             # OpenSpec schema configuration
├── specs/                  # Main feature specifications (15 capability specs)
│   ├── analytics/
│   ├── clerk-authentication/
│   ├── dashboard-hub/
│   ├── financial-chat/
│   ├── financial-goals/
│   ├── home-page/
│   ├── networth-computation/
│   ├── networth-history/
│   ├── pdf-certificate-generation/
│   ├── premium-ui-components/
│   ├── pricing-page/
│   ├── server-data-persistence/
│   ├── statement-upload/
│   ├── user-profile/
│   └── wealth-tracker/
└── changes/                # Individual change artifacts (proposals, designs, tasks)
    └── archive/            # Completed and archived changes
```
