# Biashara Books — Backend API

Reactive Spring Boot API for the Biashara Books POS and transaction-tagging system.

## Tech Stack

- Java 17
- Spring Boot 3.1.5 (WebFlux — fully reactive)
- R2DBC + PostgreSQL
- Flyway (database migrations)
- Spring Security + JWT
- Lombok

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+

## Database Setup

Create the database before starting the app:

```sql
CREATE DATABASE biashara_book;
```

The default connection expects:

| Setting  | Value         |
|----------|---------------|
| Host     | localhost     |
| Port     | 5432          |
| Database | biashara_book |
| Username | postgres      |
| Password | postgres      |

Flyway runs migrations automatically on startup from `src/main/resources/db/migration/`.

## Configuration

The app ships with two property files:

- `application.properties` — base config (JWT, server port, logging)
- `application-development.properties` — database connection (active by default)

To override defaults without editing files, set environment variables:

```bash
export JWT_SECRET=your_secret_here   # optional, has a default
export POSTGRES_USER=postgres        # optional, defaults to postgres
export POSTGRES_PASSWORD=postgres    # optional, defaults to postgres
```

To point at a different database, set the R2DBC and Flyway URLs together, or edit [application-development.properties](src/main/resources/application-development.properties):

```bash
export SPRING_R2DBC_URL=r2dbc:postgresql://localhost:5432/biashara_book
export SPRING_FLYWAY_URL=jdbc:postgresql://localhost:5432/biashara_book
```

For a separate profile, create an `application-production.properties` and set:

```bash
export SPRING_PROFILES_ACTIVE=production
```

## Running the App

```bash
# Install dependencies and run
./mvnw spring-boot:run

# Or build a JAR and run it
./mvnw clean package -DskipTests
java -jar target/mvp-reactive-api-1.0.0.jar
```

The server starts on **http://localhost:8080**.

## Seed Data

The backend includes a startup seeder for a clothing store catalog:

- Categories: `Tops & Shirts`, `Outerwear & Hoodies`, `Bottoms`, `Footwear & Accessories`
- Products: sample clothing products with Unsplash image URLs

The seeder runs automatically when the Spring Boot app starts:

```bash
./mvnw spring-boot:run
```

No separate command is needed. Make sure the database is configured and Flyway migrations have run; both happen during normal app startup.

### How Product Businesses Are Selected

Products are not seeded as global catalog rows because `products.user_id` is required. On startup, the seeder:

1. Creates the clothing categories if they do not already exist.
2. Reads every existing row from the `business` table.
3. Adds the clothing products to each business using:
   - `business_id = business.id`
   - `user_id = business.user_id`

The seeder is idempotent per business and product name, so restarting the backend will not duplicate the same product for the same business.

If there are no businesses in the database yet, only the categories are created. Create a business first, then restart the backend to seed products for that business.

## Running Tests

```bash
./mvnw test
```

Tests use Testcontainers and spin up a real PostgreSQL instance — make sure Docker is running.

## Swagger 

http://localhost:8080/swagger-ui.html

## API Overview

All endpoints (except auth) require a Bearer JWT token in the `Authorization` header.

| Module           | Base Path              |
|------------------|------------------------|
| Auth             | `/api/auth`            |
| Users            | `/api/users`           |
| Business         | `/api/business`        |
| Transactions     | `/api/transactions`    |
| Sales            | `/api/sales`           |
| Expenses         | `/api/expenses`        |
| Expense Types    | `/api/expense-types`   |
| Products         | `/api/products`        |
| Product Categories | `/api/product-categories` |
| Inventory        | `/api/inventory`       |
| Loans            | `/api/loans`           |

A Postman collection is included at [postman-collection.json](postman-collection.json) and an MVP-scoped subset at [mvp-collection.json](mvp-collection.json).

Detailed transaction request formats, statuses, and enum options are documented in [docs/transactions-api.md](docs/transactions-api.md).

## Project Structure

```
src/main/java/com/mpesa/africa/biashara/book/
├── config/         # Security, JWT config
├── controller/     # REST controllers (thin layer)
├── model/
│   ├── dto/        # Request / response DTOs
│   ├── entity/     # R2DBC entities
│   └── enums/      # Domain enums
├── repository/     # R2DBC repositories
├── service/        # Business logic
└── exception/      # Global error handling
```
