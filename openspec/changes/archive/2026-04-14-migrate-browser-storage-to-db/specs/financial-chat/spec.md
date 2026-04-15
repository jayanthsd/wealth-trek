## MODIFIED Requirements

### Requirement: Goal suggestion from chat
The system SHALL allow the financial advisor agent to suggest creating a financial goal during conversation, and the user can confirm to save it.

#### Scenario: Agent suggests a goal
- **WHEN** the agent identifies a financial goal in conversation (e.g., "save ₹10,00,000 for a house down payment")
- **THEN** the system SHALL display a "Save as Goal" button alongside the message

#### Scenario: User saves suggested goal
- **WHEN** user clicks "Save as Goal" on an agent-suggested goal
- **THEN** the system SHALL save the goal to the database and confirm to the user

### Requirement: Persist chat sessions
The system SHALL persist chat conversation history in the Supabase database in the `chat_messages` table, associated with the user's Clerk user ID, so it survives page refreshes and works across devices.

#### Scenario: Chat history persists across refresh
- **WHEN** user has an ongoing conversation and refreshes the page
- **THEN** the system SHALL restore the previous conversation history from the database

#### Scenario: Chat history persists across devices
- **WHEN** user has chat history on device A and logs in on device B
- **THEN** the system SHALL display the chat history on device B

#### Scenario: Chat history is isolated per user
- **WHEN** user A has chat history and user B logs in on the same browser
- **THEN** the system SHALL only display user B's chat history, not user A's

#### Scenario: User can start a new conversation
- **WHEN** user clicks "New Conversation"
- **THEN** the system SHALL clear the current conversation in the UI (database retains history for reference)
