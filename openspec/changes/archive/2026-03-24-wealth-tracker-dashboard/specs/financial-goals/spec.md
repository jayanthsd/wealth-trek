## ADDED Requirements

### Requirement: Display financial goals
The system SHALL display a list of all financial goals on the Goals page at `/dashboard/goals`.

#### Scenario: User has active goals
- **WHEN** user navigates to `/dashboard/goals` and has 3 saved goals
- **THEN** the system SHALL display all 3 goals with their title, description, target amount (if set), target date (if set), and status

#### Scenario: User has no goals
- **WHEN** user navigates to `/dashboard/goals` and has no saved goals
- **THEN** the system SHALL display an empty state message suggesting the user visit the Chat page to set goals with the financial advisor

### Requirement: Goal status management
The system SHALL allow users to update the status of a goal to active, completed, or paused.

#### Scenario: User marks goal as completed
- **WHEN** user clicks "Mark Complete" on an active goal
- **THEN** the system SHALL update the goal status to "completed" and visually distinguish it from active goals

#### Scenario: User pauses a goal
- **WHEN** user clicks "Pause" on an active goal
- **THEN** the system SHALL update the goal status to "paused"

#### Scenario: User resumes a paused goal
- **WHEN** user clicks "Resume" on a paused goal
- **THEN** the system SHALL update the goal status to "active"

### Requirement: Delete a goal
The system SHALL allow users to delete a financial goal.

#### Scenario: User deletes a goal
- **WHEN** user clicks delete on a goal
- **THEN** the system SHALL remove the goal from localStorage and the displayed list

### Requirement: Persist goals in localStorage
The system SHALL store all financial goals in localStorage under the key `financial-goals` as a JSON array.

#### Scenario: Goals persist across page refresh
- **WHEN** user has 2 saved goals and refreshes the page
- **THEN** the system SHALL restore both goals from localStorage
