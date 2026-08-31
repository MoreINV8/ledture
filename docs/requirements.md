## Ledture (ledger for future) — Requirements
### Product Goal

The application is a personal income and expense tracker designed to make recording transactions quick and convenient.

The main goal is to allow the user to record a transaction immediately after an income or expense occurs, reducing the chance of forgetting transactions when waiting until the end of the day.

### Functional Requirements
- **Transaction Management**

The system shall allow users to create, view, update, and delete income and expense transactions.

**Each transaction contains:**

amount — required, must be greater than 0 </br>
type — required </br>
I = Income </br>
E = Expense </br>
transactionDate — optional, defaults to the current date </br>
category — optional, defaults to null / Uncategorized </br>
note — optional, defaults to null

**Users shall be able to:**

Create a transaction</br>
View transactions</br>
Update a transaction</br>
Delete a transaction</br>
View historical transactions</br>

**Transaction Modification Rule**

Users may create, update, or delete transactions from the past within 7 days.</br>
Transactions older than 7 days cannot be created, updated, or deleted through the application.</br>
This rule is implemented as a business rule in the Service layer, rather than as a database constraint.</br>
The purpose of this rule is to encourage users to record transactions promptly rather than postponing transaction recording indefinitely.

- **Category**

The system shall have a Category entity.

**Each category contains:**

id</br>
label</br>
emoji

**For the initial version:**

Categories are predefined in the database.</br>
There is no UI for managing categories.</br>
Categories can be added directly to the database when necessary.</br>
A transaction can have zero or one category.</br>
categoryId is optional.</br>
If no category is provided, the transaction's category is null.</br>
Category labels must be unique.
Each category must have an emoji for visual identification.</br>

! Category management through the application may be considered in a future version.

- **Transaction Summary**

**The system shall provide income and expense summaries for:**

Daily</br>
Monthly</br>
Yearly

- **Authentication and Privacy**

The system shall require users to authenticate before accessing their personal transaction data.

**A user contains:**

id</br>
email</br>
passwordHash</br>

**Requirements:**

Email addresses must be unique.</br>
Passwords must be hashed before being stored in the database.</br>
Users must be authenticated before accessing protected resources.</br>
A transaction must belong to the authenticated user.</br>
A user can have multiple transactions.</br>
Deleting a user shall delete all transactions belonging to that user.</br>
Categories shall remain when a user is deleted.</br>

**Authentication shall use:**

Server-side sessions</br>
HttpOnly cookies

The login session should remain active for a sufficiently long period to avoid requiring the user to log in frequently.

- **Multi-device Access**

Users shall be able to access their account and transaction data from multiple devices, including:

Mobile phones</br>
PCs</br>
Tablets / iPads</br>
Other supported web browsers (UX Requirements, Quick Note)

The primary purpose of the application is to make transaction recording fast enough to encourage the user to record transactions immediately after they occur.

**The minimum information required to record a transaction is:**

Amount</br>
Transaction type

Additional information should not make the basic recording flow unnecessarily complicated.

- **Optional Transaction Details**

**The following fields should be hidden or placed behind an expandable/toggleable section:**

Category</br>
Note<br>
Other optional details</br>

The user can expand the additional details when needed.

```
Example:

Amount
[ 65 ]

Type
[ Income ] [ Expense ]

[ More Details ▼ ]

-------------------------
Category
Note
Date
-------------------------

[ Save ]
```

The design should prioritize fast transaction recording while still allowing the user to add additional information when necessary.

### Business Rules
- **Transaction Date**

A transaction cannot be created, updated, or deleted if its transaction date is more than 7 days in the past.

- **Transaction Ownership**

A user may only access, update, or delete transactions belonging to the authenticated user.

- **Category**

A transaction may reference zero or one category.

If a categoryId is provided, the referenced category must exist.

- **User Deletion**

When a user is deleted:

All transactions belonging to the user are deleted.
Categories are retained.

- **Authentication**

Protected resources require an authenticated session.

### User Stories
**US-01 — Record Transaction**

As a user, I want to record income and expenses quickly so that I can record a transaction immediately after it occurs and reduce the chance of forgetting it.

**US-02 — Add Additional Details**

As a user, I want to optionally add a category and note without being required to enter them every time, so that recording a basic transaction remains quick and convenient.

**US-03 — Modify Recent Transactions**

As a user, I want to create, update, and delete transactions from the past within 7 days so that I can correct or add transactions that I remembered later while still encouraging myself to record transactions promptly.

**US-04 — View Transactions**

As a user, I want to view my historical income and expense transactions so that I can review my financial activity.

**US-05 — View Summary**

As a user, I want to view income and expense summaries by day, month, and year so that I can understand my overall financial situation.

**US-06 — Access from Multiple Devices**

As a user, I want to access my transaction data from multiple devices, such as my phone, PC, or tablet, so that I can record transactions from whichever device I am using.

**US-07 — Protect Personal Data**

As a user, I want to log in before accessing my transaction data so that other people cannot directly access my personal financial information.

**US-08 — Long-lived Login Session**

As a user, I want my login session to remain active for a sufficiently long period so that I do not need to log in repeatedly and can quickly record transactions.

### Technical Decisions
- **Frontend**

**React**
```
frontend/</br>
├── pages</br>
│   ├── Quick Note Page</br>
│   ├── Transaction List Page</br>
│   └── Summary Page</br>
│
├── components</br>
│   └── Reusable UI Components</br>
│
├── api</br>
│   └── API Request / Response Handling</br>
│
└── state</br>
    └── Application / UI State
```

- **Backend**

**Spring Boot**

```
backend/</br>
├── Controller</br>
│   └── Parse HTTP requests and perform basic input validation</br>
│
├── Service</br>
│   └── Business logic and business rule validation</br>
│
├── Repository</br>
│   └── Database queries and database interaction</br>
│
├── Security</br>
│   └── Authentication and session management</br>
│
├── Model</br>
│   └── Domain / entity attributes</br>
│
└── DTO</br>
    └── Data boundary between API and application layers</br>
```

- **Database**

**PostgreSQL**

PostgreSQL will run as a Docker container.

- **Authentication**

**The application will use:**

```
Server-side Session
        +
HttpOnly Cookie
```

The browser is responsible for storing and sending the cookie. React does not directly manage the session cookie.

- **Business Logic**

Business rules should primarily be implemented in the Spring Boot Service layer.

**Database constraints should be used for data integrity, such as:**

NOT NULL</br>
UNIQUE</br>
CHECK</br>
Foreign key constraints</br>

Business rules that may change independently of the database schema should not be implemented as database constraints.

