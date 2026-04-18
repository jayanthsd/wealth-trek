## Why

New users who land on the dashboard see a static welcome card (`FirstSnapshotOnboarding`) that links them away to the full Snapshot form page. This creates a cold-start gap: users must context-switch to a separate page, figure out the form on their own, and come back. Drop-off at this stage is high because the first interaction feels like work, not guidance. A guided, multi-step onboarding wizard that captures the first balance sheet in-place will dramatically improve activation — users get their net worth number within minutes without leaving the dashboard context.

## What Changes

- **Replace `FirstSnapshotOnboarding`** with a new multi-step onboarding wizard component that walks users through capturing their first financial snapshot step-by-step.
- **Two onboarding paths**: Quick Start (~2 min, savings + loans + credit cards) and Complete Picture (~5 min, all asset/liability categories).
- **Per-step guided forms**: Bank savings, deposits/PF, investments, property/vehicles, loans, credit cards — each with an "add another" loop, skip option, and conversational headlines.
- **Auto-save on completion**: The wizard computes totals and saves the first snapshot automatically, then shows a celebratory summary with net worth breakdown.
- **Add `popular_banks` reference table** in Supabase with a `GET /api/banks` endpoint and `useBanks` hook, so the bank list is DB-managed and new banks can be added without code changes.
- **Progress bar & back navigation** across wizard steps.
- **Preserve dismiss behavior**: "I'll do this later" option retained with same `onDismiss` semantics.

## Capabilities

### New Capabilities
- `onboarding-wizard`: Multi-step guided onboarding wizard that replaces the static first-snapshot card, supports Quick Start / Complete Picture paths, collects asset & liability entries via friendly forms, and auto-saves the first snapshot.

### Modified Capabilities
- `dashboard-hub`: The dashboard page will swap `FirstSnapshotOnboarding` for the new onboarding wizard component (same trigger condition: `allLoaded && !hasSnapshots && !dismissed`).

## Impact

- **Components**: `FirstSnapshotOnboarding.tsx` replaced by new wizard component(s) under `app/src/components/`. The old component can be removed.
- **Dashboard page**: `app/src/app/dashboard/page.tsx` import and render updated to use the new wizard.
- **Database**: New `popular_banks` table in Supabase (public read, no RLS needed — reference data). Seeded with the initial 14 banks.
- **API**: New `GET /api/banks` route to fetch the bank list.
- **Hooks**: New `useBanks` hook. Existing `useStatements` (`bulkAddStatements`), `useNetWorthHistory` (`saveSnapshot`), `useUserProfile` consumed read-only — no changes to existing APIs.
- **Dependencies**: Uses existing shadcn/ui, framer-motion, Lucide, TailwindCSS. No new packages required.
- **Statement schema unchanged**: All entries map to the existing `StatementEntry` type and `statements` table.
