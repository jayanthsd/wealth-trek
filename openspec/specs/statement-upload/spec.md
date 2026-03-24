# statement-upload Specification

## Purpose
TBD - created by archiving change networth-certificate-generator. Update Purpose after archive.
## Requirements
### Requirement: Add financial statement entry
The system SHALL allow users to add a financial statement entry by providing: statement type, description, category (asset or liability), closing balance, and ownership percentage.

#### Scenario: Add a savings bank asset entry
- **WHEN** user selects statement type "Savings Bank Account", enters description "SBI Savings A/c", category "asset", closing balance 250000, and ownership percentage 100
- **THEN** the system SHALL add the entry to the statements list and display it in the appropriate assets section

#### Scenario: Add a loan liability entry
- **WHEN** user selects statement type "Home Loan", enters description "HDFC Home Loan", category "liability", closing balance 1500000, and ownership percentage 50
- **THEN** the system SHALL add the entry to the statements list and display it in the liabilities section with 50% ownership

### Requirement: Default ownership percentage
The system SHALL default the ownership percentage to 100% for every new statement entry.

#### Scenario: New entry has default ownership
- **WHEN** user begins adding a new statement entry
- **THEN** the ownership percentage field SHALL be pre-filled with 100

### Requirement: Ownership percentage validation
The system SHALL restrict ownership percentage to a value between 1 and 100 inclusive.

#### Scenario: Invalid ownership percentage rejected
- **WHEN** user enters an ownership percentage of 0 or greater than 100
- **THEN** the system SHALL display a validation error and prevent the entry from being saved

### Requirement: Statement type presets
The system SHALL provide preset statement types with default category mappings: Savings Bank Account (asset), Fixed Deposit (asset), PPF (asset), Mutual Fund (asset), Stock Holdings (asset), Real Estate (asset), Gold/Jewellery (asset), Other Asset (asset), Home Loan (liability), Personal Loan (liability), Car Loan (liability), Credit Card Outstanding (liability), Education Loan (liability), Other Liability (liability).

#### Scenario: Selecting a preset auto-fills category
- **WHEN** user selects "Mutual Fund" as the statement type
- **THEN** the system SHALL auto-set the category to "asset"

#### Scenario: Selecting a liability preset auto-fills category
- **WHEN** user selects "Home Loan" as the statement type
- **THEN** the system SHALL auto-set the category to "liability"

### Requirement: Edit statement entry
The system SHALL allow users to edit any existing statement entry's fields (statement type, description, category, closing balance, ownership percentage).

#### Scenario: Edit closing balance of existing entry
- **WHEN** user edits the closing balance of an existing entry from 250000 to 300000
- **THEN** the system SHALL update the entry and recalculate its effective value

### Requirement: Delete statement entry
The system SHALL allow users to delete any existing statement entry from the list.

#### Scenario: Delete a statement entry
- **WHEN** user clicks delete on a statement entry
- **THEN** the system SHALL remove the entry from the list and update all computed totals

### Requirement: Closing balance validation
The system SHALL require the closing balance to be a non-negative number.

#### Scenario: Negative closing balance rejected
- **WHEN** user enters a negative closing balance
- **THEN** the system SHALL display a validation error and prevent the entry from being saved

### Requirement: Auto-save to server database
The system SHALL automatically save all statement entries to the server-side SQLite database via API calls whenever entries are added, edited, or deleted, using the authenticated user's identity. Browser localStorage is no longer used for statement persistence.

#### Scenario: Data persists across page refresh
- **WHEN** user has added statement entries and refreshes the page
- **THEN** the system SHALL restore all previously entered statement entries from the server database via API

#### Scenario: Data accessible from another device
- **WHEN** user has added statement entries on device A and opens the app on device B while signed in
- **THEN** the system SHALL display all statement entries saved from device A

### Requirement: Extraction review accumulation
The extraction review widget SHALL accumulate entries from multiple document extractions, displaying all extracted entries together in a single consolidated view rather than replacing previous extractions.

#### Scenario: Extract from first document
- **WHEN** user extracts data from the first uploaded document
- **THEN** the system SHALL display the extracted entries in the review widget

#### Scenario: Extract from second document while first is pending review
- **WHEN** user extracts data from a second document while entries from the first document are still in the review widget
- **THEN** the system SHALL add the new entries to the existing review widget, preserving all entries from the first document

#### Scenario: Extract from multiple documents sequentially
- **WHEN** user extracts data from 3 documents sequentially (Document A, then B, then C)
- **THEN** the review widget SHALL display all entries from all 3 documents together, with each entry showing its source document name

#### Scenario: Prevent duplicate entries from same document
- **WHEN** user extracts data from the same document twice
- **THEN** the system SHALL only add entries from the second extraction if the document ID is different, preventing duplicate entries from the same source

#### Scenario: User edits are preserved during accumulation
- **WHEN** user edits an entry from Document A, then extracts from Document B
- **THEN** the system SHALL preserve the edited values from Document A while adding new entries from Document B

