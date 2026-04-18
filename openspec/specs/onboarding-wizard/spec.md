# Onboarding Wizard

## Purpose

This specification defines the requirements for the onboarding wizard that guides new users through capturing their first financial snapshot via a multi-step wizard.

## Requirements

### Requirement: Onboarding wizard renders for new users
The system SHALL display the onboarding wizard in place of the regular dashboard when the user has zero snapshots and has not dismissed the wizard.

#### Scenario: New user sees wizard
- **WHEN** an authenticated user with zero snapshots navigates to `/dashboard`
- **THEN** the system SHALL display the onboarding wizard instead of the standard dashboard hub

#### Scenario: Dismissed user sees dashboard
- **WHEN** an authenticated user dismisses the wizard via "I'll do this later"
- **THEN** the system SHALL hide the wizard and display the standard dashboard hub (empty state)

### Requirement: Welcome step offers two onboarding paths
The system SHALL display a welcome step with headline "You've taken a great step toward building wealth. Let's see where you stand today." and two path options: Quick Start (~2 min) and Complete Picture (~5 min).

#### Scenario: User selects Quick Start
- **WHEN** user selects the Quick Start path
- **THEN** the wizard SHALL proceed through only Steps 1, 5, and 6 (Bank Savings, Loans, Credit Cards)

#### Scenario: User selects Complete Picture
- **WHEN** user selects the Complete Picture path
- **THEN** the wizard SHALL proceed through all steps (Steps 1–6)

### Requirement: Bank Savings step collects savings accounts
The system SHALL display a Bank Savings step with headline "Let's start with your bank savings" that allows the user to add one or more savings accounts, each with a bank picker (fetched from the `popular_banks` DB table via `useBanks` hook + "Other" free-text) and closing balance amount.

#### Scenario: User adds a savings account
- **WHEN** user selects a bank from the picker and enters a closing balance
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Savings Bank Account"`, `category: "asset"`, `description` set to the bank name, and `ownershipPercentage: 100`

#### Scenario: User adds multiple accounts
- **WHEN** user clicks "Add another account" after filling an account
- **THEN** the system SHALL display a new empty account form row

#### Scenario: User skips bank savings
- **WHEN** user clicks "I don't have any" or the skip option
- **THEN** the wizard SHALL proceed to the next step with zero savings entries

### Requirement: Deposits & Provident Fund step collects deposit entries
The system SHALL display a Deposits & PF step (Complete Picture only) with headline "Any fixed deposits or provident fund?" and a type picker for Fixed Deposit, PPF, and EPF, with optional description and amount.

#### Scenario: User adds a fixed deposit
- **WHEN** user selects "Fixed Deposit" type and enters an amount
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Fixed Deposit"`, `category: "asset"`, and `ownershipPercentage: 100`

#### Scenario: User adds EPF
- **WHEN** user selects "EPF" type and enters an amount
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Other Asset"`, `description: "EPF"`, `category: "asset"`, and `ownershipPercentage: 100`

#### Scenario: User skips deposits
- **WHEN** user clicks the skip option
- **THEN** the wizard SHALL proceed to the next step with zero deposit entries

### Requirement: Investments step collects investment entries
The system SHALL display an Investments step (Complete Picture only) with headline "Any investments?" and a type picker for Mutual Fund, Stock Holdings, and Gold/Jewellery, with optional description and amount.

#### Scenario: User adds a mutual fund
- **WHEN** user selects "Mutual Fund" type and enters an amount
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Mutual Fund"`, `category: "asset"`, and `ownershipPercentage: 100`

#### Scenario: User skips investments
- **WHEN** user clicks the skip option
- **THEN** the wizard SHALL proceed to the next step with zero investment entries

### Requirement: Property & Vehicles step collects property and vehicle entries
The system SHALL display a Property & Vehicles step (Complete Picture only) with headline "Do you own any property or vehicles?" and a type picker for Real Estate and Vehicle, with description and fair market value.

#### Scenario: User adds real estate
- **WHEN** user selects "Real Estate" type, enters a description and value
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Real Estate"`, `category: "asset"`, and `ownershipPercentage: 100`

#### Scenario: User adds a vehicle
- **WHEN** user selects "Vehicle" type, enters description and value
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Other Asset"`, `description` containing vehicle info, `category: "asset"`, and `ownershipPercentage: 100`

#### Scenario: User skips property
- **WHEN** user clicks the skip option
- **THEN** the wizard SHALL proceed to the next step with zero property entries

### Requirement: Loans step collects loan entries
The system SHALL display a Loans step with headline "Now let's record any loans" and a type picker for Home Loan, Personal Loan, Car Loan, and Education Loan, with optional description and outstanding amount.

#### Scenario: User adds a home loan
- **WHEN** user selects "Home Loan" type and enters an outstanding amount
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Home Loan"`, `category: "liability"`, and `ownershipPercentage: 100`

#### Scenario: User skips loans
- **WHEN** user clicks the skip option
- **THEN** the wizard SHALL proceed to the next step with zero loan entries

### Requirement: Credit Cards step collects credit card balances
The system SHALL display a Credit Cards step with headline "Any credit card balances you're carrying?" and subtitle "Only outstanding balance, not your credit limit", allowing the user to enter a card description and outstanding amount.

#### Scenario: User adds a credit card balance
- **WHEN** user enters a card description (e.g., "HDFC Regalia") and outstanding amount
- **THEN** the system SHALL create a `StatementEntry` with `statementType: "Credit Card Outstanding"`, `category: "liability"`, and `ownershipPercentage: 100`

#### Scenario: User skips credit cards
- **WHEN** user clicks the skip option
- **THEN** the wizard SHALL proceed to the summary step with zero credit card entries

### Requirement: Summary step displays totals and auto-saves snapshot
The system SHALL display a summary step with headline "Here's your financial snapshot!" showing total assets, total liabilities, and net worth computed via `computeTotals`. The system SHALL first delete all existing statements via `deleteAllStatements`, then save the collected entries via `bulkAddStatements`, and create a snapshot via `saveSnapshot` with today's date.

#### Scenario: Summary displays computed totals
- **WHEN** user reaches the summary step
- **THEN** the system SHALL display total assets, total liabilities, and net worth using `computeTotals`

#### Scenario: Snapshot is auto-saved
- **WHEN** the summary step is displayed
- **THEN** the system SHALL call `deleteAllStatements` to clear any pre-existing statements, then `bulkAddStatements` with all collected entries, and `saveSnapshot` with the computed totals and today's date

#### Scenario: Celebratory moment on completion
- **WHEN** the snapshot is successfully saved
- **THEN** the system SHALL display a celebratory animation (confetti or similar)

#### Scenario: User navigates to dashboard after completion
- **WHEN** user clicks "Go to Dashboard" on the summary step
- **THEN** the system SHALL navigate to `/dashboard` which now displays the standard dashboard with the saved snapshot data

### Requirement: Wizard has progress indicator and back navigation
The system SHALL display a progress bar or step indicator showing the user's position in the wizard. The wizard SHALL support back navigation to revisit previous steps without losing entered data.

#### Scenario: Progress bar reflects current step
- **WHEN** user is on step 3 of 7 in Complete Picture mode
- **THEN** the progress indicator SHALL show step 3 of 7 as active

#### Scenario: User navigates back
- **WHEN** user clicks the back button on any step after the welcome step
- **THEN** the wizard SHALL return to the previous step with previously entered data preserved

### Requirement: Popular banks are stored in the database
The system SHALL store popular bank names in a `popular_banks` Supabase table with columns `id` (UUID), `name` (TEXT, UNIQUE), `sort_order` (INTEGER), and `created_at` (TIMESTAMPTZ). The table SHALL be seeded with 14 Indian banks: SBI, HDFC Bank, ICICI Bank, Axis Bank, Kotak Mahindra Bank, Bank of Baroda, PNB, Canara Bank, Union Bank, IndusInd Bank, IDFC First Bank, Yes Bank, Federal Bank, and Bank of India.

#### Scenario: Banks are fetched via API
- **WHEN** the onboarding wizard bank savings step renders
- **THEN** it SHALL fetch the bank list from `GET /api/banks` (via `useBanks` hook) ordered by `sort_order` and display them in the bank picker

#### Scenario: Adding a new bank requires only a DB insert
- **WHEN** an admin inserts a new row into the `popular_banks` table
- **THEN** the new bank SHALL appear in the bank picker on next page load without any code deployment

#### Scenario: Bank fetch failure falls back gracefully
- **WHEN** the `GET /api/banks` request fails
- **THEN** the bank picker SHALL still allow the user to type a bank name via the "Other" free-text input

### Requirement: Each wizard step has a skip option
The system SHALL provide a skip option ("I don't have any" or equivalent) on every asset/liability collection step, allowing the user to proceed without adding entries for that category.

#### Scenario: Skip preserves existing entries
- **WHEN** user skips a step
- **THEN** previously collected entries from other steps SHALL remain intact and the wizard SHALL advance to the next step
