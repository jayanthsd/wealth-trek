# Wealth Tracker — Product Vision

## One-liner

A **personal balance sheet platform** that gives individuals a 360-degree, year-over-year view of how they are moving toward their financial goals — with early warnings, fund-flow intelligence, and AI-guided planning.

---

## The Problem

Most people review their finances reactively — when tax season arrives, when a loan is due, or when something goes wrong. There is no lightweight, private tool that helps an individual:

- Maintain a **personal balance sheet** on a regular cadence and see how it evolves.
- Spot **red flags early** — rising liabilities, stagnant assets, over-concentration in a single instrument.
- Understand the **fund flow** — where new wealth is being created, where it's leaking, and how the composition shifts year over year.
- Turn those insights into **concrete goals** and track progress against them over months and years.

The result is financial blindness. People know they earn and spend, but they don't know whether they are *actually* getting richer or poorer in a structured, measurable way.

---

## The Vision

**Wealth Tracker** is the operating system for an individual's personal financial health — a single, private workspace where you record, analyze, plan, and act on your balance sheet data.

### Core Thesis

> *Wealth building is a marathon. You need a scoreboard, a coach, and a map — not just a single snapshot.*

| Pillar | What it means |
|---|---|
| **Record** | Capture your assets and liabilities regularly, with smart extraction from uploaded documents. |
| **Understand** | See how your balance sheet has changed — not just the totals, but the *flows* underneath. |
| **Flag** | Get proactive alerts when something looks off before it becomes a crisis. |
| **Plan** | Set goals with an AI advisor and track them against your real balance sheet data. |
| **Act** | Receive specific, actionable suggestions derived from your own numbers. |

---

## What Exists Today

The current repository implements the foundational layer:

### Built & Working

| Capability | Status | Details |
|---|---|---|
| **Net Worth Calculator** | ✅ Shipped | Statement entry (manual + AI document extraction), ownership %, effective values, PDF certificate generation |
| **Dashboard Hub** | ✅ Shipped | Card-based navigation to Wealth Tracker, Calculator, Analytics, Chat, Goals |
| **Snapshot History** | ✅ Shipped | Save/overwrite/delete snapshots, persisted in server-side SQLite with user isolation |
| **Wealth Tracker** | ✅ Shipped | Recharts line chart (assets, liabilities, net worth over time), expandable snapshot table |
| **Analytics** | ✅ Shipped | Snapshot-over-snapshot comparison, top movements detection, basic suggestions, asset/liability pie breakdown |
| **AI Financial Chat** | ✅ Shipped | OpenAI-powered advisor with streaming, context-aware (latest snapshot), goal extraction from conversation |
| **Financial Goals** | ✅ Shipped | Create from chat, list/manage/pause/resume/complete/delete goals |
| **Server Persistence** | ✅ Shipped | SQLite (better-sqlite3) for statements and snapshots with Clerk auth + user isolation |
| **Auth & Identity** | ✅ Shipped | Clerk authentication, protected dashboard routes |
| **Document Intelligence** | ✅ Shipped | PDF text extraction (pdfplumber) + image extraction (GPT-4o vision) → structured statement entries |

### Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: TailwindCSS 4, shadcn/ui, Recharts
- **Auth**: Clerk
- **AI**: OpenAI SDK (gpt-4o-mini for chat, gpt-4o for vision extraction)
- **Storage**: SQLite (statements, snapshots), localStorage (profile, chat history, goals)
- **Deployment**: Vercel-ready (with Vercel Analytics)

---

## Where We're Going — The Full Vision

### Phase 1: Deep Balance Sheet Intelligence *(Next)*

**Goal:** Go beyond simple totals — show the user *how and why* their balance sheet changed.

#### 1A. Fund Flow Analysis

The biggest gap today. Users can see that net worth went from ₹50L to ₹55L, but they can't see *where the ₹5L came from*.

**Fund flow analysis** answers:
- **Sources of wealth creation**: Which assets grew? By how much? What's new?
- **Wealth leakage**: Which liabilities increased? Did the user take on new debt?
- **Composition shift**: Is the user becoming more liquid or more illiquid? More leveraged or less?
- **Net flow by category**: e.g., "Real estate +₹12L, Mutual funds +₹3L, Home loan -₹2L (repaid)" → Net wealth creation of ₹17L this period.

Implementation approach:
- **Waterfall / Sankey chart**: Visual flow from previous snapshot to current — showing inflows, outflows, new items, removed items.
- **Category-level drill-down**: Group line items by statement type, show period-over-period change at category level.
- **Multi-period analysis**: Not just last-two-snapshot comparison — allow selecting any two snapshots or viewing rolling annual trends.

#### 1B. Red Flags & Health Indicators

Proactive alerts computed from snapshot history:

| Red Flag | Logic |
|---|---|
| **Debt-to-asset ratio rising** | `totalLiabilities / totalAssets` trending up over 3+ snapshots |
| **Net worth stagnation** | Net worth hasn't grown > 2% across 3 consecutive snapshots |
| **Over-concentration** | A single asset type > 60% of total assets |
| **New large liability** | A liability > 20% of total assets appeared in last snapshot |
| **Liquidity squeeze** | Liquid assets (savings, FD) declining while illiquid (real estate) growing |
| **Liability growth outpacing asset growth** | YoY liability growth % > asset growth % |

Display as:
- A **health score card** on the dashboard hub (e.g., "3 green, 1 amber, 1 red")
- Detailed **flag cards** on a dedicated section within Analytics or a new Health page
- **Trend sparklines** for each indicator over time

#### 1C. Enhanced Analytics

Upgrade the current analytics from "last two snapshots" to a proper analytical engine:

- **Time range selector** — compare any two snapshots, or view trailing 1Y / 3Y / 5Y / all-time
- **CAGR computation** — compound annual growth rate for net worth, assets, liabilities
- **Asset allocation drift** — how your mix has changed (e.g., "You were 40% equities 2 years ago, now 25%")
- **Milestone markers** — annotate key life events on the timeline (bought house, changed job, paid off loan)

---

### Phase 2: Goal Intelligence *(High Priority)*

**Goal:** Transform goals from static text entries into living, measurable targets tied to balance sheet data.

#### 2A. Structured Goal Creation

Move beyond free-text goals created in chat:

- **Goal types**: Net worth target, debt payoff, asset accumulation, savings rate, specific instrument target
- **Goal builder wizard**: Step-by-step guided creation (what, how much, by when, strategy)
- **AI-assisted**: Advisor suggests realistic targets based on current trajectory and historical growth rates

#### 2B. Automatic Progress Tracking

Connect goals to snapshot data:

- **Progress bar**: "You're 62% toward your ₹1Cr net worth goal"
- **Trajectory projection**: "At current pace, you'll reach this goal by March 2029" (with confidence band)
- **On-track / off-track signals**: Compare actual progress to the straight-line or projected path
- **Pace indicator**: "You need ₹15,000/month net worth growth to stay on track"

#### 2C. Goal Decomposition

Break big goals into trackable sub-goals:

- "Save ₹1Cr" → "Increase SIP by ₹10K/month" + "Reduce credit card outstanding to zero by Dec 2026" + "No new loans for 18 months"
- Track each sub-goal independently with its own progress metric

---

### Phase 3: Reporting & Accountability *(Medium Priority)*

#### 3A. Periodic Review Reports

Auto-generated reports at configurable intervals (monthly / quarterly / annual):

- Balance sheet summary with period-over-period comparison
- Fund flow waterfall for the period
- Goal progress update
- Red flags and action items
- PDF export for personal records

#### 3B. Personal Financial Scorecard

A single-page scorecard view:

- **Net worth trajectory** (spark chart)
- **Health indicators** (traffic light)
- **Goal progress** (progress bars)
- **Key metrics**: debt-to-asset ratio, liquidity ratio, diversification index, CAGR
- Designed to be reviewed in < 60 seconds as a "how am I doing?" check

---

### Phase 4: Smarter AI Advisor *(Medium Priority)*

#### 4A. Deep Context

Give the advisor full historical context, not just the latest snapshot:

- Complete snapshot history and trend analysis
- Goal progress and projections
- Red flag status
- Fund flow patterns

#### 4B. Proactive Nudges

The advisor doesn't just wait for questions — it can:

- Prompt for periodic reviews: "It's been 45 days since your last snapshot. Time to check in?"
- Surface insights: "Your mutual fund allocation has dropped from 30% to 18%. Want to discuss rebalancing?"
- Goal check-ins: "You're slightly behind on your debt payoff goal. Here are two options..."

#### 4C. Scenario Modeling

"What if" conversations backed by real data:

- "What if I pay off my car loan early?" → Show projected balance sheet
- "What if I increase SIP by ₹5000?" → Show projected net worth trajectory
- "What if I take a ₹20L home improvement loan?" → Show impact on health indicators

---

### Phase 5: Data Richness *(Lower Priority, High Impact)*

#### 5A. Finer-Grained Asset Tracking

Go beyond statement-level entries:

- **Sub-accounts**: Multiple entries per statement type (e.g., 3 mutual fund folios)
- **Market-linked valuation**: Optional integration for current NAV of mutual funds, stock prices
- **Property valuation**: Periodic property value updates

#### 5B. Income & Expense Integration (Optional, Long-term)

If the user provides income/expense data:

- **Savings rate tracking**: What % of income is becoming net worth?
- **Cash flow → Balance sheet bridge**: How monthly cashflow translates to balance sheet changes
- **Burn rate**: How long current liquid assets would last without income

#### 5C. Multi-Period Statements

Generate comparative balance sheets:

- Side-by-side: current year vs. prior year vs. 3 years ago
- Common-size analysis: every line item as a % of total assets
- Growth rates per line item

---

## Non-Goals (Guardrails)

These are explicitly **out of scope** to maintain focus:

- ❌ **Investment advisory / stock picks** — We analyze the balance sheet, not recommend specific securities
- ❌ **Transaction-level tracking** — This is not an expense tracker or bank account aggregator
- ❌ **Tax computation** — No tax planning or filing features
- ❌ **Multi-user / family accounts** — Single-user focus (family support is a future consideration)
- ❌ **Real-time market data feeds** — Manual entry is the core; market integrations are optional enrichment
- ❌ **Automated bank imports** — Privacy-first philosophy; user controls all data entry

---

## Design Principles

1. **Privacy first** — Financial data stays under user control. No third-party data sharing. Server storage is user-isolated.
2. **Cadence over complexity** — Encourage regular, simple check-ins over elaborate one-time setups.
3. **Balance sheet as the truth** — Everything anchors to the personal balance sheet. Goals, analytics, red flags — all derive from the same data.
4. **Show the "why" not just the "what"** — Don't just show totals. Show flows, composition shifts, and root causes.
5. **AI as copilot, not autopilot** — The advisor suggests and explains; the user decides and acts.

---

## Summary: From Certificate Generator → Personal Financial Operating System

```
TODAY                           VISION
─────                           ──────
Net worth calculator     →      Personal balance sheet platform
Static snapshots         →      Fund flow analysis & composition tracking
Basic suggestions        →      Red flags, health indicators, CAGR, ratios
Text-based goals         →      Measurable goals with auto-tracking & projections
Chat advisor             →      Context-rich advisor with proactive nudges & scenarios
One-page analytics       →      Multi-period analysis with milestone annotations
PDF certificates         →      Periodic review reports & financial scorecards
```

The repository today is the **Record** layer. The vision is to build the full stack: **Record → Understand → Flag → Plan → Act**.
