# Private Assets Management System

## Overview

**Private Assets Management System (PAMS)** is a backend service built with **TypeScript** and **Express.js**.  
It provides a modular and scalable solution for managing private assets, transactions, and user access.  

The system follows **Domain-Driven Design (DDD)** principles with clear boundaries between domains (users, roles, assets, histories, etc.), and includes robust **authentication, auditing, and permission control** features.

## Technologies Used

- **TypeScript** – Type-safe, maintainable code.  
- **Express.js** – Lightweight web framework for building APIs.  
- **Node.js 20** – Modern runtime environment.  
- **PostgreSQL** – Relational database for persistence.  
- **Sequelize** – ORM for structured queries and migrations.  
- **Docker** – Containerized setup for database and runtime services.  

## Features

- **Authentication & Tokens** – Secure login, JWT, and refresh token handling.  
- **User & Role Management** – Create and assign roles, permissions, and access levels.  
- **Audit Logs** – Track user and system activities.  
- **Announcements** – Manage and publish system-wide announcements.  
- **Asset Management** – Modules for stock assets, commodities, and transaction histories.  
- **Buy/Sell History** – Record and track asset transactions.  
- **Dashboard Metrics** – Aggregated totals for system overview.  
- **Validation & Error Handling** – Centralized schema validation and consistent exception handling.  

## Prerequisites

- Node.js 20.x  
- PostgreSQL 15+  
- Yarn or npm  

## Installation

1. Clone the repository:

    ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

    ```bash
   yarn install
   ```

3. Configure environment variables:  

   Create a `.env` file in the project root and provide values:

   ```bash
   APP_PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=your_password
   DB_NAME=private_assets_db
   ```

4. Start services (DB, etc.) with Docker:

   ```bash
   docker compose -f docker-compose-development.yaml up
   ```

5. Run the application in development:

   ```bash
   yarn dev
   ```

## Project Structure

```plaintext
.
├── package.json
├── README.md
├── src
│   ├── config/                 # App configurations (CORS, DB, env)
│   ├── container.ts            # Dependency injection container
│   ├── exceptions/             # Custom errors and global error handlers
│   ├── helpers/                # Utilities (validation helpers, etc.)
│   ├── index.ts                # Application entry point
│   ├── libs/                   # Infrastructure utilities
│   │   ├── cron-job/           # Scheduled jobs
│   │   ├── exit-handler.ts     # Graceful shutdown handling
│   │   ├── file-system.ts      # File utilities
│   │   ├── formatters.ts       # Data formatting helpers
│   │   ├── logger.ts           # Logger setup
│   │   └── standard-response.ts# Standard API responses
│   ├── modules/                # Domain-driven modules
│   │   ├── announcements       # System announcements
│   │   ├── audit-logs          # Activity logging
│   │   ├── authentications     # Authentication & validation
│   │   ├── buy-history         # Purchase records
│   │   ├── commodity           # Commodity management
│   │   ├── common              # Shared DTOs, schemas, utilities
│   │   ├── dashboard-totals    # Dashboard metrics
│   │   ├── origins             # Origin management
│   │   ├── refresh-tokens      # Refresh token lifecycle
│   │   ├── roles               # Role & permission handling
│   │   ├── sell-history        # Sell transaction records
│   │   ├── stock-assets        # Stock asset management
│   │   ├── user-logs           # User activity logs
│   │   └── users               # User management
│   ├── presentation/           # Delivery layer (Express server, routes, middlewares)
│   └── types.ts                # Shared/global TS types
├── tmp/                        # Temporary storage (e.g., avatars)
│   └── user/avatars
├── tsconfig.json               # TypeScript config
└── yarn.lock                   # Dependency lockfile
```

## Development Workflow

- **Domain-Driven Design (DDD)** – Each module is a bounded context with its own domain, service, repository, and validation.  
- **Service Layer** – Business logic handling.  
- **Repository Layer** – Database operations with Sequelize.  
- **Controller Layer** – Bridges HTTP requests to services.  
- **Validation Layer** – Input validation with schema definitions.  
- **Exception Handling** – Centralized via `exceptions/`.  

## Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feature/your-feature`).  
3. Commit your changes (`git commit -m 'Add new feature'`).  
4. Push to your branch (`git push origin feature/your-feature`).  
5. Open a pull request.  

## License

This project is licensed under the **MIT License**.
