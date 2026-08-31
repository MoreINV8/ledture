## Database Design:

users
────────────────────────────
id              UUID PK
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL


categories
────────────────────────────
id              UUID PK
label           VARCHAR(20) UNIQUE NOT NULL
emoji           VARCHAR(32) NOT NULL DEFAULT '🏷️'


transactions
────────────────────────────
id               UUID PK
amount           NUMERIC(12,2) NOT NULL
type             CHAR(1) NOT NULL
transaction_date DATE NOT NULL DEFAULT CURRENT_DATE
note             VARCHAR(255)
created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
user_id          UUID NOT NULL FK → users(id)
category_id      UUID NULL FK → categories(id)

## Constraints:
amount > 0

type IN ('I', 'E')

users.email UNIQUE

categories.label UNIQUE

categories.emoji NOT NULL

user_id → users.id
ON DELETE CASCADE

## Index candidate:
transactions(user_id, transaction_date)
