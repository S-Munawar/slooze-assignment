## Project: Slooze Food Ordering App — Next.js Full Stack (App Router) with RBAC + Country-Scoped Access

### STACK
- Framework: Next.js 14 (App Router) — frontend + API Route Handlers (no separate backend)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- ORM: Prisma
- Database: PostgreSQL
- Auth: NextAuth.js v5 (credentials provider) with JWT strategy
- State: Zustand (cart), TanStack Query (server state)
- Validation: Zod on all API route inputs

---

### PROJECT STRUCTURE
slooze/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # redirects to /login or /dashboard
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                    # sidebar + auth guard
│   │   ├── page.tsx                      # redirect to /dashboard/restaurants
│   │   ├── restaurants/
│   │   │   ├── page.tsx                  # restaurant listing
│   │   │   └── [id]/
│   │   │       └── page.tsx              # menu view + add to cart
│   │   ├── cart/
│   │   │   └── page.tsx                  # cart review + checkout
│   │   └── orders/
│   │       └── page.tsx                  # order history + actions
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/route.ts    # NextAuth handler
│       ├── restaurants/
│       │   ├── route.ts                  # GET /api/restaurants
│       │   └── [id]/
│       │       ├── route.ts              # GET /api/restaurants/:id
│       │       └── menu/
│       │           └── route.ts          # GET /api/restaurants/:id/menu
│       └── orders/
│           ├── route.ts                  # GET, POST /api/orders
│           └── [id]/
│               ├── route.ts              # GET /api/orders/:id
│               ├── checkout/
│               │   └── route.ts          # POST /api/orders/:id/checkout
│               ├── cancel/
│               │   └── route.ts          # PATCH /api/orders/:id/cancel
│               └── payment/
│                   └── route.ts          # PATCH /api/orders/:id/payment
├── components/
│   ├── ui/                               # shadcn components
│   ├── RestaurantCard.tsx
│   ├── MenuItemCard.tsx
│   ├── CartDrawer.tsx
│   ├── OrderCard.tsx
│   ├── Sidebar.tsx
│   └── RoleBadge.tsx
├── lib/
│   ├── prisma.ts                         # Prisma singleton
│   ├── auth.ts                           # NextAuth config + session helpers
│   ├── rbac.ts                           # requireRole + applyCountryScope helpers
│   └── api.ts                            # typed fetch wrapper for client components
├── store/
│   └── cart.ts                           # Zustand cart store
├── types/
│   └── index.ts                          # shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts                          # Next.js middleware for route protection
├── .env
├── package.json
└── README.md

---

### DATABASE SCHEMA (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role
  country   Country?
  orders    Order[]
}

model Restaurant {
  id       String     @id @default(cuid())
  name     String
  cuisine  String
  country  Country
  imageUrl String?
  items    MenuItem[]
  orders   Order[]
}

model MenuItem {
  id           String      @id @default(cuid())
  name         String
  description  String
  price        Float
  category     String
  imageUrl     String?
  restaurantId String
  restaurant   Restaurant  @relation(fields: [restaurantId], references: [id])
  orderItems   OrderItem[]
}

model Order {
  id            String        @id @default(cuid())
  userId        String
  restaurantId  String
  status        OrderStatus   @default(PENDING)
  paymentMethod PaymentMethod @default(CARD)
  totalAmount   Float
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User          @relation(fields: [userId], references: [id])
  restaurant    Restaurant    @relation(fields: [restaurantId], references: [id])
  items         OrderItem[]
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  menuItemId String
  quantity   Int
  price      Float
  order      Order    @relation(fields: [orderId], references: [id])
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
}

enum Role          { ADMIN MANAGER MEMBER }
enum Country       { INDIA AMERICA }
enum OrderStatus   { PENDING CONFIRMED CANCELLED }
enum PaymentMethod { CARD UPI WALLET }
```

---

### SEED DATA (prisma/seed.ts)

Seed exactly these users (bcrypt-hash passwords before insert):

| Name            | Role    | Country | Email                   | Password    |
|-----------------|---------|---------|-------------------------|-------------|
| Nick Fury       | ADMIN   | null    | nick@slooze.com         | password123 |
| Captain Marvel  | MANAGER | INDIA   | marvel@slooze.com       | password123 |
| Captain America | MANAGER | AMERICA | america@slooze.com      | password123 |
| Thanos          | MEMBER  | INDIA   | thanos@slooze.com       | password123 |
| Thor            | MEMBER  | INDIA   | thor@slooze.com         | password123 |
| Travis          | MEMBER  | AMERICA | travis@slooze.com       | password123 |

Seed at least 3 restaurants per country. Each restaurant has at least 5 menu items
with realistic name, description, price, and category (veg / non-veg / beverage).

---

### AUTH (lib/auth.ts + app/api/auth/[...nextauth]/route.ts)

Use NextAuth.js v5 with CredentialsProvider:
- Validate email + password (bcrypt.compare) against DB
- Include id, name, email, role, country in the JWT token and session
- Extend the Session and JWT types in types/next-auth.d.ts so `session.user.role`
  and `session.user.country` are fully typed
```ts
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string; role: Role; country: Country | null }
  }
  interface JWT {
    id: string; role: Role; country: Country | null
  }
}
```

---

### ACCESS CONTROL (lib/rbac.ts)

Implement two reusable async helpers to be called at the TOP of every API route handler:
```ts
// Throws a NextResponse 403 if role is not allowed
export async function requireRole(
  req: Request,
  ...roles: Role[]
): Promise<Session["user"]>

// Returns the country filter to apply to all DB queries.
// ADMIN → undefined (no filter)
// MANAGER / MEMBER → their country value
export async function getCountryScope(
  user: Session["user"]
): Promise<Country | undefined>
```

Usage pattern in every route handler:
```ts
export async function GET(req: Request) {
  const user = await requireRole(req, "ADMIN", "MANAGER", "MEMBER");
  const countryFilter = await getCountryScope(user);

  const restaurants = await prisma.restaurant.findMany({
    where: countryFilter ? { country: countryFilter } : undefined,
  });

  return NextResponse.json({ success: true, data: restaurants });
}
```

Never replicate access-control logic inside components or pages — always enforce in route handlers.

---

### API ROUTE HANDLERS

All handlers must:
1. Call `requireRole` first (returns user or throws 403 NextResponse)
2. Call `getCountryScope` to get `countryFilter`
3. Apply `countryFilter` in every Prisma query's `where` clause
4. Return `{ success: true, data }` or `{ success: false, error: string }`
5. Validate request bodies with Zod before touching the DB

#### GET /api/restaurants
- Returns all restaurants filtered by countryScope

#### GET /api/restaurants/:id
- Returns single restaurant; 404 if not found; 403 if country mismatch

#### GET /api/restaurants/:id/menu
- Returns menu items for that restaurant; same country guard

#### POST /api/orders
- Roles: ADMIN, MANAGER, MEMBER
- Body: `{ restaurantId: string, items: [{ menuItemId: string, quantity: number }] }`
- Validate restaurant exists and is in user's country (for non-admins)
- Compute totalAmount server-side from DB prices (never trust client prices)
- Create Order + OrderItems in a Prisma transaction
- Return created order with items

#### GET /api/orders
- ADMIN sees all orders
- MANAGER / MEMBER see only their own orders, scoped to their country's restaurants

#### GET /api/orders/:id
- Return order with items; 403 if order doesn't belong to user (unless ADMIN)

#### POST /api/orders/:id/checkout
- Roles: ADMIN, MANAGER only (return 403 for MEMBER)
- Sets status = CONFIRMED

#### PATCH /api/orders/:id/cancel
- Roles: ADMIN, MANAGER only
- Sets status = CANCELLED
- Only allowed if current status is PENDING or CONFIRMED

#### PATCH /api/orders/:id/payment
- Role: ADMIN only
- Body: `{ paymentMethod: PaymentMethod }`
- Updates paymentMethod field

---

### NEXT.JS MIDDLEWARE (middleware.ts)

Protect all /dashboard/* and /api/* routes (except /api/auth/*):
- Redirect unauthenticated users to /login for page routes
- Return 401 JSON for unauthenticated API requests
```ts
export { auth as middleware } from "@/lib/auth"
export const config = {
  matcher: ["/dashboard/:path*", "/api/((?!auth).*)"]
}
```

---

### FRONTEND PAGES & COMPONENTS

#### /login
- Email + password form
- On success: redirect to /dashboard/restaurants
- Show error message on invalid credentials

#### /dashboard layout (components/Sidebar.tsx)
- Show user name, role badge, country badge (if not admin)
- Navigation links: Restaurants, My Orders, Cart (with item count badge)
- Conditionally render nav items based on role (no point linking to hidden features)

#### /dashboard/restaurants
- Grid of RestaurantCard components
- Each card: restaurant name, cuisine, country tag, "View Menu" button

#### /dashboard/restaurants/[id]
- List of MenuItemCard components
- Each card: name, description, price, category badge, "Add to Cart" button
- Cart is per-restaurant — if user tries to add from a different restaurant,
  show a confirmation dialog: "This will clear your current cart. Continue?"

#### /dashboard/cart
- List of cart items with quantity controls (+/-)
- Running total
- "Place Order" button (calls POST /api/orders then POST /api/orders/:id/checkout)
- Hidden entirely for MEMBER role — redirect to /dashboard/restaurants

#### /dashboard/orders
- List of OrderCard components showing status, restaurant, total, items, date
- "Cancel Order" button: visible for ADMIN and MANAGER only
- "Update Payment" dropdown: visible for ADMIN only
- Status badge: PENDING (yellow), CONFIRMED (green), CANCELLED (red)

#### Role-based UI enforcement pattern:
```tsx
// In any component
const { data: session } = useSession()
const canCheckout = session?.user.role !== "MEMBER"
const canUpdatePayment = session?.user.role === "ADMIN"
```

---

### ZUSTAND CART STORE (store/cart.ts)
```ts
interface CartItem { menuItemId: string; name: string; price: number; quantity: number }
interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  addItem: (restaurantId: string, item: CartItem) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}
```

---

### TYPED API CLIENT (lib/api.ts)

Create a typed fetch wrapper for use in client components and TanStack Query hooks:
```ts
export const api = {
  restaurants: {
    list: () => fetch("/api/restaurants").then(r => r.json()),
    get: (id: string) => fetch(`/api/restaurants/${id}`).then(r => r.json()),
    menu: (id: string) => fetch(`/api/restaurants/${id}/menu`).then(r => r.json()),
  },
  orders: {
    list: () => fetch("/api/orders").then(r => r.json()),
    create: (body: CreateOrderInput) => fetch("/api/orders", { method: "POST", body: JSON.stringify(body) }).then(r => r.json()),
    checkout: (id: string) => fetch(`/api/orders/${id}/checkout`, { method: "POST" }).then(r => r.json()),
    cancel: (id: string) => fetch(`/api/orders/${id}/cancel`, { method: "PATCH" }).then(r => r.json()),
    updatePayment: (id: string, paymentMethod: PaymentMethod) =>
      fetch(`/api/orders/${id}/payment`, { method: "PATCH", body: JSON.stringify({ paymentMethod }) }).then(r => r.json()),
  },
}
```

---

### ENVIRONMENT VARIABLES (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/slooze
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

---

### README.md — GENERATE WITH:
1. Project overview + features
2. Tech stack
3. Prerequisites: Node 18+, PostgreSQL, pnpm
4. Setup:
```bash
   git clone ...
   pnpm install
   cp .env.example .env   # fill in DATABASE_URL and NEXTAUTH_SECRET
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   pnpm dev
```
5. Seeded credentials table
6. RBAC permissions table
7. API routes reference table
8. Architecture diagram (Mermaid)

---

### PACKAGE.JSON — KEY DEPENDENCIES
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "next-auth": "^5.0.0-beta",
    "@prisma/client": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "zod": "^3.0.0",
    "bcryptjs": "^2.4.3",
    "tailwindcss": "^3.0.0",
    "@shadcn/ui": "latest"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/bcryptjs": "^2.4.0",
    "typescript": "^5.0.0"
  }
}
```

---

### GENERATION ORDER FOR COPILOT

Ask Copilot to generate in this exact sequence to avoid missing imports:

1. prisma/schema.prisma
2. prisma/seed.ts
3. types/index.ts + types/next-auth.d.ts
4. lib/prisma.ts
5. lib/auth.ts + app/api/auth/[...nextauth]/route.ts
6. lib/rbac.ts
7. middleware.ts
8. All app/api/ route handlers
9. store/cart.ts
10. lib/api.ts
11. components/ (Sidebar, RestaurantCard, MenuItemCard, CartDrawer, OrderCard, RoleBadge)
12. All app/dashboard/ pages
13. app/login/page.tsx
14. README.md

---

### STRICT RULES FOR ALL GENERATED CODE
- TypeScript strict mode, no `any`
- All Prisma queries must apply `countryFilter` where relevant
- RBAC enforced only in route handlers, never duplicated in UI (UI hides buttons, but API must still reject)
- No raw Prisma errors exposed to client
- Consistent response envelope: `{ success: boolean, data?, error? }`
- All mutations use Zod schemas for body validation