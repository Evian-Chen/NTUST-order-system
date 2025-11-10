// TODO: Needs testing after team integration
// - Story 1: Checkout (requires item addition API)
// - Story 2: Payment (requires item addition API)

# Order APIs

## Story 0: Create Cart
POST /api/orders

## Story 1: Checkout
POST /api/orders/:id/checkout

## Story 2: Payment
POST /api/orders/:id/payments
Body: { "method": "cash" | "card" }

## Story 3: Get Order
GET /api/orders/:id

## Story 4: Query Orders
GET /api/orders?date=YYYY-MM-DD&status=PAID