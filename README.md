# Ledture

> **Ledger for the future** — a personal income and expense tracker designed for fast, everyday transaction recording.

### [💸 Access Web Application](https://moreinv8.github.io/ledture/)

Ledture helps users record money as soon as it moves, instead of trying to reconstruct their spending at the end of the day. The shortest entry flow requires only an amount and a transaction type; a date, category, and note can be added when needed.

## Features

- Create, view, edit, and delete income and expense transactions
- Record a transaction quickly with only an amount and type
- Add optional dates, categories, and notes
- Review recent and historical transactions
- View daily, monthly, and yearly income and expense summaries
- Register and sign in with a private, server-side session
- Access the same ledger from desktop, tablet, or mobile browsers
- Keep users' transactions isolated from one another

To encourage timely record keeping, Ledture applies a **seven-day rule**: transactions more than seven days in the past cannot be created, edited, or deleted.

## Technology

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS | Pages, forms, summaries, and API communication |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA | REST API, authentication, and business rules |
| Database | PostgreSQL 16 | Users, categories, and transactions |
| Local infrastructure | Docker Compose | PostgreSQL development container |

Authentication uses a server-side session and an HttpOnly cookie. Passwords are hashed with BCrypt before storage, and protected API operations are scoped to the signed-in user.

## Project Structure

```text
Ledture/
├── frontend/          React and TypeScript client
├── backend/           Spring Boot REST API
├── docs/              Requirements, architecture, database, and API docs
├── docker-compose.yml PostgreSQL development service
└── README.md
```

The backend follows a layered design:

```text
Controller → Service → Repository → PostgreSQL
                ↑
       business rules live here
```

## Run Locally

### Prerequisites

- Java 21
- Node.js and npm
- Docker with Docker Compose

### 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and stores its data in the `ledture-db-storage` Docker volume.

### 2. Start the backend

The application reads its database connection from `DB_URL`, `DB_USER`, and `DB_PASSWORD`.

PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/ledture"
$env:DB_USER = "admin"
$env:DB_PASSWORD = "admin123"
Set-Location backend
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5432/ledture \
DB_USER=admin \
DB_PASSWORD=admin123 \
./mvnw spring-boot:run
```

The API runs at `http://localhost:8080`. On startup, Spring initializes the database schema from `backend/src/main/resources/schema.sql`.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173/ledture/`. During development, Vite forwards `/api` requests to the backend at port `8080`.

## Deploy

- **Database**: [Neon](https://console.neon.tech/app/org-sparkling-surf-95096306/projects) (PostgreSQL Database Provider)
- **Backend**: [Cloud_Run](https://console.cloud.google.com/welcome/new?project=ledture)
- **Frontend**: Github_CLI `actions/deploy-pages@v4`

## Useful Commands

Run these inside `frontend/`:

```bash
npm run dev       # start the development server
npm run build     # create a production build
npm run lint      # check frontend code quality
npm run preview   # preview the production build
```

Run these inside `backend/`:

```powershell
.\mvnw.cmd test             # Windows
.\mvnw.cmd spring-boot:run  # Windows
```

```bash
./mvnw test                 # macOS/Linux
./mvnw spring-boot:run      # macOS/Linux
```

## API Overview

The REST API is available under `/api` and includes:

- `/api/auth` — registration, login, logout, and session status
- `/api/transactions` — transaction creation, history, updates, deletion, and recent entries
- `/api/categories` — predefined transaction categories

See [docs/api-contract.md](docs/api-contract.md) for endpoint details and error responses.

## Documentation

- [Requirements](docs/requirements.md) — product goals, user stories, and business rules
- [Architecture](docs/architecture.md) — frontend, backend, and database responsibilities
- [Database design](docs/database-design.md) — tables, constraints, relationships, and indexes
- [API contract](docs/api-contract.md) — requests, responses, and expected errors

## Current Scope

Categories are predefined in the database and cannot yet be managed through the interface. Custom category management and other improvements may be added in future versions.

## Credits

Ledture was created as a personal finance application project. Its requirements, architecture, implementation, interface, documentation, and debugging were developed with assistance from AI coding tools. AI-generated or AI-assisted work was reviewed and integrated as part of the project's development process.

Thanks to the maintainers and communities behind React, Vite, Tailwind CSS, Spring Boot, PostgreSQL, and the other open-source libraries used by this project.

