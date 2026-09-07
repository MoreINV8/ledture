# Database Design

## `users`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `uuid_generate_v4()` |
| `email` | `VARCHAR(255)` | Unique, not null |
| `password_hash` | `VARCHAR(255)` | Not null |

## `categories`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `uuid_generate_v4()` |
| `label` | `VARCHAR(20)` | Unique, not null |
| `emoji` | `VARCHAR(32)` | Not null, defaults to `🏷️` |
| `type` | `CHAR(1)` | Not null; `I` = income, `E` = expense |

Each category belongs to exactly one transaction type. A transaction may only
reference a category whose `type` matches the transaction's `type`.

## `transactions`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `uuid_generate_v4()` |
| `amount` | `NUMERIC(12,2)` | Not null, greater than zero |
| `type` | `CHAR(1)` | Not null; `I` = income, `E` = expense |
| `transaction_date` | `DATE` | Not null, defaults to current date |
| `note` | `VARCHAR(255)` | Nullable |
| `created_at` | `TIMESTAMP` | Not null, defaults to current timestamp |
| `user_id` | `UUID` | Not null, foreign key to `users(id)` with cascading delete |
| `category_id` | `UUID` | Nullable, foreign key to `categories(id)` |

## Constraints and application rules

- `transactions.amount > 0`
- `transactions.type IN ('I', 'E')`
- `categories.type IN ('I', 'E')`
- `users.email` is unique
- `categories.label` is unique
- `categories.emoji` is not null
- When `transactions.category_id` is present, the category type must equal the
  transaction type. This cross-table rule is enforced by the backend service.
- Deleting a user cascades to that user's transactions.

## Indexes

- `transactions(user_id, transaction_date)` supports the primary ledger query.


