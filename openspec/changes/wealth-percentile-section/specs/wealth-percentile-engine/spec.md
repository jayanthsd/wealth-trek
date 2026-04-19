## ADDED Requirements

### Requirement: Compute wealth percentile via logarithmic interpolation
The system SHALL compute a user's wealth percentile using logarithmic interpolation between predefined India wealth distribution anchors.

#### Scenario: Net worth between two anchors
- **WHEN** net worth is 500000 (between anchor 300000 at 50th and 1000000 at 75th percentile)
- **THEN** the system SHALL return a percentile computed as `p1 + t*(p2-p1)` where `t = (log(500000) - log(300000)) / (log(1000000) - log(300000))`

#### Scenario: Net worth below lowest anchor
- **WHEN** net worth is 150000 (below 300000 anchor)
- **THEN** the system SHALL scale between 0 and 50 using the log ratio `50 * log(nw) / log(300000)`

#### Scenario: Net worth above highest anchor
- **WHEN** net worth is 50000000 (above 35000000 anchor at 99th percentile)
- **THEN** the system SHALL apply slow log growth beyond 99, capped at 99.9

#### Scenario: Zero or negative net worth
- **WHEN** net worth is 0 or negative
- **THEN** the system SHALL return percentile 0

### Requirement: Classify wealth stage
The system SHALL classify a user into a wealth stage based on their computed percentile.

#### Scenario: Percentile maps to correct stage
- **WHEN** computed percentile is 82
- **THEN** the system SHALL return stage "Flourishing" (highest stage with minPercentile ≤ 82)

#### Scenario: Low percentile stage
- **WHEN** computed percentile is 10
- **THEN** the system SHALL return stage "Starting Out"

### Requirement: Determine next milestone
The system SHALL identify the next wealth milestone above the user's current net worth from the predefined milestones list [3L, 10L, 25L, 1Cr, 3.5Cr, 10Cr].

#### Scenario: Net worth below a milestone
- **WHEN** net worth is 1500000
- **THEN** the system SHALL return 2500000 as the next milestone

#### Scenario: Net worth above all milestones
- **WHEN** net worth is 150000000
- **THEN** the system SHALL return null (no next milestone)

### Requirement: Compute progress to next milestone
The system SHALL compute progress as percentage between previous and next milestone.

#### Scenario: Mid-progress between milestones
- **WHEN** net worth is 1500000 (previous milestone 1000000, next milestone 2500000)
- **THEN** the system SHALL return progress approximately 33.3%

#### Scenario: Beyond all milestones
- **WHEN** net worth exceeds all milestones
- **THEN** the system SHALL return progress 100

### Requirement: Generate insight message
The system SHALL generate a human-readable insight message combining percentile position and next milestone target.

#### Scenario: User has a next milestone
- **WHEN** percentile is 82 and next milestone is 2500000
- **THEN** the system SHALL return a message like "You're ahead of 82% of Indians. Reach ₹25L to move to Thriving."

#### Scenario: User beyond all milestones
- **WHEN** net worth is above all milestones
- **THEN** the system SHALL return a congratulatory message acknowledging top position

### Requirement: Return complete percentile result
The system SHALL return a composite result object containing netWorth, percentile, stage, nextMilestone, progressToNext, insightMessage, and milestonesStatus array.

#### Scenario: Full result structure
- **WHEN** `getWealthPercentileResult` is called with a valid net worth
- **THEN** the system SHALL return an object with all fields populated including a milestonesStatus array where each entry has amount, percentile, reached (boolean), and isNext (boolean)
