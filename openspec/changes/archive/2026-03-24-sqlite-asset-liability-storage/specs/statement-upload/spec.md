## MODIFIED Requirements

### Requirement: Auto-save to localStorage
The system SHALL automatically save all statement entries to the server-side SQLite database via API calls whenever entries are added, edited, or deleted, using the authenticated user's identity. Browser localStorage is no longer used for statement persistence.

#### Scenario: Data persists across page refresh
- **WHEN** user has added statement entries and refreshes the page
- **THEN** the system SHALL restore all previously entered statement entries from the server database via API

#### Scenario: Data accessible from another device
- **WHEN** user has added statement entries on device A and opens the app on device B while signed in
- **THEN** the system SHALL display all statement entries saved from device A
