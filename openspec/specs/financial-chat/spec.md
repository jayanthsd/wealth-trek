# Financial Chat

## Purpose

This specification defines the requirements for the AI-powered financial advisor chat interface that provides personalized financial guidance.

## Requirements

### Requirement: Financial advisor chat interface
The system SHALL provide a chat interface at `/dashboard/chat` where users can converse with an AI-powered financial advisor agent.

#### Scenario: User sends a message
- **WHEN** user types a message and presses send
- **THEN** the system SHALL display the user's message in the chat window and show a streaming response from the financial advisor agent

#### Scenario: Chat displays conversation history
- **WHEN** user has exchanged multiple messages with the agent
- **THEN** the system SHALL display the full conversation history in chronological order

### Requirement: Financial advisor persona
The system SHALL configure the AI agent with a financial advisor system prompt that provides guidance on wealth management, goal setting, and financial discipline.

#### Scenario: Agent provides financial guidance
- **WHEN** user asks "How can I reduce my liabilities?"
- **THEN** the agent SHALL respond with relevant financial advice based on general wealth management principles

#### Scenario: Agent has context of user's financial data
- **WHEN** user has net worth snapshots saved
- **THEN** the agent SHALL have access to the user's latest snapshot summary (total assets, total liabilities, net worth) for personalized advice

### Requirement: Goal suggestion from chat
The system SHALL allow the financial advisor agent to suggest creating a financial goal during conversation, and the user can confirm to save it.

#### Scenario: Agent suggests a goal
- **WHEN** the agent identifies a financial goal in conversation (e.g., "save ₹10,00,000 for a house down payment")
- **THEN** the system SHALL display a "Save as Goal" button alongside the message

#### Scenario: User saves suggested goal
- **WHEN** user clicks "Save as Goal" on an agent-suggested goal
- **THEN** the system SHALL save the goal to localStorage and confirm to the user

### Requirement: Chat API route
The system SHALL provide an API route at `/api/chat` that proxies messages to OpenAI, keeping the API key server-side.

#### Scenario: API route processes chat request
- **WHEN** the chat frontend sends a POST request to `/api/chat` with conversation messages
- **THEN** the API route SHALL forward the request to OpenAI and stream the response back

### Requirement: Persist chat sessions
The system SHALL persist chat conversation history in localStorage so it survives page refreshes.

#### Scenario: Chat history persists across refresh
- **WHEN** user has an ongoing conversation and refreshes the page
- **THEN** the system SHALL restore the previous conversation history

#### Scenario: User can start a new conversation
- **WHEN** user clicks "New Conversation"
- **THEN** the system SHALL clear the current conversation and start fresh
