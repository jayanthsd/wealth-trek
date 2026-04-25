## ADDED Requirements

### Requirement: Authenticated journey endpoint
The system SHALL expose a `GET /api/wealth/journey` endpoint that requires Clerk authentication. Unauthenticated requests SHALL receive a 401 response.

#### Scenario: Unauthenticated request
- **WHEN** a request is made without a valid Clerk session
- **THEN** the system SHALL return HTTP 401 with body `{ "error": "Unauthorized" }`

#### Scenario: Authenticated request
- **WHEN** a request is made with a valid Clerk session
- **THEN** the system SHALL proceed with computation and return the journey result

### Requirement: Return complete journey result
The endpoint SHALL fetch all snapshots for the authenticated user, compute insights, classify the wealth stage, evaluate the checklist, compute the composite score, and return a JSON response containing: `stage` (current StageConfig), `previousStage` (StageConfig from second-latest snapshot, if exists), `transitioned` (boolean), `progress` (percentage toward next stage), `checklist` (array of ChecklistResult), `score` (object with value and label), and `stageHistory` (array of date/stage/score entries).

#### Scenario: User with multiple snapshots
- **WHEN** the user has 5 snapshots with latest net worth 1,500,000
- **THEN** the response SHALL include stage "stability", a checklist array with stability-stage items evaluated, a score object, and stageHistory with 5 entries

#### Scenario: User with single snapshot
- **WHEN** the user has 1 snapshot with net worth 300,000
- **THEN** the response SHALL include stage "foundation", checklist items evaluated (some may be "not_applicable"), score, and stageHistory with 1 entry

#### Scenario: User with no snapshots
- **WHEN** the user has 0 snapshots
- **THEN** the response SHALL return HTTP 200 with body `{ "stage": null, "checklist": [], "score": null, "stageHistory": [] }`

### Requirement: Include advanced inputs in evaluation
The endpoint SHALL fetch the user's advanced inputs (if stored) and pass them to the checklist evaluator for items that depend on income, insurance, SIP, or estate planning data.

#### Scenario: Advanced inputs available
- **WHEN** the user has saved advanced inputs with monthly_income and existing_health_cover
- **THEN** checklist items depending on those fields SHALL be evaluated (not "not_applicable")

#### Scenario: No advanced inputs
- **WHEN** the user has not saved advanced inputs
- **THEN** checklist items depending on advanced inputs SHALL return "not_applicable" status

### Requirement: Response performance
The endpoint SHALL compute and return the journey result within 500ms for users with up to 100 snapshots.

#### Scenario: Performance with large history
- **WHEN** the user has 100 snapshots
- **THEN** the endpoint SHALL return within 500ms
