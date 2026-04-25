## ADDED Requirements

### Requirement: Classify net worth into wealth stage
The system SHALL classify a net worth value into exactly one of five wealth stages based on fixed INR thresholds: Foundation (< ₹10,00,000), Stability (₹10,00,000 – ₹24,99,999), Acceleration (₹25,00,000 – ₹99,99,999), Optimization (₹1,00,00,000 – ₹3,49,99,999), Preservation (₹3,50,00,000 – ₹9,99,99,999). Net worth at or above ₹10,00,00,000 SHALL be classified as Preservation.

#### Scenario: Foundation stage
- **WHEN** net worth is 500,000
- **THEN** the system SHALL return stage id "foundation" with label "Foundation", color token "emerald", and mindset "Avoid financial fragility"

#### Scenario: Stability stage boundary
- **WHEN** net worth is exactly 1,000,000
- **THEN** the system SHALL return stage id "stability"

#### Scenario: Acceleration stage
- **WHEN** net worth is 5,000,000
- **THEN** the system SHALL return stage id "acceleration"

#### Scenario: Optimization stage
- **WHEN** net worth is 20,000,000
- **THEN** the system SHALL return stage id "optimization"

#### Scenario: Preservation stage
- **WHEN** net worth is 50,000,000
- **THEN** the system SHALL return stage id "preservation"

#### Scenario: Negative net worth
- **WHEN** net worth is -200,000
- **THEN** the system SHALL return stage id "foundation"

#### Scenario: Above maximum threshold
- **WHEN** net worth is 150,000,000
- **THEN** the system SHALL return stage id "preservation"

### Requirement: Return stage configuration
The system SHALL return a `StageConfig` object containing: `id` (WealthStage string), `label` (display name), `range` (min/max tuple in rupees), `color` (tailwind color token), `mindset` (one-sentence guiding principle), `goal` (one-sentence stage objective), and `stageIndex` (0-based position for ordering).

#### Scenario: Full config for foundation
- **WHEN** classifying net worth 300,000
- **THEN** the returned config SHALL include id "foundation", stageIndex 0, range [0, 1000000], and non-empty label, color, mindset, and goal strings

### Requirement: Detect stage transition between snapshots
The system SHALL accept two net worth values (current and previous) and return the stage classification for both, along with a boolean `transitioned` flag indicating whether the stage changed.

#### Scenario: Stage advancement
- **WHEN** previous net worth is 900,000 (foundation) and current is 1,100,000 (stability)
- **THEN** the system SHALL return transitioned as true with previousStage "foundation" and currentStage "stability"

#### Scenario: No stage change
- **WHEN** previous net worth is 500,000 and current is 800,000 (both foundation)
- **THEN** the system SHALL return transitioned as false

### Requirement: Compute proximity to next stage
The system SHALL compute the percentage progress toward the next stage boundary as `(netWorth - currentStageMin) / (nextStageMin - currentStageMin) * 100`. For the Preservation stage (final), progress SHALL be 100%.

#### Scenario: Halfway through foundation
- **WHEN** net worth is 500,000 (foundation range 0–1,000,000)
- **THEN** progress SHALL be 50.0

#### Scenario: Near stability boundary
- **WHEN** net worth is 950,000
- **THEN** progress SHALL be 95.0

#### Scenario: Preservation stage
- **WHEN** net worth is 50,000,000 (preservation, no next stage)
- **THEN** progress SHALL be 100.0

### Requirement: Provide all stage configurations
The system SHALL export an ordered array of all five stage configurations for UI rendering of stage steppers and progression visualizations.

#### Scenario: All stages array
- **WHEN** requesting all stage configurations
- **THEN** the system SHALL return exactly 5 StageConfig objects ordered by stageIndex 0 through 4
