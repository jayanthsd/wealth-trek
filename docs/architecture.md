# Architecture

## System Overview

Wealth Tracker is a **personal balance sheet platform** built as a Next.js 16 application. Users record assets and liabilities, generate net worth certificates, track trends over time, and get AI-powered financial guidance.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  React 19 · TailwindCSS 4 · shadcn/ui · Recharts · Clerk UI    │
│  Framer Motion · jsPDF (client-side PDF generation)             │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP / SSE
┌──────────────────────────▼──────────────────────────────────────┐
│                   Next.js App Router (Server)                    │
│  API Routes (app/src/app/api/*) · Clerk Middleware (proxy.ts)    │
├──────────┬──────────┬──────────────┬────────────────────────────┤
│  SQLite  │  OpenAI  │  Razorpay    │  Python (pdfplumber)       │
│  (data)  │  (AI)    │  (payments)  │  (PDF text extraction)     │
└──────────┴──────────┴──────────────┴────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI** | React | 19.2.3 |
| **Styling** | TailwindCSS | 4.x |
| **Components** | shadcn/ui, Lucide icons, Framer Motion | — |
| **Charts** | Recharts | 3.8.x |
| **Auth** | Clerk (`@clerk/nextjs`) | 7.x |
| **Database** | SQLite via `better-sqlite3` | 12.x |
| **AI** | OpenAI SDK (`gpt-4o-mini` chat, `gpt-4o` vision) | 6.x |
| **Payments** | Razorpay | 2.9.x |
| **PDF Generation** | jsPDF + jspdf-autotable (client-side) | 4.x / 5.x |
| **PDF Extraction** | Python `pdfplumber` (server-side, spawned process) | ≥0.10 |
| **Deployment** | Vercel | — |

## Request Flow

All API requests follow this pattern:

```
Client (React hook / fetch)
  → Next.js API Route (app/src/app/api/*)
    → Clerk auth() to extract userId (returns 401 if unauthenticated)
    → Business logic (DB query, external API call, etc.)
    → JSON response back to client
```

**Exception:** The `/api/chat` route returns a **Server-Sent Events (SSE)** stream instead of JSON, enabling real-time token-by-token AI responses.

**Exception:** The `/api/documents/upload` and `/api/documents/[id]` routes do **not** use Clerk auth — document operations are session-scoped on the client side.

## Authentication Flow

Authentication is handled by **Clerk** at two levels:

1. **Middleware** (`app/src/proxy.ts`): Intercepts all requests. Routes matching `/dashboard(.*)` are protected — unauthenticated users are redirected to sign-in.

2. **API Route Guards**: Each protected API route calls `auth()` from `@clerk/nextjs/server` to extract `userId`. If absent, a `401 Unauthorized` response is returned. All database queries are scoped to the authenticated user's `userId`.

```
proxy.ts (Clerk middleware)
  ├── /dashboard/* → auth.protect() → redirect if not signed in
  └── /api/* → passes through (individual routes check auth())
```

### Client-Side Auth

- Public pages (`/`, `/pricing`) use `<SignUpButton>` / `<SignInButton>` from Clerk
- Dashboard pages use `useAuth()` hook to check `isSignedIn` state
- `DashboardLayout` wraps all `/dashboard/*` pages with auth gate + `<RedirectToSignIn />`

## Data Flow

The core data pipeline:

```
Manual Entry / Document Upload
        │
        ▼
   Statements (SQLite)          ← individual asset/liability line items
        │
        ▼
   Snapshots (SQLite)           ← point-in-time balance sheet (totals + entries JSON)
        │
   ┌────┴─────┐
   ▼          ▼
Analytics   Wealth Tracker      ← derived views (comparisons, charts)
   │
   ▼
AI Chat                         ← latest snapshot as context for advice
   │
   ▼
Financial Goals (localStorage)  ← extracted from chat or manually created
```

### Storage Strategy

| Data | Storage | Why |
|---|---|---|
| Statements | SQLite (server) | Multi-device access, Clerk-scoped user isolation |
| Snapshots | SQLite (server) | Same as above |
| Subscriptions | SQLite (server) | Payment records must be server-authoritative |
| User Profile | localStorage | Simple client-only form data, no server sync needed |
| Chat History | localStorage | Ephemeral conversation state |
| Financial Goals | localStorage | Lightweight; server migration planned for Phase 2 |

## Payment Flow (Razorpay)

```
Pricing Page (client)
  → POST /api/payments/create-order   (server creates Razorpay order)
  → Razorpay Checkout modal opens     (client-side, dynamic script load)
  → User completes payment
  → POST /api/payments/verify         (server verifies HMAC-SHA256 signature)
  → Subscription record saved to SQLite
  → GET /api/subscription             (client polls active subscription status)
```

- Server-side pricing config (`lib/pricing.ts`) is the canonical source of truth for amounts
- Razorpay Checkout script is loaded dynamically only when needed (`lib/razorpay.ts`)
- Signature verification uses `crypto.createHmac("sha256", secret)` on `orderId|paymentId`

## Document Intelligence Flow

```
User uploads PDF/image
  → POST /api/documents/upload        (file saved to uploads/ directory)
  → POST /api/documents/extract
      ├── PDF: spawn Python pdfplumber → extract text → GPT-4o-mini → structured entries
      └── Image: read file → base64 → GPT-4o vision → structured entries
  → User reviews extracted entries in ExtractionReview component
  → Approved entries saved as statements via POST /api/statements
```

## Environment Variables

All variables go in `app/.env.local`:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend auth |
| `CLERK_SECRET_KEY` | Yes | Clerk server auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Yes | Post sign-in redirect |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Yes | Post sign-up redirect |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Yes | Force redirect after sign-in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Yes | Force redirect after sign-up |
| `OPENAI_API_KEY` | Yes | OpenAI API (chat + extraction) |
| `RAZORPAY_KEY_ID` | For payments | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay test/live key secret |

## Deployment

- **Platform**: Vercel (configured via `vercel.json`)
- **Database path**: On Vercel, SQLite is stored at `/tmp/networth.db` (ephemeral). Locally, it's at `app/data/networth.db`.
- **Python dependency**: `pdfplumber` must be available on the server for PDF text extraction. On Vercel, this requires a custom build step or serverless function runtime.
- **Static assets**: Next.js handles static optimization automatically. Pages without server data are pre-rendered.

> **Note**: Since Vercel uses `/tmp` for SQLite, the database is ephemeral across deployments and cold starts. A persistent database solution (e.g., Turso, PlanetScale) is recommended for production.
