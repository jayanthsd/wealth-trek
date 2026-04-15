## MODIFIED Requirements

### Requirement: Auto-save profile to database
The system SHALL automatically save user profile details to the Supabase database in the `user_profiles` table, associated with the user's Clerk user ID, whenever they are changed.

#### Scenario: Profile persists across page refresh
- **WHEN** user has entered profile details and refreshes the page
- **THEN** the system SHALL restore the previously entered profile details from the database

#### Scenario: Profile persists across devices
- **WHEN** user has entered profile details on device A and logs in on device B
- **THEN** the system SHALL display the profile details on device B

#### Scenario: Profile is isolated per user
- **WHEN** user A has profile data and user B logs in on the same browser
- **THEN** the system SHALL only display user B's profile data, not user A's
