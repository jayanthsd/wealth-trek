## MODIFIED Requirements

### Requirement: Display live summary
The system SHALL display a live summary showing total assets, total liabilities, and net worth that updates in real-time as entries are added, edited, or deleted. Summary data is computed from entries fetched from the server-side database.

#### Scenario: Summary updates on entry change
- **WHEN** user adds a new asset entry with effective value 100000
- **THEN** the total assets and net worth in the summary SHALL immediately reflect the addition

#### Scenario: Snapshots saved to server database
- **WHEN** user saves a net worth snapshot
- **THEN** the system SHALL persist the snapshot to the server-side SQLite database via API, enabling cross-device access to historical trend data

#### Scenario: Snapshots loaded from server database
- **WHEN** user opens the wealth tracker dashboard
- **THEN** the system SHALL load all historical net worth snapshots from the server database for trend visualization
