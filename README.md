# Slooze Food Ordering App

Slooze is a full-stack food ordering application built with Next.js App Router, Prisma, and PostgreSQL. It uses role-based access control (RBAC) plus country-scoped access so users only see allowed restaurant and order data.

## Project Overview

- Single Next.js 14 app for both frontend and API route handlers
- Credentials-based authentication with NextAuth.js v5 and JWT sessions
- Strict access control for `ADMIN`, `MANAGER`, and `MEMBER`
- Country-based data scoping for non-admin users (`INDIA`, `AMERICA`)
- Server-side validation using Zod for all mutations
- Prisma ORM for typed database access

## Features

- Login with seeded users
- Browse restaurants and menus by country scope
- Add menu items to a cart (cart is constrained to one restaurant)
- Create and checkout orders
- Order history with role-based actions
- Payment method update (admin only)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- NextAuth.js v5 (Credentials Provider)
- Prisma + PostgreSQL
- Zustand (cart)
- TanStack Query (server state)
- Zod (schema validation)

## Prerequisites

- Node.js 18+
- PostgreSQL running locally or remotely
- pnpm

## Environment Variables

Create `.env` in project root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/slooze
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

Note:
- `DIRECT_URL` is optional in this repo (current Prisma schema does not require it).
- If you later add `directUrl = env("DIRECT_URL")` in Prisma datasource, set `DIRECT_URL` to your direct/non-pooled database connection string.

## Setup

```bash
git clone <your-repo-url>
cd slooze-assignment
pnpm install
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm prisma generate
pnpm dev
```

## Seeded Login Credentials

| Name | Role | Country | Email | Password |
| --- | --- | --- | --- | --- |
| Nick Fury | ADMIN | null | nick@slooze.com | password123 |
| Captain Marvel | MANAGER | INDIA | marvel@slooze.com | password123 |
| Captain America | MANAGER | AMERICA | america@slooze.com | password123 |
| Thanos | MEMBER | INDIA | thanos@slooze.com | password123 |
| Thor | MEMBER | INDIA | thor@slooze.com | password123 |
| Travis | MEMBER | AMERICA | travis@slooze.com | password123 |

## RBAC Permissions

| Action | ADMIN | MANAGER | MEMBER |
| --- | --- | --- | --- |
| View restaurants/menu (country scoped) | Yes | Yes | Yes |
| Create order | Yes | Yes | Yes |
| View orders | All | Own + country scope | Own + country scope |
| Checkout order | Yes | Yes | No |
| Cancel order | Yes | Yes | No |
| Update payment method | Yes | No | No |

## API Routes

All APIs return a consistent envelope:

```json
{ "success": true, "data": {} }
```

or

```json
{ "success": false, "error": "message" }
```

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/restaurants` | ADMIN, MANAGER, MEMBER | List restaurants with country filter |
| GET | `/api/restaurants/:id` | ADMIN, MANAGER, MEMBER | Get one restaurant with country guard |
| GET | `/api/restaurants/:id/menu` | ADMIN, MANAGER, MEMBER | Get menu items for a restaurant |
| GET | `/api/orders` | ADMIN, MANAGER, MEMBER | List orders by role and scope |
| POST | `/api/orders` | ADMIN, MANAGER, MEMBER | Create order with server-side price computation |
| GET | `/api/orders/:id` | ADMIN, MANAGER, MEMBER | Get one order with ownership checks |
| POST | `/api/orders/:id/checkout` | ADMIN, MANAGER | Mark order as `CONFIRMED` |
| PATCH | `/api/orders/:id/cancel` | ADMIN, MANAGER | Mark order as `CANCELLED` (allowed statuses only) |
| PATCH | `/api/orders/:id/payment` | ADMIN | Update order payment method |

## Helpful Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm prisma migrate dev --name init
pnpm prisma db seed
pnpm prisma generate
```

## Troubleshooting

- `Cannot find module 'autoprefixer'`
  - Run: `pnpm add -D autoprefixer`
- `Cannot find module '.prisma/client/default'`
  - Run: `pnpm prisma generate`
- Prisma install/build scripts were skipped by pnpm
  - Run `pnpm prisma generate` manually after install.

## Architecture

```mermaid
flowchart TD
  A[Client Pages\nLogin Dashboard Restaurants Cart Orders] --> B[Typed API Wrapper]
  B --> C[Next.js Route Handlers]
  C --> D[RBAC Helpers\nrequireRole + getCountryScope]
  C --> E[Zod Validation]
  C --> F[Prisma ORM]
  F --> G[(PostgreSQL)]
  A --> H[NextAuth Session]
  H --> I[NextAuth v5 Config]
  I --> F
  A --> J[Zustand Cart Store]
```
