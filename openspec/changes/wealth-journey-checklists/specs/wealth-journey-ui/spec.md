## ADDED Requirements

### Requirement: Display current wealth stage
The page SHALL display the user's current wealth stage with its label, color, mindset tagline, and stage goal. The stage SHALL be visually prominent as the primary heading element.

#### Scenario: Foundation stage display
- **WHEN** the user's net worth classifies as "foundation"
- **THEN** the page SHALL show "Foundation" as the stage label with the corresponding color and mindset text

#### Scenario: Stage transition detected
- **WHEN** the user's stage has changed since the previous snapshot
- **THEN** the page SHALL display a congratulatory transition indicator showing the previous and current stage

### Requirement: Render stage stepper
The page SHALL display a horizontal stage progression stepper showing all five stages in order. The current stage SHALL be visually highlighted. Completed (lower) stages SHALL appear as filled/checked. Future stages SHALL appear as dimmed/locked.

#### Scenario: User in acceleration stage
- **WHEN** user is in "acceleration" stage (index 2)
- **THEN** foundation (0) and stability (1) SHALL appear completed, acceleration (2) SHALL appear active/highlighted, optimization (3) and preservation (4) SHALL appear dimmed

#### Scenario: Progress toward next stage
- **WHEN** the user is 75% toward the next stage boundary
- **THEN** the stepper SHALL show a progress indicator (bar or percentage) on the current stage segment

### Requirement: Display interactive checklist
The page SHALL display checklist items for the user's current stage as a card list. Each card SHALL show the item label, evaluation status (done/partial/todo/not_applicable), message, and action hint if present.

#### Scenario: Done item rendering
- **WHEN** a checklist item has status "done"
- **THEN** the card SHALL display a green check icon and the success message

#### Scenario: Todo item rendering
- **WHEN** a checklist item has status "todo"
- **THEN** the card SHALL display a red/orange circle icon, the explanation message, and the actionHint as a call-to-action

#### Scenario: Partial item rendering
- **WHEN** a checklist item has status "partial"
- **THEN** the card SHALL display a yellow/amber half-check icon, the progress message, and the actionHint

#### Scenario: Not applicable item rendering
- **WHEN** a checklist item has status "not_applicable"
- **THEN** the card SHALL display a muted/grey lock icon with the "needs data" message and a link/prompt to fill advanced inputs

### Requirement: Display composite stage score
The page SHALL display the composite stage score as a gauge or prominent number (0–100) with the stage-specific score label (e.g., "Financial Stability Score: 72").

#### Scenario: Score gauge rendering
- **WHEN** the composite score is 72 and stage is "foundation"
- **THEN** the page SHALL display "Financial Stability Score" as the label and 72 as the value with a visual gauge

#### Scenario: Insufficient data
- **WHEN** all checklist items are "not_applicable"
- **THEN** the page SHALL display the score as unavailable with a message to add more financial data

### Requirement: Display historical progress
The page SHALL show a timeline or chart of the user's composite score over time, using data from all historical snapshots.

#### Scenario: Multiple snapshots
- **WHEN** the user has 6 snapshots spanning 6 months
- **THEN** the page SHALL render a line chart or sparkline showing score values at each snapshot date, with stage transition points marked

#### Scenario: Single snapshot
- **WHEN** only 1 snapshot exists
- **THEN** the page SHALL show the current score with a message "Track your progress over time by adding more snapshots"

### Requirement: Prompt for advanced inputs
The page SHALL display a non-intrusive prompt when checklist items cannot be evaluated due to missing advanced inputs, directing the user to the advanced inputs form.

#### Scenario: Multiple items need data
- **WHEN** 3 or more checklist items return "not_applicable"
- **THEN** the page SHALL show a banner saying "Fill in your financial details to unlock X more checklist items" with a link to the advanced inputs form

### Requirement: Loading and empty states
The page SHALL display a skeleton loading state while data is being fetched and an empty state if no snapshots exist.

#### Scenario: Loading
- **WHEN** the API call is in progress
- **THEN** the page SHALL display skeleton placeholders for the stage, checklist, and score sections

#### Scenario: No snapshots
- **WHEN** the user has zero snapshots
- **THEN** the page SHALL display a message guiding them to create their first snapshot with a link to the calculator

### Requirement: Navigation from dashboard
The dashboard hub page SHALL include a navigation card for the Wealth Journey page, consistent with existing dashboard cards.

#### Scenario: Dashboard card
- **WHEN** the user visits the dashboard hub
- **THEN** a "Wealth Journey" card SHALL be visible with an icon and brief description, linking to `/dashboard/wealth-journey`
