## MODIFIED Requirements

### Requirement: Delete a goal
The system SHALL allow users to delete a financial goal.

#### Scenario: User deletes a goal
- **WHEN** user clicks delete on a goal
- **THEN** the system SHALL remove the goal from the database and the displayed list

### Requirement: Persist goals in database
The system SHALL store all financial goals in the Supabase database in the `goals` table, associated with the user's Clerk user ID.

#### Scenario: Goals persist across page refresh
- **WHEN** user has 2 saved goals and refreshes the page
- **THEN** the system SHALL restore both goals from the database

#### Scenario: Goals persist across devices
- **WHEN** user has 2 saved goals on device A and logs in on device B
- **THEN** the system SHALL display both goals on device B

#### Scenario: Goals are isolated per user
- **WHEN** user A has goals and user B logs in on the same browser
- **THEN** the system SHALL only display user B's goals, not user A's
