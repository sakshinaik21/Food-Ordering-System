 HEAD
# 🍔 Food Ordering System

A full-stack food ordering platform with role-based access for **customers** and **restaurant owners** — built with Spring Boot, React, and MySQL. Customers can browse restaurants, order food, track deliveries, and leave reviews; restaurant owners can manage their menus and fulfill incoming orders.

## 🛠️ Tech Stack

**Backend:** Java 21 · Spring Boot 3.5 · Spring Security · Spring Data JPA (Hibernate) · MySQL · JWT (jjwt) · Maven
**Frontend:** React 19 · Vite · React Router · Tailwind CSS v4 · Axios · Context API

## ✨ Features

### Customer
- Register / login with JWT authentication
- Browse restaurants with live search and category filtering
- View menus, average ratings, and reviews
- Add items to cart (single-restaurant cart enforced)
- Manage saved delivery addresses
- Place orders and track status in real time
- Cancel an order while it's still pending
- Leave a rating and review — restricted to restaurants you've actually ordered from

### Restaurant Owner
- Create, edit, and deactivate restaurants
- Full menu CRUD (add, edit, soft-delete items)
- View incoming orders for each restaurant
- Update order status through its lifecycle (Pending → Confirmed → Preparing → Out for Delivery → Delivered)

### Cross-cutting
- Role-based access control (`CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`) enforced at both the URL and method level
- Object-level authorization — e.g., a restaurant owner can only manage *their own* restaurants and orders
- Centralized exception handling with consistent JSON error responses
- Transactional order placement with price-snapshotting for accurate order history

## 🏗️ Architecture

```
React (Vite)  →  Axios + JWT interceptor  →  Spring Security  →  Controller  →  Service  →  Repository  →  MySQL
```

**Backend layers:**
- `entity/` — JPA entities modeling the domain (User, Role, Address, Restaurant, MenuItem, Order, OrderItem, Review)
- `repository/` — Spring Data JPA repositories, including custom JPQL for aggregate queries
- `service/` — business logic, validation, and authorization checks
- `controller/` — REST endpoints, HTTP concerns only
- `security/` — JWT generation/validation, Spring Security configuration
- `dto/` — request/response shapes, decoupled from entities
- `exception/` — global exception handling, mapped to correct HTTP status codes

**Entity relationships:**
- `User` ↔ `Role` — many-to-many
- `User` → `Address` — one-to-many
- `User` → `Restaurant` — one-to-many (ownership)
- `Restaurant` → `MenuItem` — one-to-many
- `Order` — references `User`, `Restaurant`, and `Address`
- `Order` → `OrderItem` ↔ `MenuItem` — many-to-many resolved via a junction entity (carries quantity + price snapshot)
- `Review` — references `User` and `Restaurant`, with a composite unique constraint (one review per user per restaurant)

## 🔑 Key Engineering Decisions

- **JWT over sessions** — stateless authentication, no server-side session storage
- **Price snapshotting** — `OrderItem.priceAtPurchase` captures the price at order time, so historical orders stay accurate even if menu prices change later
- **Soft deletes for restaurants/menu items** — preserves order history and referential integrity instead of cascading deletes
- **Two-layer authorization** — role checks (`@PreAuthorize`) for coarse access, service-layer ownership checks for fine-grained "is this *your* resource" rules
- **Defense in depth on reviews** — a database-level composite unique constraint backs up an application-level duplicate check, closing race conditions a check-then-insert pattern alone can't catch
- **Secrets externalized** via environment variables, never committed to source control

## ⚙️ Setup

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8+

### Backend
```bash
cd backend
# Set environment variables before running:
#   DB_PASSWORD=your_mysql_password
#   JWT_SECRET=a_long_random_secret_string
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`. The database schema and three default roles (`CUSTOMER`, `RESTAURANT_OWNER`, `ADMIN`) are created automatically on first run.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## 📋 API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` / `login` | Authentication |
| `GET /api/restaurants` | Browse restaurants (public) |
| `POST /api/restaurants` | Create restaurant (owner only) |
| `GET /api/menu-items/restaurant/{id}` | View a restaurant's menu (public) |
| `POST /api/orders` | Place an order (customer only) |
| `PATCH /api/orders/{id}/status` | Update order status (owner only) |
| `PATCH /api/orders/{id}/cancel` | Cancel a pending order (customer only) |
| `GET /api/reviews/restaurant/{id}/rating` | Average rating for a restaurant (public) |

## 📌 Known Limitations / Future Improvements

- Order status transitions aren't validated as a strict state machine (e.g., nothing currently blocks jumping from `PENDING` directly to `DELIVERED`)
- Delivery address on an order is a live reference rather than a snapshot — editing/deleting an address could affect historical order display
- No payment integration (out of scope for this project)
- Search/filter is client-side, suitable at the current data scale but would move server-side with a larger dataset



Built as a personal project to demonstrate full-stack development with proper authentication, authorization, and relational data modeling.

# Food-Ordering-System
 