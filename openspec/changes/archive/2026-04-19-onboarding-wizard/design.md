## Context

New users (zero snapshots) currently see `FirstSnapshotOnboarding` — a static welcome card that links to `/dashboard/snapshot`. This requires a context switch and self-guided form filling. The onboarding-improvement spec calls for replacing it with an in-place multi-step wizard that captures the first balance sheet and auto-saves it as a snapshot.

**Current flow**: Dashboard → static card → link to `/dashboard/snapshot` → manual form → come back  
**New flow**: Dashboard → guided wizard (7 steps) → auto-saved snapshot → dashboard with data

The wizard reuses existing data hooks (`useStatements`, `useNetWorthHistory`) and the `StatementEntry` type. The only schema addition is a small `popular_banks` reference table for the bank picker.

## Goals / Non-Goals

**Goals:**
- Replace `FirstSnapshotOnboarding` with a multi-step wizard that captures the first snapshot in-place
- Support two paths: Quick Start (3 steps) and Complete Picture (7 steps)
- Auto-save entries and snapshot on completion
- Maintain the "I'll do this later" dismiss behavior
- Use existing UI primitives (shadcn/ui, framer-motion, Lucide, TailwindCSS)

**Non-Goals:**
- Mobile (Expo/React Native) version — follow-up change
- Editing entries within the wizard — users edit later on the Snapshot page
- Ownership percentage input — defaults to 100
- Changes to the `StatementEntry` schema or API endpoints
- Replacing the full Snapshot page form — wizard is onboarding only

## Decisions

### 1. Component architecture: parent wizard + step sub-components

**Choice**: One parent `OnboardingWizard` component that manages state and step navigation, with each step as a separate sub-component under `app/src/components/onboarding/`.

**Rationale**: Each step has distinct form logic (bank pickers, type pickers, amount inputs). Keeping them as separate files keeps each under ~100 lines and makes testing straightforward. The parent holds the unified entries array and orchestrates transitions.

**Alternative considered**: Single monolithic component with switch/case. Rejected — would be 500+ lines and hard to maintain.

### 2. State management: local state in parent, persist on final save only

**Choice**: The parent component holds a `StatementEntry[]` array in React state. Entries accumulate as the user progresses through steps. On the final "Done" step, everything is saved in one batch via `bulkAddStatements` + `saveSnapshot`.

**Rationale**: Avoids partial saves if the user abandons mid-wizard. The existing hooks already support bulk operations. No need for intermediate persistence since the wizard is a single session.

**Alternative considered**: Save per-step to the API. Rejected — creates orphaned entries if user abandons, and adds unnecessary network calls.

### 3. Quick Start vs Complete Picture: step filtering, not separate flows

**Choice**: Define all steps in an ordered array with a `quickStart: boolean` flag. The selected path filters which steps to render. Both paths share the same step components and summary logic.

**Rationale**: Eliminates code duplication. Adding/removing steps from either path is a config change. The step indicator adjusts dynamically based on the filtered step count.

### 4. Bank picker: DB-backed reference table + "Other" with free-text fallback

**Choice**: Create a `popular_banks` table in Supabase with columns `id`, `name`, and `sort_order`. Expose via `GET /api/banks` and a `useBanks` hook. The bank savings step fetches the list on mount and renders a selectable picker with an "Other" option that reveals a text input.

**Rationale**: Storing banks in the DB means adding/removing banks is a simple DB insert — no code deployment needed. The table is public reference data (no user_id, no RLS required). The initial seed contains the 14 popular Indian banks. A `sort_order` column allows controlling display order.

**Alternative considered**: Hardcoded `POPULAR_BANKS` constant in `types/index.ts`. Rejected — requires a code change and deployment to add a new bank, which is unnecessary friction for reference data.

### 5. Summary step: compute locally, save via existing hooks

**Choice**: On the summary step, call `computeTotals` from `lib/computations.ts` on the accumulated entries to display totals. Then call `bulkAddStatements` followed by `saveSnapshot` with today's date.

**Rationale**: Reuses existing computation logic. The two-call pattern (add entries, then save snapshot) matches how the existing snapshot page works.

### 6. Step transitions: framer-motion AnimatePresence with slide direction

**Choice**: Wrap steps in `AnimatePresence` with a directional slide (left for forward, right for back). Use `motion.div` with `key={currentStepIndex}` for proper exit/enter animations.

**Rationale**: Consistent with existing app animations. Provides clear spatial navigation metaphor.

## Risks / Trade-offs

- **Large component surface area** → Mitigated by breaking into sub-components and keeping step logic isolated.
- **User abandons mid-wizard with unsaved data** → Acceptable — no partial saves means no cleanup needed. The wizard reappears on next visit until dismissed.
- **Bank list fetch adds a network call** → Mitigated by caching in the `useBanks` hook (fetch once, reuse). The list is small (~15 rows) so latency is negligible. The "Other" option covers gaps if the fetch fails.
- **Auto-save failure on completion** → Show error toast with retry button. Don't navigate away until save succeeds.
- **Confetti/animation library** → Use CSS-based confetti or a lightweight package (e.g., `canvas-confetti`) to avoid bloat. If not already in deps, a simple CSS animation suffices.
