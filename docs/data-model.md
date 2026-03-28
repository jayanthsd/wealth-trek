# Data Model

## SQLite Database

The database is initialized in `app/src/lib/db.ts`. The file lives at:
- **Local**: `app/data/networth.db`
- **Vercel**: `/tmp/networth.db` (ephemeral)

WAL journal mode and foreign keys are enabled on connection. All tables use `CREATE TABLE IF NOT EXISTS` for idempotent initialization.

---

### `statements` Table

Stores individual financial line items (assets and liabilities) for the net worth calculator.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL | Clerk user ID (row-level isolation) |
| `statement_type` | TEXT | NOT NULL | E.g., "Savings Bank Account", "Home Loan" |
| `description` | TEXT | NOT NULL DEFAULT '' | E.g., "HDFC Bank A/c 1234" |
| `category` | TEXT | NOT NULL, CHECK IN ('asset','liability') | Asset or liability |
| `closing_balance` | REAL | NOT NULL, CHECK >= 0 | Current balance (always positive) |
| `ownership_percentage` | REAL | NOT NULL, CHECK 1–100 | User's ownership share |
| `source_document_id` | TEXT | nullable | Links to uploaded document (if AI-extracted) |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL, DEFAULT datetime('now') | ISO 8601 timestamp |

**Index**: `idx_statements_user` on `(user_id)`

---

### `snapshots` Table

Point-in-time balance sheet snapshots. Each snapshot captures totals and the full list of entries as a JSON blob.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL | Clerk user ID |
| `date` | TEXT | NOT NULL | Snapshot date (YYYY-MM-DD) |
| `total_assets` | REAL | NOT NULL | Sum of effective asset values |
| `total_liabilities` | REAL | NOT NULL | Sum of effective liability values |
| `net_worth` | REAL | NOT NULL | total_assets − total_liabilities |
| `entries_json` | TEXT | NOT NULL | JSON array of `StatementEntry[]` at time of snapshot |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | ISO 8601 timestamp |

**Unique Index**: `idx_snapshots_user_date` on `(user_id, date)` — enforces one snapshot per user per date (upsert behavior)

---

### `subscriptions` Table

Records Razorpay payment subscriptions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | UUID |
| `user_id` | TEXT | NOT NULL | Clerk user ID |
| `razorpay_order_id` | TEXT | NOT NULL | Razorpay order ID |
| `razorpay_payment_id` | TEXT | NOT NULL | Razorpay payment ID |
| `plan` | TEXT | NOT NULL | Plan ID: "professional" or "enterprise" |
| `billing_cycle` | TEXT | NOT NULL | "monthly" or "yearly" |
| `amount` | INTEGER | NOT NULL | Amount in paise (e.g., 25000 = ₹250) |
| `currency` | TEXT | NOT NULL, DEFAULT 'INR' | Currency code |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | Subscription status |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | ISO 8601 timestamp |
| `expires_at` | TEXT | NOT NULL | ISO 8601 expiry timestamp |

**Index**: `idx_subscriptions_user` on `(user_id)`

**Active subscription query**: `WHERE user_id = ? AND status = 'active' AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`

---

## TypeScript Types

All shared types are defined in `app/src/types/index.ts`.

### `StatementEntry`

```typescript
interface StatementEntry {
  id: string;
  statementType: string;        // e.g., "Savings Bank Account"
  description: string;           // e.g., "HDFC Bank A/c 1234"
  category: "asset" | "liability";
  closingBalance: number;        // always positive
  ownershipPercentage: number;   // 1–100
  sourceDocumentId?: string;     // UUID of uploaded document
}
```

### `UserProfile`

```typescript
interface UserProfile {
  fullName: string;
  address: string;
  certificateDate: string;       // date for the certificate header
  asOnDate: string;              // "as on" date for the balance sheet
}
```

### `NetWorthSnapshot`

```typescript
interface NetWorthSnapshot {
  id: string;
  date: string;                  // YYYY-MM-DD
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entries: StatementEntry[];     // full entries at time of snapshot
  createdAt: string;             // ISO 8601
}
```

### `FinancialGoal`

```typescript
interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount?: number;
  targetDate?: string;
  createdAt: string;             // ISO 8601
  status: "active" | "completed" | "paused";
}
```

### `ChatMessage`

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;             // ISO 8601
  suggestedGoal?: {              // extracted from AI response
    title: string;
    description: string;
    targetAmount?: number;
    targetDate?: string;
  };
}
```

### `ExtractedEntry`

```typescript
interface ExtractedEntry {
  statementType: string;
  description: string;
  category: "asset" | "liability";
  closingBalance: number;
}
```

### `UploadedDocument`

```typescript
interface UploadedDocument {
  id: string;
  originalName: string;
  storedPath: string;            // filename on disk
  fileType: string;              // MIME type
  size: number;                  // bytes
  uploadedAt: string;            // ISO 8601
}
```

### `STATEMENT_TYPE_PRESETS`

A constant array of preset statement types used in the `StatementForm` dropdown:

| Label | Category |
|---|---|
| Savings Bank Account | asset |
| Fixed Deposit | asset |
| PPF | asset |
| Mutual Fund | asset |
| Stock Holdings | asset |
| Real Estate | asset |
| Gold/Jewellery | asset |
| Other Asset | asset |
| Home Loan | liability |
| Personal Loan | liability |
| Car Loan | liability |
| Credit Card Outstanding | liability |
| Education Loan | liability |
| Other Liability | liability |

---

## localStorage Keys

Some data is stored client-side in `localStorage`. These are managed by their respective hooks.

| Key / Pattern | Hook | Shape | Notes |
|---|---|---|---|
| User profile data | `useUserProfile` | `UserProfile` | Full name, address, dates for PDF |
| Chat message history | `useChatHistory` | `ChatMessage[]` | Conversation with AI advisor |
| Financial goals | `useFinancialGoals` | `FinancialGoal[]` | Goals created from chat or manually |

> **Note**: The exact localStorage key strings are defined within each hook. Chat history and goals are ephemeral — clearing browser data removes them. Server-side migration for goals is planned for a future phase (see [VISION.md](../VISION.md)).

---

## Entity Relationships

```
User (Clerk userId)
  │
  ├── has many → Statements        (SQLite, user_id scoped)
  │                 │
  │                 └── snapshotted into → Snapshots  (SQLite, entries_json contains full copy)
  │                                           │
  │                                           ├── drives → Wealth Tracker (line charts)
  │                                           ├── drives → Analytics (comparisons, breakdowns)
  │                                           └── provides context → AI Chat
  │
  ├── has many → Subscriptions     (SQLite, user_id scoped)
  │
  ├── has one  → User Profile      (localStorage)
  ├── has many → Chat Messages     (localStorage)
  └── has many → Financial Goals   (localStorage, extracted from chat or manual)
```

**Key design note**: Snapshots store a **copy** of all statement entries at the time of creation (`entries_json`). This means snapshots are self-contained and not affected by subsequent statement edits or deletions. This is intentional — each snapshot represents a frozen-in-time balance sheet.
