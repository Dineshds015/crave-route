# CraveRoute — Artisanal Food Order Management & Kitchen Journey

CraveRoute is a full-stack food ordering application with an artisanal editorial aesthetic and a real-time order lifecycle engine called **Kitchen Journey**. Customers can explore hand-crafted culinary items, place orders with server-calculated trusted pricing and idempotency protection, and follow their order's live lifecycle through Server-Sent Events (SSE).

---

## 1. Architecture Overview

CraveRoute is architected as two decoupled applications:

```
crave-route/
├── backend/                   # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/            # Env configuration & MongoDB connection (with in-memory fallback)
│   │   ├── models/            # MenuItem, Order, and immutable OrderStatusEvent schemas
│   │   ├── repositories/      # Data access layer (Menu & Order repositories)
│   │   ├── services/          # State Machine, OrderService, MenuService, SSEService, SimulationService
│   │   ├── validators/        # Zod input schemas for order creation & transitions
│   │   ├── controllers/       # HTTP request handlers & SSE endpoint
│   │   ├── routes/            # Modular Express routes
│   │   ├── middleware/        # Error handler & rate limiting
│   │   ├── scripts/           # Realistic artisanal seed script
│   │   ├── app.ts             # Express app instance (exported for Supertest)
│   │   └── server.ts          # Server listener & graceful shutdown
│   └── tests/                 # Vitest + Supertest integration & state machine test suites
│
├── frontend/                  # Next.js App Router (React 19, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Artisanal Menu, Hero Banner & Story
│   │   │   ├── checkout/      # Validated Checkout with Idempotency Key
│   │   │   ├── order/[id]/    # Live Kitchen Journey Tracker (SSE)
│   │   │   └── layout.tsx     # Root Layout with CartProvider & Navbar
│   │   ├── components/        # MenuCard, CartDrawer, OrderTracker, EventTimeline, HeroBanner
│   │   ├── context/           # CartContext with server-aligned price calculations
│   │   ├── hooks/             # useOrderEvents (SSE connection, reconnect, fallback)
│   │   ├── services/          # Resilient fetch API client
│   │   ├── types/             # Shared TypeScript interfaces
│   │   └── tests/             # Vitest + React Testing Library component tests
│
└── package.json               # Root monorepo scripts
```

---

## 2. Order State Machine & Lifecycle Rules

The order engine strictly enforces valid status transitions:

```
[ RECEIVED ] ───────► [ ACCEPTED ] ───────► [ PREPARING ] ───────► [ READY ] ───────► [ OUT_FOR_DELIVERY ] ───────► [ DELIVERED ]
      │                     │
      ▼                     ▼
[ CANCELLED ]         [ CANCELLED ]
```

### Transition Invariants:
1. **Sequential Forward Flow:** Orders only advance in order: `RECEIVED` → `ACCEPTED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED`.
2. **Cancellation Boundaries:** Orders may **only** be cancelled while in `RECEIVED` or `ACCEPTED`. Once preparation has begun (`PREPARING`, `READY`, `OUT_FOR_DELIVERY`, or `DELIVERED`), cancellation is rejected with `400 Bad Request`.
3. **Terminal States:** `DELIVERED` and `CANCELLED` cannot transition further.
4. **Optimistic Concurrency Protection:** Each order maintains an integer `version` field. Status updates conditionally match `{ _id, status, version }` and increment `version` atomically. Conflicting simultaneous transitions return `409 Conflict`.
5. **Snapshot Pricing:** When an order is placed, line items capture immutable snapshots (`name`, `unitPrice`, `quantity`, `itemTotal`). Subsequent price changes to menu items never affect historical or active orders.
6. **Automated Simulation Worker:** A backend simulation service advances demo orders through each stage with configurable intervals (default 4 seconds), publishing live updates via SSE.

---

## 3. Real-Time Server-Sent Events (SSE)

- **Endpoint:** `GET /api/orders/:id/events`
- **Headers:** `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`.
- **Immediate Snapshot:** Upon connecting, the client immediately receives `event: order_snapshot` containing current order details and history.
- **Live Broadcast:** Whenever the order transitions (via customer action, kitchen dispatch, or simulation), the backend publishes `event: order_updated`.
- **Heartbeats:** Periodic `: keepalive-ping` comments prevent reverse proxy and browser dropouts.
- **Resilient Reconnection:** The frontend `useOrderEvents` hook monitors connection drops, switches to `RECONNECTING` state, performs exponential backoff retries, and polls as a fallback if SSE drops.

---

## 4. API Specification

### Authentication & Mobile OTP
- **`POST /api/auth/send-otp`**
  - Body: `{ "phone": "+91 98765 43210" }`
  - Returns: `{ success: true, data: { phone, otp, message } }`
- **`POST /api/auth/verify-otp`**
  - Body: `{ "phone": "+91 98765 43210", "otp": "123456" }`
  - Returns: `{ success: true, data: { user: { _id, phone, name }, token } }`
- **`GET /api/auth/demo-users`**
  - Returns seeded demo accounts stored in MongoDB Atlas:
    * `+91 98765 43210` (Dinesh Kumar, OTP: `123456`)
    * `+91 11111 11111` (Alex Chen, OTP: `123456`)
    * `+91 99999 88888` (Sarah Jenkins, OTP: `123456`)
    * `+1 234 567 8900` (Marcus Vance, OTP: `123456`)

### Menu
- **`GET /api/menu`**
  - Query: `?availableOnly=true` (optional)
  - Returns: `{ success: true, data: MenuItem[] }` (25 culinary items across Burgers, Pizzas, Pasta, Salads, Starters, Desserts, Drinks)
- **`GET /api/menu/:id`**
  - Returns: `{ success: true, data: MenuItem }`

### Orders
- **`GET /api/orders`**
  - Query: `?phone=+919876543210` (filter orders by customer mobile number across devices)
  - Query: `?refs=CR-XXXXXX,CR-YYYYYY` (filter by reference codes)
  - Query: `?status=DELIVERED` (filter by state machine status)
- **`POST /api/orders`**
  - Headers: `Idempotency-Key: <unique-key>` (optional, or provided in body)
  - Body:
    ```json
    {
      "customer": {
        "name": "Amara Schmidt",
        "phone": "+49 170 1234567",
        "deliveryAddress": "Kastanienallee 24, Berlin",
        "notes": "Ring top bell"
      },
      "items": [
        { "menuItemId": "651a2b...", "quantity": 2 }
      ],
      "idempotencyKey": "order-req-abc-123",
      "isSimulated": true
    }
    ```
  - Calculates server-side subtotal, delivery fee (free above €45, else €3.50), service fee (€1.50), and tax (8%).
  - Returns `201 Created` with created order (or `200 OK` if returning existing order matching idempotency key).
- **`GET /api/orders/:id`**
  - Retrieves order by MongoDB ObjectId or reference code (`CR-XXXXXX`).
  - Returns: order details, snapshot items, pricing, current status, allowed transitions, and timestamped event history.
- **`PATCH /api/orders/:id/status`**
  - Body: `{ "status": "ACCEPTED", "note": "Kitchen confirmed ticket", "expectedVersion": 0 }`
  - Validates transition against state machine and checks version concurrency lock.
- **`DELETE /api/orders/:id`**
  - Deletes order only if in `RECEIVED` or `CANCELLED` state.
- **`GET /api/orders/:id/events`**
  - Real-time SSE stream.
- **`POST /api/orders/:id/simulate`**
  - Body: `{ "delayMs": 3500 }`
  - Initiates background simulation worker.

---

## 5. Getting Started

### Prerequisites
- Node.js >= 18 (Tested on v24.19.0)
- npm >= 9

### Environment Setup

Create `.env` in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/craveroute
CORS_ORIGIN=http://localhost:3000
SIMULATION_STEP_DELAY_MS=4000
```
*(Note: If external MongoDB is not running, the backend automatically initializes an embedded in-memory MongoDB instance for standalone development).*

Create `.env` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Installation
From the repository root:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Seed Menu Data
```bash
# From repository root
npm run seed
# or
cd backend && npm run seed
```

### Running Locally
Run the backend and frontend in separate terminals:
```bash
# Terminal 1: Backend (runs on port 5000)
npm run dev:backend

# Terminal 2: Frontend (runs on port 3000)
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 6. Automated Test Suite

Both backend and frontend feature comprehensive automated test suites written with Vitest, Supertest, and React Testing Library following Test-Driven Development (TDD).

```bash
# Run all tests (backend + frontend)
npm run test

# Run backend test suite (26 tests across 6 files)
npm run test:backend

# Run frontend test suite (6 tests across 3 files)
npm run test:frontend
```

### Backend Test Coverage:
1. `tests/state-machine.test.ts`: Forward progression, cancellation boundaries, invalid skip transitions, terminal state immutability, simulation helper (9 tests).
2. `tests/menu.api.test.ts`: Retrieval of menu items, availability filtering, 404 handling (3 tests).
3. `tests/order.api.test.ts`: Server-calculated pricing, snapshot pricing, input validation, order retrieval by ID and reference code, permitted transitions, forbidden transitions, conditional deletion (11 tests).
4. `tests/idempotency.test.ts`: Duplicate submission with identical idempotency key returns existing order without creating duplicate orders (1 test).
5. `tests/concurrency.test.ts`: Concurrent competing status transitions with optimistic concurrency locking (1 test).
6. `tests/sse.test.ts`: SSE connection handshake, immediate snapshot delivery, real-time broadcast on status change (2 tests).
*Total: 27/27 backend tests passing.*

### Frontend Test Coverage:
1. `CartContext.test.tsx`: Cart addition, quantity updates, removal, and server-aligned totals calculation.
2. `MenuCard.test.tsx`: Item display, availability handling, dietary tags, and sold-out states.
3. `OrderTracker.test.tsx`: Desktop stepper & mobile timeline rendering, live SSE badge, event timeline, simulated map, and cancellation button disabling when past accepted.
*Total: 6/6 frontend tests passing.*

---

## 7. Screens Implemented

1. **Screen A: Home (`/`)**: Hero banner with gourmet burger photography, headline *"Good Food Delivered Right"*, delivery location input, trust indicators (*"Fresh Ingredients Always"*, *"Fast Delivery On Time"*, *"Track Your Order Live Updates"*), category quick-links, and featured culinary grid.
2. **Screen B: Menu Discovery (`/menu`)**: Interactive category pills (*All, Burgers, Pizzas, Pasta, Salads, Drinks*), instant text search with clear button, vegetarian toggle, responsive product card grid with high-resolution food imagery, dietary tags, prices, and Add/quantity steppers.
3. **Screen C: Cart (`/cart`)**: Product thumbnails, dish metadata, quantity increment/decrement controls, line item prices, remove actions, and persistent Order Summary with subtotal, delivery fee, and total.
4. **Screen D: Checkout (`/checkout`)**: Distraction-free layout with customer full name, phone number, delivery address, field-level validation, live simulation toggle, and server-authorized Order Summary.
5. **Screen E: Order Confirmation (`/order/[id]/confirmation`)**: Memorable celebration screen with animated green checkmark, copyable `#CR-XXXXXX` reference code, estimated preparation time note, Track Order primary action, and View Details secondary action.
6. **Screen F: Live Order Tracking (`/order/[id]`)**: Kitchen Journey real-time visual tracker, desktop horizontal stepper, mobile vertical timeline, animated status pulse, simulated courier map vector card with GPS route, and live SSE event stream.
7. **Screen G: Orders History (`/orders`)**: Customer order lookup by reference code, status filter tabs (*All, Delivered, Preparing, Out for Delivery, Cancelled*), and order history cards with item counts and totals.
8. **Screen H: Order Details (`/order/[id]/details`)**: Itemized breakdown with snapshot historical prices, delivery address card, and complete timestamped audit timeline.

---

## 8. Technical Assessment Briefing Notes

For the evaluation presentation and video walkthrough:

### Architecture & Modularity
- Decoupled Next.js App Router frontend and Node/Express backend.
- Backend follows strict layered architecture: `Route → Controller → Service → Repository → Model`.
- Express app is separated from `server.listen()`, allowing isolated Supertest execution without port conflicts.
- Standalone development mode features an embedded in-memory MongoDB fallback with automatic culinary menu auto-seeding.

### Concurrency & Data Integrity
- Snapshot pricing ensures financial accuracy for historical records regardless of future menu updates.
- Optimistic concurrency control via version checking prevents lost updates and conflicting state transitions.
- Idempotency keys protect against duplicate charges during network retries or double clicks.

### Live Kitchen Journey via SSE
- Chosen over WebSockets for lightweight, HTTP-native unidirectional event streaming.
- Heartbeats maintain active socket connections across mobile browsers and proxies.
- Handled gracefully in React with auto-reconnection and exponential backoff.

### Design System & Visual Identity
- Original food-tech palette:
  - Deep Forest Green: `#183D2B`
  - Fresh Green: `#39834B`
  - Citrus Highlight: `#C8F169`
  - Warm Ivory Surface: `#FAF9F5`
  - Crisp White: `#FFFFFF`
  - Charcoal Primary Text: `#19231D`
  - Muted Secondary Text: `#70786F`
- Refined typography using Inter with strong hierarchy and generous whitespace.
- Authentic high-resolution food photography for all dishes.

