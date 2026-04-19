## ADDED Requirements

### Requirement: Fetch percentile data on mount
The component SHALL fetch the user's wealth percentile from `GET /api/wealth/percentile` on mount without requiring any props.

#### Scenario: Successful data fetch
- **WHEN** the component mounts and the API returns a valid result
- **THEN** the component SHALL render the full percentile UI with gauge, metrics, stage stepper, and milestones

#### Scenario: API returns NO_STATEMENTS error
- **WHEN** the API returns `{ error: "NO_STATEMENTS" }`
- **THEN** the component SHALL display an empty state with message "Connect your accounts to see where you stand" and a CTA button linking to the snapshot page

#### Scenario: Data is loading
- **WHEN** the API call is in progress
- **THEN** the component SHALL display a loading skeleton with pulse animation placeholders for gauge, metrics, and stage stepper

### Requirement: Display SVG semicircle gauge
The component SHALL render a 180-degree arc SVG gauge showing the user's percentile position.

#### Scenario: Gauge reflects percentile
- **WHEN** percentile is 75
- **THEN** the gauge fill arc SHALL extend to 75% of the semicircle, with color transitioning from green to purple

#### Scenario: Gauge labels
- **WHEN** the gauge is rendered
- **THEN** the gauge SHALL display "0" at the left end, "100" at the right end, and the percentile number in the center

### Requirement: Display wealth stage stepper
The component SHALL render a horizontal stepper showing all 6 wealth stages with visual indicators for past, active, and future stages.

#### Scenario: Active stage highlighted
- **WHEN** user is in "Flourishing" stage
- **THEN** "Starting Out", "Building", and "Steady" nodes SHALL be filled green, "Flourishing" SHALL be purple, and "Thriving"/"Abundant" SHALL be hollow gray

#### Scenario: Stage names visible
- **WHEN** the stepper is rendered
- **THEN** each node SHALL have its stage name displayed beneath it

### Requirement: Display milestones list
The component SHALL display all milestones with their status (reached, next, or future).

#### Scenario: Milestone reached
- **WHEN** user's net worth exceeds a milestone amount
- **THEN** that milestone SHALL show a green dot and "Reached" label

#### Scenario: Next milestone
- **WHEN** a milestone is the next target
- **THEN** that milestone SHALL show a purple dot, a mini progress bar, and percentage progress

#### Scenario: Future milestone
- **WHEN** a milestone is beyond the next target
- **THEN** that milestone SHALL show a gray dot and muted label

### Requirement: Display metric tiles
The component SHALL display formatted net worth and next milestone distance in a 2-column layout.

#### Scenario: Net worth formatting
- **WHEN** net worth is 1500000
- **THEN** the metric tile SHALL display "₹15L" using Indian number formatting

#### Scenario: Next milestone distance
- **WHEN** next milestone is 2500000 and net worth is 1500000
- **THEN** the tile SHALL display the distance as "₹10L away"

### Requirement: Refresh button re-fetches data
The component SHALL provide a refresh icon button that re-fetches percentile data without showing the full loading skeleton.

#### Scenario: Refresh in progress
- **WHEN** user clicks the refresh button
- **THEN** the refresh icon SHALL show a subtle spinner animation while the API call is in progress, and update the UI when complete

### Requirement: Responsive layout
The component SHALL stack gauge and info card vertically on mobile and display side-by-side on desktop.

#### Scenario: Mobile viewport
- **WHEN** viewport width is below the sm breakpoint
- **THEN** the gauge and info card SHALL stack vertically

#### Scenario: Desktop viewport
- **WHEN** viewport width is at or above the md breakpoint
- **THEN** the gauge and info card SHALL display side by side
