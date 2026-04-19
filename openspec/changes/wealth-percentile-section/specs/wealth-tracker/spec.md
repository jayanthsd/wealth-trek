## ADDED Requirements

### Requirement: Display wealth percentile section
The Wealth Tracker page SHALL render a `<WealthPercentileSection />` component below the existing net worth trend chart and snapshot history.

#### Scenario: Section visible on page load
- **WHEN** user navigates to `/dashboard/wealth-tracker`
- **THEN** the wealth percentile section SHALL be rendered below the existing content without requiring any props

#### Scenario: Section fetches its own data
- **WHEN** the wealth percentile section is rendered
- **THEN** it SHALL independently fetch its data from the percentile API without depending on parent component state
