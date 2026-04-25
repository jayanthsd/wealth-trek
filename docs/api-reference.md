# API Reference

All API routes live under `app/src/app/api/`. Unless noted otherwise, requests and responses use `Content-Type: application/json`.

## Authentication Pattern

Most routes use Clerk server-side auth:

```typescript
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

All database queries are scoped to the authenticated `userId` to enforce user isolation.

## Error Response Convention

All errors follow the shape:

```json
{ "error": "Human-readable error message" }
```

Common HTTP status codes used:

| Status | Meaning |
|---|---|
| `400` | Bad request — missing or invalid parameters |
| `401` | Unauthorized — no valid Clerk session |
| `404` | Resource not found (or not owned by user) |
| `422` | Unprocessable — valid request but data cannot be processed (e.g., empty PDF) |
| `429` | Rate limited (OpenAI) |
| `500` | Internal server error |

---

## Statements

Manage individual financial line items (assets and liabilities).

### `GET /api/statements`

Fetch all statements for the authenticated user.

- **Auth**: Required
- **Response**: `{ statements: StatementEntry[] }`

### `POST /api/statements`

Create one or more statements.

- **Auth**: Required
- **Body**: A single entry object or an array of entries:
  ```json
  {
    "statementType": "Savings Bank Account",
    "description": "HDFC Bank A/c 1234",
    "category": "asset",
    "closingBalance": 250000,
    "ownershipPercentage": 100,
    "sourceDocumentId": "optional-uuid"
  }
  ```
- **Response** (`201`): `{ statements: StatementEntry[] }`

### `PUT /api/statements/[id]`

Update a single statement. Accepts partial updates — only provided fields are changed.

- **Auth**: Required
- **Body**: Any subset of `{ statementType, description, category, closingBalance, ownershipPercentage, sourceDocumentId }`
- **Response**: `{ statement: StatementEntry }`
- **Errors**: `404` if statement not found or not owned by user

### `DELETE /api/statements/[id]`

Delete a single statement.

- **Auth**: Required
- **Response**: `{ success: true }`
- **Errors**: `404` if not found

---

## Snapshots

Point-in-time balance sheet snapshots. Each snapshot stores totals and the full list of statement entries as JSON.

### `GET /api/snapshots`

Fetch all snapshots for the authenticated user, ordered by date ascending.

- **Auth**: Required
- **Response**: `{ snapshots: NetWorthSnapshot[] }`

### `POST /api/snapshots`

Create or update (upsert) a snapshot. If a snapshot already exists for the same `user_id + date`, it is overwritten.

- **Auth**: Required
- **Body**:
  ```json
  {
    "date": "2025-03-28",
    "totalAssets": 5000000,
    "totalLiabilities": 1200000,
    "netWorth": 3800000,
    "entries": [ ...StatementEntry[] ]
  }
  ```
- **Response** (`201` for new, `200` for update): `{ snapshot: NetWorthSnapshot }`

### `DELETE /api/snapshots/[id]`

Delete a single snapshot.

- **Auth**: Required
- **Response**: `{ success: true }`
- **Errors**: `404` if not found

---

## Documents

Upload and process financial documents (PDFs and images) for AI extraction.

### `POST /api/documents/upload`

Upload one or more files to the server.

- **Auth**: None (session-scoped on client)
- **Content-Type**: `multipart/form-data`
- **Body**: Form field `files` containing one or more files
- **Constraints**:
  - Allowed types: `application/pdf`, `image/png`, `image/jpeg`
  - Max size: 20 MB per file
- **Response**: `{ documents: UploadedDocument[] }`

### `POST /api/documents/extract`

Extract financial entries from an uploaded document using AI.

- **Auth**: None
- **Body**:
  ```json
  {
    "storedPath": "1711234567890-statement.pdf",
    "fileType": "application/pdf"
  }
  ```
- **Processing**:
  - **PDF**: Spawns Python `pdfplumber` script → extracts text (first 3 + last 2 pages) → sends to GPT-4o-mini for structured extraction
  - **Image**: Reads file as base64 → sends to GPT-4o vision for structured extraction
- **Response**: `{ entries: ExtractedEntry[] }`
- **Errors**: `422` if PDF has no extractable text, `429` if OpenAI rate limited

### `DELETE /api/documents/[id]`

Delete an uploaded document file from the server.

- **Auth**: None
- **Body**: `{ "storedPath": "filename-on-disk" }`
- **Response**: `{ success: true, id: "..." }`

---

## Advanced Inputs

User-supplied financial parameters used to power richer checklist evaluations and projections (monthly income, SIP amount, insurance cover, etc.).

### `GET /api/advanced-inputs`

Fetch the stored advanced inputs for the authenticated user.

- **Auth**: Required
- **Response**: `{ inputs: AdvancedInputs }` — empty object `{}` if none saved yet

### `POST /api/advanced-inputs`

Create or replace (upsert) the advanced inputs for the authenticated user. Send the full `AdvancedInputs` object; omitted fields are set to `null`.

- **Auth**: Required
- **Body**:
  ```json
  {
    "monthly_income": 150000,
    "monthly_emi_total": 25000,
    "monthly_investment": 30000,
    "current_age": 32,
    "retirement_age": 60,
    "existing_term_cover": 10000000,
    "existing_health_cover": 500000,
    "ppf_annual_contribution": 150000,
    "vpf_contribution": 5000,
    "has_will_created": false,
    "has_international_funds": true
  }
  ```
- **Response**: `{ inputs: AdvancedInputs }` (as stored)
- **Notes**: All fields are optional. Only one row per user is kept (upsert on `user_id`).

---

## Chat

AI-powered financial advisor with streaming responses.

### `POST /api/chat`

Send a conversation to the AI advisor and receive a streaming response.

- **Auth**: None (but snapshot context is user-scoped on client)
- **Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "How should I reduce my debt?" }
    ],
    "snapshotSummary": "Optional: latest snapshot summary text for context"
  }
  ```
- **Response**: `text/event-stream` (SSE)
  - Data events: `data: {"content": "token..."}\n\n`
  - End signal: `data: [DONE]\n\n`
- **Model**: `gpt-4o-mini` with financial advisor system prompt
- **Goal extraction**: When the AI identifies a goal, it appends a `|||GOAL|||{...}|||END_GOAL|||` block to the message

### `GET /api/chat/messages`

Fetch all stored chat messages for the authenticated user, ordered by timestamp ascending.

- **Auth**: Required
- **Response**: `{ messages: ChatMessage[] }`

### `POST /api/chat/messages`

Persist one or more chat messages. Accepts a single message object or an array.

- **Auth**: Required
- **Body**: `ChatMessage` or `ChatMessage[]`
  ```json
  { "role": "user", "content": "What is my savings rate?" }
  ```
- **Response** (`201`): `{ messages: ChatMessage[] }` — DB-assigned `id` and `timestamp` are returned

### `PUT /api/chat/messages/[id]`

Update an existing message (used to save final streamed content or attach a suggested goal).

- **Auth**: Required
- **Body**: Partial — `{ content?, suggestedGoal? }`
- **Response**: `{ message: ChatMessage }`
- **Errors**: `404` if not found or not owned

### `DELETE /api/chat/messages/[id]`

Delete a single chat message.

- **Auth**: Required
- **Response**: `{ success: true }`
- **Errors**: `404` if not found

### `DELETE /api/chat/messages`

Delete **all** chat messages for the authenticated user (used by "Clear History").

- **Auth**: Required
- **Response**: `{ success: true }`

---

## Goals

Financial goals created manually or extracted from the AI chat.

### `GET /api/goals`

Fetch all goals for the authenticated user, ordered by `created_at` ascending.

- **Auth**: Required
- **Response**: `{ goals: FinancialGoal[] }`

### `POST /api/goals`

Create one or more goals. Accepts a single goal object or an array.

- **Auth**: Required
- **Body**: `FinancialGoal` or `FinancialGoal[]`
  ```json
  {
    "title": "Emergency Fund",
    "description": "Build 6 months of expenses",
    "targetAmount": 300000,
    "targetDate": "2025-12-31",
    "status": "active"
  }
  ```
- **Response** (`201`): `{ goals: FinancialGoal[] }` — DB-assigned `id` and `created_at` are returned

### `PUT /api/goals/[id]`

Update a goal's fields. All fields are optional — only provided fields are changed.

- **Auth**: Required
- **Body**: Partial `{ title?, description?, targetAmount?, targetDate?, status? }`
- **Response**: `{ goal: FinancialGoal }`
- **Errors**: `404` if not found or not owned

### `DELETE /api/goals/[id]`

Delete a single goal.

- **Auth**: Required
- **Response**: `{ success: true }`
- **Errors**: `404` if not found

---

## User Profile

User display name and certificate personalization fields.

### `GET /api/profile`

Fetch the profile for the authenticated user.

- **Auth**: Required
- **Response**: `{ profile: UserProfile }` — returns default empty profile if none saved yet

### `POST /api/profile`

Create or replace (upsert) the user profile.

- **Auth**: Required
- **Body**:
  ```json
  {
    "fullName": "Jayantha S D",
    "address": "Bangalore, Karnataka",
    "certificateDate": "2025-04-25",
    "asOnDate": "2025-04-01"
  }
  ```
- **Response**: `{ profile: UserProfile }`

---

## Payments

Razorpay payment processing for subscription plans.

### `POST /api/payments/create-order`

Create a Razorpay order for a pricing plan.

- **Auth**: Required
- **Body**:
  ```json
  {
    "plan": "professional",
    "billingCycle": "monthly"
  }
  ```
- **Validation**: `plan` must be `"professional"` or `"enterprise"`. `billingCycle` must be `"monthly"` or `"yearly"`.
- **Server-side**: Looks up amount from `lib/pricing.ts`, calls Razorpay Orders API
- **Response**:
  ```json
  {
    "orderId": "order_xxx",
    "razorpayKeyId": "rzp_test_xxx",
    "amount": 25000,
    "currency": "INR"
  }
  ```

### `POST /api/payments/verify`

Verify a completed Razorpay payment and create a subscription record.

- **Auth**: Required
- **Body**:
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "hex-signature",
    "plan": "professional",
    "billingCycle": "monthly"
  }
  ```
- **Verification**: Computes HMAC-SHA256 of `order_id|payment_id` using `RAZORPAY_KEY_SECRET` and compares with provided signature
- **On success**: Inserts subscription record into SQLite with calculated expiry date (30 days for monthly, 365 days for yearly)
- **Response**:
  ```json
  {
    "success": true,
    "subscription": {
      "id": "uuid",
      "plan": "professional",
      "billingCycle": "monthly",
      "status": "active",
      "expiresAt": "2025-04-28T00:00:00.000Z"
    }
  }
  ```
- **Errors**: `400` if signature is invalid (subscription is NOT created)

---

## Subscription

### `GET /api/subscription`

Fetch the authenticated user's current active subscription.

- **Auth**: Required
- **Response** (active subscription exists):
  ```json
  {
    "subscription": {
      "id": "uuid",
      "plan": "professional",
      "billingCycle": "monthly",
      "status": "active",
      "expiresAt": "2025-04-28T00:00:00.000Z"
    }
  }
  ```
- **Response** (no active subscription): `{ "subscription": null }`
- **Query logic**: Finds the most recent subscription for the user where `status = 'active'` and `expires_at > now()`
