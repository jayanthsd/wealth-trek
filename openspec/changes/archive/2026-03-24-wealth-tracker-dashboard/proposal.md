## Why

The application currently serves a single purpose: generating net worth certificates. Users calculate their net worth once and download a PDF. There is no mechanism to track net worth over time, analyze trends, set financial goals, or receive guidance. Expanding into a wealth tracker transforms the app from a one-time utility into an ongoing financial discipline tool that users return to regularly — increasing engagement and value.

## What Changes

- **Replace the current single-page dashboard** with a card-based hub that routes to dedicated feature pages: Wealth Tracker, Net Worth Calculator, Analytics, Chat, and Goals.
- **Introduce Wealth Tracker page** that displays asset and liability trends over time, sourced from historical net worth calculations.
- **Persist net worth snapshots** so each completed calculation becomes a historical data point for trend analysis.
- **Introduce Analytics page** that provides insights on asset/liability movements (e.g., new loans impacting net worth, restructuring suggestions).
- **Introduce Chat page** with a financial advisor AI agent that can converse with the user and help build financial goals.
- **Introduce Goals page** where users can view and manage financial goals set via the chat agent.
- **Refactor existing certificate generation** into a dedicated Net Worth Calculator page accessible from the dashboard hub.

## Capabilities

### New Capabilities
- `dashboard-hub`: Card-based authenticated landing page with navigation cards for Wealth Tracker, Net Worth Calculator, Analytics, Chat, and Goals
- `wealth-tracker`: Trend visualization of assets, liabilities, and net worth over time using historical calculation data
- `networth-history`: Persistence of net worth calculation snapshots (date, assets, liabilities, net worth, line items) for historical tracking
- `analytics`: Insights on asset/liability movements with actionable suggestions (e.g., loan restructuring impact analysis)
- `financial-chat`: AI-powered financial advisor chat agent that converses with users and helps build financial goals
- `financial-goals`: Goal management page displaying goals created via the chat agent

### Modified Capabilities
- `home-page`: Update navigation and messaging to reflect the expanded wealth tracker positioning instead of certificate-only branding

## Impact

- **Routes**: New pages at `/dashboard`, `/dashboard/wealth-tracker`, `/dashboard/calculator`, `/dashboard/analytics`, `/dashboard/chat`, `/dashboard/goals`
- **State/Storage**: Need persistent storage for net worth snapshots (currently all data is localStorage-only; may need a backend/database for history)
- **Dependencies**: Charting library for trend visualization, OpenAI integration already present for chat agent
- **Existing code**: Current `/dashboard` page.tsx becomes the calculator page; a new hub page takes over `/dashboard`
