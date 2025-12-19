# Scarlet Fashion - Walkthrough

## Overview
Scarlet Fashion is a premium ladies' clothing store frontend built with Next.js 14, TailwindCSS, and TypeScript. It features a complete user shopping flow and a comprehensive admin dashboard.

## Key Features
- **Authentication**: Role-based login (User/Admin) with mock JWT.
- **Shop**: Dynamic product filtering, sorting, and search.
- **Cart & Checkout**: Persistent cart state, multi-step checkout with address and payment forms.
- **Admin Panel**: Dashboard with revenue stats, product management (add/edit), inventory control, and order status updates.
- **Design**: Modern "boutique" aesthetic with responsive layouts.

## Verification
### Automated Checks
- **Type Safety**: `tsc` passed successfully.
- **Linting**: Project configured with ESLint.

### Manual Verification Steps
1. **Login**:
   - User: `user@example.com` / `123456` -> Redirects to Shop.
   - Admin: `admin@example.com` / `123456` -> Redirects to Admin Dashboard.
2. **Shop**:
   - Filter by 'Dresses' or sort by Price.
   - Cick a product to view details.
3. **Cart**:
   - Add items, adjust quantity.
   - Proceed to checkout (requires login).
4. **Admin**:
   - `/admin/dashboard`: View simulated revenue.
   - `/admin/products`: Add new variants or edit prices.
   - `/admin/orders`: Mark orders as Shipped/Paid.

## Project Structure
- **/app**: Next.js App Router (separated into `(auth)`, `(shop)`, `(admin)` groups).
- **/services**: Mock API adapters simulating network delays.
- **/store**: Zustand stores for global state (`auth`, `cart`, `ui`).
- **/components**: Reusable UI components.

## Running the Project
```bash
npm run dev
```
Open   - [http://localhost:3000](http://localhost:3000)

## Backend Configuration (Step 2)
The backend is located in `scarlet-fashion-backend`.

### Setup
1. `cd scarlet-fashion-backend`
2. `npm install`
3. Ensure MongoDB and Redis are running (or update `.env`).

### Running
```bash
npm run dev
```
Server runs on port 4000.

### APIs
- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Products**: `/api/products` (Public), `/api/admin/inventory` (Admin)
- **Cart**: `/api/cart` (Redis backed)
- **Orders**: `/api/orders` (With stock reservation)
- **Admin**: `/api/admin/dashboard`.

## Sync Agent (Step 3)
The offline sync agent runs on the "Shop PC".

### Setup
1. `cd scarlet-fashion-sync-agent`
2. `npm install`
3. Configure `.env` (Set `API_BASE_URL` to backend).

### Running
**Development Mode:**
```bash
npx ts-node src/agent.ts
```

**Production Mode (PM2):**
```bash
npm run build
npx pm2 start ecosystem.config.js
```

### Simulation
The agent includes a built-in simulator that:
1. Watches `e4u_exports/` for new CSV orders.
2. Randomly generates a "Billing Confirmation" text file after delay.
3. Agent picks up confirmation and pushes to Cloud.
