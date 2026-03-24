## ADDED Requirements

### Requirement: Save net worth snapshot
The system SHALL allow users to save the current net worth calculation as a historical snapshot from the Net Worth Calculator page.

#### Scenario: User saves a snapshot
- **WHEN** user has completed a net worth calculation with at least one entry and clicks "Save Snapshot"
- **THEN** the system SHALL persist a snapshot containing the as-on date, total assets, total liabilities, net worth, and all line-item entries to localStorage

#### Scenario: Snapshot includes as-on date
- **WHEN** user saves a snapshot with as-on date "31-Mar-2026"
- **THEN** the snapshot SHALL record "31-Mar-2026" as the snapshot date

### Requirement: Prevent duplicate snapshots for same date
The system SHALL prevent saving multiple snapshots with the same as-on date, offering to overwrite instead.

#### Scenario: Duplicate date detected
- **WHEN** user attempts to save a snapshot with an as-on date that already exists in history
- **THEN** the system SHALL prompt the user to confirm overwriting the existing snapshot for that date

### Requirement: Persist snapshots in localStorage
The system SHALL store all net worth snapshots in localStorage under the key `networth-history` as a JSON array sorted by date.

#### Scenario: Snapshots persist across page refresh
- **WHEN** user has saved 3 snapshots and refreshes the page
- **THEN** the system SHALL restore all 3 snapshots from localStorage

### Requirement: Delete a snapshot
The system SHALL allow users to delete a historical snapshot from the Wealth Tracker page.

#### Scenario: User deletes a snapshot
- **WHEN** user clicks delete on a snapshot entry
- **THEN** the system SHALL remove the snapshot from localStorage and update the trend chart

### Requirement: Limit snapshot count
The system SHALL enforce a maximum of 50 snapshots, removing the oldest snapshot when the limit is exceeded.

#### Scenario: Snapshot limit reached
- **WHEN** user saves a 51st snapshot
- **THEN** the system SHALL remove the oldest snapshot and add the new one
