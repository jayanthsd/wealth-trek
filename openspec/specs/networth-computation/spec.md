# networth-computation Specification

## Purpose
TBD - created by archiving change networth-certificate-generator. Update Purpose after archive.
## Requirements
### Requirement: Compute effective value per entry
The system SHALL compute the effective value of each statement entry as: `closingBalance × ownershipPercentage / 100`.

#### Scenario: Full ownership effective value
- **WHEN** a statement entry has closing balance 500000 and ownership percentage 100
- **THEN** the effective value SHALL be 500000

#### Scenario: Partial ownership effective value
- **WHEN** a statement entry has closing balance 500000 and ownership percentage 50
- **THEN** the effective value SHALL be 250000

### Requirement: Compute total assets
The system SHALL compute total assets as the sum of effective values of all entries with category "asset".

#### Scenario: Multiple asset entries
- **WHEN** the user has asset entries with effective values 250000, 100000, and 75000
- **THEN** total assets SHALL be 425000

### Requirement: Compute total liabilities
The system SHALL compute total liabilities as the sum of effective values of all entries with category "liability".

#### Scenario: Multiple liability entries
- **WHEN** the user has liability entries with effective values 750000 and 50000
- **THEN** total liabilities SHALL be 800000

### Requirement: Compute net worth
The system SHALL compute net worth as: `Total Assets − Total Liabilities`.

#### Scenario: Positive net worth
- **WHEN** total assets are 1000000 and total liabilities are 400000
- **THEN** net worth SHALL be 600000

#### Scenario: Negative net worth
- **WHEN** total assets are 300000 and total liabilities are 500000
- **THEN** net worth SHALL be -200000

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

