# Onboarding Guide — First 30 Minutes

Welcome to **Wealth Trek**, a personal balance sheet platform for tracking net worth, financial goals, and wealth progression. This guide gets you from a fresh clone to a running dev server with an understanding of the codebase in 20–30 minutes.

---

## 1. Prerequisites

Before you start, ensure you have:

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Python 3.10+** — [python.org](https://www.python.org) (for PDF text extraction via `pdfplumber`)
- **A Clerk account** — [clerk.com](https://clerk.com) (free tier is fine)
- **A Supabase account** — [supabase.com](https://supabase.com) (free tier is fine)
- **Git** for cloning the repository

Optional:
- **Razorpay account** — [razorpay.com](https://razorpay.com) for testing payments (skip if not needed)

---

## 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/jayanthsd/networth-certificate-generator.git
cd networth-certificate-generator

# Navigate to the app directory (all commands run from here)
cd app

# Install dependencies
npm install

# Install Python dependency for PDF extraction
pip install pdfplumber
```

**Why `cd app`?** All npm scripts, tests, and dev server run from the `app/` subdirectory, not the repo root.

---

## 3. Environment Setup

Create a file `app/.env.local` in the project root:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # From Clerk Dashboard
CLERK_SECRET_KEY=sk_test_... # From Clerk Dashboard

# Clerk Redirect URLs (set these to localhost:3000/dashboard or your deployment URL)
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=http://localhost:3000/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=http://localhost:3000/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co # From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # From Supabase Settings → API

# OpenAI
OPENAI_API_KEY=sk-proj-... # From platform.openai.com

# Razorpay (optional, for payments)
RAZORPAY_KEY_ID=rzp_test_... # From Razorpay Settings → API Keys
RAZORPAY_KEY_SECRET=... # From Razorpay Settings → API Keys
```

### Where to Find Each Value

| Variable | Source |
|---|---|
| Clerk keys | Log into [dashboard.clerk.com](https://dashboard.clerk.com) → Your App → API Keys → copy Public Key and Secret Key |
| Clerk redirects | Set to your dev/production URL (localhost:3000 for dev) |
| Supabase URL & Key | Log into [app.supabase.com](https://app.supabase.com) → Your Project → Settings (gear icon) → API → copy Project URL and `anon` public key |
| OpenAI key | Log into [platform.openai.com](https://platform.openai.com) → API Keys → Create new secret key |
| Razorpay keys | Log into [razorpay.com](https://razorpay.com) → Account & Billing → Settings → API Keys (use **test keys** for development) |

---

## 4. Supabase Schema Setup

The app does **NOT** auto-create the Supabase schema (unlike SQLite which was auto-created locally). You must create the 6 tables manually.

### Quick Setup

1. Log into [app.supabase.com](https://app.supabase.com) → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Create statements table
CREATE TABLE IF NOT EXISTS statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  statement_type TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('asset', 'liability')),
  closing_balance NUMERIC NOT NULL CHECK (closing_balance >= 0),
  ownership_percentage NUMERIC NOT NULL CHECK (ownership_percentage >= 1 AND ownership_percentage <= 100),
  source_document_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_statements_user ON statements(user_id);

-- Create snapshots table
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_assets NUMERIC NOT NULL,
  total_liabilities NUMERIC NOT NULL,
  net_worth NUMERIC NOT NULL,
  entries_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_snapshots_user_date ON snapshots(user_id, date);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  full_name TEXT,
  address TEXT,
  certificate_date TEXT,
  as_on_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  suggested_goal_json JSONB
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC,
  target_date TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security on all tables
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for all tables (allow authenticated users to access their own rows)
CREATE POLICY "statements_user_isolation" ON statements FOR ALL USING ((auth.jwt()->>'sub') = user_id);
CREATE POLICY "snapshots_user_isolation" ON snapshots FOR ALL USING ((auth.jwt()->>'sub') = user_id);
CREATE POLICY "subscriptions_user_isolation" ON subscriptions FOR ALL USING ((auth.jwt()->>'sub') = user_id);
CREATE POLICY "user_profiles_user_isolation" ON user_profiles FOR ALL USING ((auth.jwt()->>'sub') = user_id);
CREATE POLICY "chat_messages_user_isolation" ON chat_messages FOR ALL USING ((auth.jwt()->>'sub') = user_id);
CREATE POLICY "goals_user_isolation" ON goals FOR ALL USING ((auth.jwt()->>'sub') = user_id);
```

5. Click **Run**
6. Verify: go to **Table Editor** → you should see all 6 tables

**What just happened?**
- Created 6 PostgreSQL tables matching the schema in `docs/data-model.md`
- Enabled Row-Level Security (RLS) so users can only access their own rows
- Added policies that match `auth.jwt()->>'sub'` (the Clerk user ID from the JWT) against the `user_id` column

---

## 5. Start the Dev Server

From the `app/` directory:

```bash
npm run dev
```

You should see:

```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll see the Wealth Trek landing page.

### Sign Up

1. Click **Get Started** or the **Sign Up** button
2. Enter an email (any email works in development)
3. Enter a password
4. Click **Create Account**
5. You'll be redirected to `/dashboard` (the overview page)

If you see an error, check:
- `.env.local` has all required Clerk variables
- Supabase URL and key are correct
- Network is accessible

---

## 6. Architecture Overview — Where to Find Things

**You are here:** Next.js 16 app with React 19, TailwindCSS 4, Clerk auth, Supabase database, OpenAI AI, and Razorpay payments.

| Task | Files |
|---|---|
| **Add a new API route** | `app/src/app/api/[feature]/route.ts` — Start by copying an existing route like `api/statements/route.ts`. Call `getAuthenticatedClient()` at the top to get `{ userId, supabase }`. Return 401 if either is null. |
| **Add a new dashboard page** | `app/src/app/dashboard/[page]/page.tsx` — Add `"use client"` at top. Use `useAuth()` from Clerk to check authentication. Add the page to `DashboardSidebar.tsx` navigation. |
| **Fetch data from a new API** | `app/src/hooks/use[Name].ts` — Follow the `useStatements.ts` pattern: `useEffect` → `fetch("/api/...")` → `setState` → return `{ data, loading, error, actions }`. |
| **Add a new UI component** | `app/src/components/[Name].tsx` — Use Recharts for charts, shadcn/ui for primitives, Framer Motion for animations. |
| **Change what's in PDF certificates** | `app/src/lib/generatePdf.ts` — Edit the jsPDF calls. This is client-side only. |
| **Add a new analytics insight** | `app/src/lib/insightsEngine.ts` — Add a `computeX()` function. Register it in `computeAllInsights()`. No LLM needed — use pure TypeScript. |
| **Add a wealth journey checklist item** | `app/src/lib/wealthChecklist.ts` — Add item definition, evaluation logic. Tests in `app/src/lib/__tests__/wealthChecklist.test.ts`. |
| **Change the AI chat prompt** | `app/src/app/api/chat/route.ts` — Edit `FINANCIAL_ADVISOR_SYSTEM_PROMPT` at the top of the file. |

---

## 7. Three Key Architectural Concepts

Before you write code, understand these:

### Concept 1: Clerk JWT Flows to Supabase

Every API route that touches Supabase must call `getAuthenticatedClient()` from `lib/db.ts`:

```typescript
// Inside an API route handler
import { getAuthenticatedClient } from "@/lib/db";

export async function GET(req: Request) {
  const { userId, supabase } = await getAuthenticatedClient();
  
  if (!userId || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Now use supabase client — it has the Clerk JWT as accessToken
  const { data, error } = await supabase
    .from("statements")
    .select("*")
    .eq("user_id", userId); // RLS will automatically enforce this
  
  return Response.json({ statements: data });
}
```

**Why?** The Supabase client has the Clerk JWT baked in as its `accessToken`. Supabase's RLS policies use this JWT to filter rows. You **must** use this authenticated client, not the plain browser client from `utils/supabase/client.ts`.

### Concept 2: Dashboard is Fully `"use client"` + Raw fetch

All `/dashboard/*` pages have `"use client"` at the top. There are **no React Server Components** inside the dashboard.

```typescript
// app/src/app/dashboard/snapshot/page.tsx
"use client";

import { useStatements } from "@/hooks/useStatements";
import { useEffect } from "react";

export default function SnapshotPage() {
  const { statements, loading, saveStatement } = useStatements();
  
  useEffect(() => {
    // Fetch happens here, not in a server component
  }, []);
  
  return <div>{/* render statements */}</div>;
}
```

**Why?** Simplicity and flexibility. No RSCs, no `generateMetadata`, no build-time data coupling. Data is fetched client-side via hooks using raw `fetch()`.

**If you add a new dashboard page**, follow this pattern:
1. Export default function (no async)
2. Add `"use client"` at top
3. Use custom hooks to fetch data
4. Return JSX

### Concept 3: Some Hooks Read localStorage, Not the API

**Know which ones:**

| Hook | Reads | Notes |
|---|---|---|
| `useStatements` | ✅ API (`/api/statements`) | Fully migrated |
| `useNetWorthHistory` | ✅ API (`/api/snapshots`) | Fully migrated |
| `useSubscription` | ✅ API (`/api/subscription`) | Fully migrated |
| `useFinancialGoals` | ❌ localStorage | API exists (`/api/goals`) but hook not yet updated |
| `useChatHistory` | ❌ localStorage | API exists (`/api/chat/messages`) but hook not yet updated |
| `useUserProfile` | ❌ localStorage | API exists (`/api/profile`) but hook not yet updated |
| `useAdvancedInputs` | ❌ localStorage | No server endpoint; local state only |
| `useDocuments` | ❌ localStorage | Files on server (`/api/documents/upload`), metadata in localStorage |

**If you need data to sync across devices or survive browser cache clearing**, avoid the ❌ hooks. Call the API directly or help migrate the hook to use the API.

---

## 8. Running Tests

From the `app/` directory:

```bash
# Run all tests with coverage
npm run test

# Run unit tests only (lib/ and hooks/)
npm run test:unit

# Run functional API tests
npm run test:functional

# Run a single test file
npx vitest run src/lib/__tests__/insightsEngine.test.ts
```

**Test structure:**
- Unit tests: `app/src/lib/__tests__/` and `app/src/hooks/__tests__/`
- Functional tests: `app/src/app/api/` (same directory as routes)
- E2E tests: Run via `npm run test:e2e` (uses Playwright; requires browser)

---

## 9. Common Development Tasks (Step-by-Step)

### Task A: Add a New Financial Statement Type Preset

**Goal**: Users can select from a dropdown list of common statement types (e.g., "Fixed Deposit", "Home Loan"). You want to add a new one.

**Steps**:

1. Open `app/src/types/index.ts`
2. Find `STATEMENT_TYPE_PRESETS` constant (line ~336)
3. Add a new entry:
   ```typescript
   { label: "Crypto Holdings", category: "asset" },
   ```
4. If the type needs special analytics treatment (e.g., "liquid asset" vs "productive"), update `INSIGHT_THRESHOLDS` in `app/src/lib/insightsEngine.ts`
5. Test: Run `npm run test:unit`, verify the form dropdown includes the new type

---

### Task B: Add a New API Endpoint with Auth

**Goal**: Create a new API route that requires Clerk auth and reads/writes to Supabase.

**Steps**:

1. Create `app/src/app/api/[feature]/route.ts` (e.g., `api/assets/route.ts`)
2. Copy the pattern from an existing route like `api/statements/route.ts`:
   ```typescript
   import { getAuthenticatedClient } from "@/lib/db";

   export async function GET(req: Request) {
     const { userId, supabase } = await getAuthenticatedClient();
     if (!userId || !supabase) {
       return Response.json({ error: "Unauthorized" }, { status: 401 });
     }
     const { data, error } = await supabase
       .from("my_table")
       .select("*")
       .eq("user_id", userId);
     if (error) {
       return Response.json({ error: error.message }, { status: 500 });
     }
     return Response.json({ data });
   }
   ```
3. Create the corresponding hook in `app/src/hooks/use[Feature].ts` (copy `useStatements.ts` as template)
4. Add tests in `app/src/app/api/[feature]/route.test.ts` (see `api/statements/route.test.ts` for examples)
5. Run `npm run test:functional` to verify

---

### Task C: Debug a Supabase RLS Error (403 or Empty Results)

**Symptom**: Your API route calls Supabase and gets empty results or a 403 error.

**Debugging steps**:

1. **Verify auth is working**:
   ```typescript
   const { userId, supabase } = await getAuthenticatedClient();
   console.log("userId:", userId, "supabase:", supabase ? "exists" : "null");
   ```
   If either is null, your Clerk setup is broken.

2. **Check RLS policies**:
   - Open Supabase → Table Editor → select table → **Security** tab
   - Verify RLS is **ON**
   - Verify policy exists: `(auth.jwt()->>'sub') = user_id`
   - RLS silently returns empty rows if policy doesn't match, it doesn't return 403

3. **Test the policy manually**:
   - In Supabase SQL Editor, run:
     ```sql
     SELECT current_user, auth.jwt()->>'sub' as clerk_id, * FROM statements LIMIT 1;
     ```
   - Verify the `auth.jwt()->>'sub'` matches the `user_id` column

4. **Check your query**:
   - Ensure you're filtering by `user_id`:
     ```typescript
     .eq("user_id", userId)
     ```
   - Supabase RLS is automatic, but explicit filtering helps debugging

5. **Verify the Clerk JWT is valid**:
   - In your API route, log the JWT:
     ```typescript
     const token = await auth.getToken();
     console.log("token:", token);
     ```

---

## 10. Key Files Reference

Keep this cheat-sheet handy:

| File | What | Why Useful |
|---|---|---|
| `app/src/lib/db.ts` | `getAuthenticatedClient()` | Use in every auth'd API route |
| `app/src/utils/supabase/server.ts` | Supabase client factory with Clerk JWT | Understand how auth is injected |
| `app/src/proxy.ts` | Next.js middleware | Protects `/dashboard/*` routes only |
| `app/src/types/index.ts` | All TypeScript types | Source of truth for data shapes |
| `app/src/lib/insightsEngine.ts` | 12-domain analytics | Add new insight domains here |
| `app/src/lib/wealthStage.ts` | Wealth stage classification | Adjust stage thresholds here |
| `app/src/lib/wealthChecklist.ts` | Stage-specific checklists | Add/edit checklist items here |
| `app/src/lib/generatePdf.ts` | PDF certificate generation | Change what's on the certificate |
| `docs/architecture.md` | Full system architecture | Deep dive on design decisions |
| `docs/data-model.md` | Database schema + types | Reference for all tables |
| `VISION.md` | Product roadmap | Understand what's being built next |

---

## Next Steps

✅ **You're ready to start!** Here's what to explore:

1. **Run the dev server** and click through the dashboard
2. **Read `docs/architecture.md`** for a deep dive on system design
3. **Check out `VISION.md`** to understand the product direction
4. **Pick a small task** from the task list above and try it
5. **Join the team Slack/Discord** for questions (if applicable)

Welcome to the team! 🚀
