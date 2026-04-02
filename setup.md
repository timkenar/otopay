# OtoPay Setup Guide

## 1. Application Overview

OtoPay is a Next.js payment orchestration application with:

- A built-in admin dashboard
- A unified API for Mpesa and Paystack
- A Prisma-backed PostgreSQL database
- Transaction persistence and webhook delivery logs

Main areas of the application:

- Landing page: `/`
- Dashboard overview: `/dashboard`
- Transactions: `/dashboard/transactions`
- Services: `/dashboard/services`
- Webhooks: `/dashboard/webhooks`
- API keys: `/dashboard/api-keys`
- Settings: `/dashboard/settings`

## 2. Technology Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod request validation

## 3. Prerequisites

Install these before running the app:

- Node.js 20+
- npm
- PostgreSQL 15+ or Docker with Docker Compose

## 4. Environment Configuration

Create `.env` from `.env.example`.

Current environment variables:

- `DATABASE_URL`
  PostgreSQL connection string used by Prisma.
- `NEXTAUTH_SECRET`
  Reserved for future session-based auth.
- `OTOPAY_JWT_SECRET`
  Reserved for future JWT/session usage.
- `MPESA_CONSUMER_KEY`
  Mpesa Daraja consumer key.
- `MPESA_CONSUMER_SECRET`
  Mpesa Daraja consumer secret.
- `MPESA_SHORTCODE`
  Default business shortcode for Mpesa requests.
- `MPESA_PASSKEY`
  Mpesa passkey for STK flows.
- `MPESA_CALLBACK_TOKEN`
  Optional shared token for validating Mpesa callback payloads.
- `PAYSTACK_SECRET_KEY`
  Paystack secret key.
- `PAYSTACK_WEBHOOK_SECRET`
  Secret used to verify `x-paystack-signature`.
- `OTOPAY_WEBHOOK_SIGNING_SECRET`
  Optional secret used by OtoPay to sign outbound webhooks to client services.

Default local database URL:

```env
DATABASE_URL="postgresql://otopay:otopay@localhost:5432/otopay?schema=public"
```

## 5. Database Setup

### Option A: Local PostgreSQL

Create a local database and user that match `.env`:

```sql
CREATE USER otopay WITH PASSWORD 'otopay';
CREATE DATABASE otopay OWNER otopay;
GRANT ALL PRIVILEGES ON DATABASE otopay TO otopay;
```

If you already have an existing PostgreSQL user and database, update `DATABASE_URL` in `.env` to use your real values.

### Option B: Docker Compose

The project includes `docker-compose.yml` with a PostgreSQL 16 container.

Start it with:

```bash
docker compose up -d
```

If Docker permissions fail, either:

- Run with `sudo docker compose up -d`, or
- Add your user to the `docker` group and restart your shell session

## 6. Prisma Client, Schema Push, and Migrations

### Generate Prisma client

```bash
npm run db:generate
```

### Push the schema in development

```bash
npm run db:push
```

This is fine for fast local development.

### Create proper development migrations

For tracked schema changes, use Prisma migrations:

```bash
npx prisma migrate dev --name init
```

For future schema updates:

```bash
npx prisma migrate dev --name describe_change
```

To deploy checked-in migrations in another environment:

```bash
npx prisma migrate deploy
```

### Seed local data

```bash
npm run db:seed
```

The seed creates:

- One admin user
- Two services
- Two API keys
- Sample transactions
- Sample webhook logs

## 7. Running the Application

Install dependencies:

```bash
npm install
```

Then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Default dev server:

- `http://localhost:3000`

If port `3000` is in use, Next.js will move to another port such as `3001`.

## 8. Seeded Services and API Keys

Seeded services:

- `core-shop`
- `oto-rides`

Seeded raw API keys:

- `otop_live_6e2c.core-shop-secret`
- `otop_test_89af.oto-rides-secret`

How authentication works:

- Send the key in `x-api-key`
- Or send it as `Authorization: Bearer <key>`

Current scope usage:

- `payments:write`
  Required for payment initiation routes
- `transactions:read`
  Required for transaction lookup

## 9. Dashboard Navigation

The admin dashboard navigation is:

- `Overview`
  High-level transaction volume, active services, and webhook alerts
- `Transactions`
  Payment records across providers
- `Services`
  Connected client services and provider settings
- `Webhooks`
  Delivery attempts, retries, and failures
- `API Keys`
  Service-linked API credentials and scopes
- `Settings`
  Production hardening reminders and operational notes

## 10. API Setup and Usage

### Authentication

Protected routes require a valid API key.

Headers:

```http
x-api-key: otop_live_6e2c.core-shop-secret
```

or:

```http
Authorization: Bearer otop_live_6e2c.core-shop-secret
```

### Mpesa STK request

Endpoint:

```http
POST /api/payments/stk
```

Example body:

```json
{
  "serviceSlug": "core-shop",
  "amount": 2500,
  "currency": "KES",
  "customerPhone": "+254700000001",
  "reference": "ORDER-1001",
  "metadata": {
    "source": "checkout"
  }
}
```

### Paystack initialization request

Endpoint:

```http
POST /api/payments/paystack
```

Example body:

```json
{
  "serviceSlug": "core-shop",
  "amount": 2500,
  "currency": "KES",
  "customerEmail": "billing@example.com",
  "reference": "ORDER-1002",
  "metadata": {
    "source": "subscription"
  }
}
```

### Transaction lookup

Endpoint:

```http
GET /api/payments/transactions/:id
```

Notes:

- Requires `transactions:read`
- The API key must belong to the same service as the transaction

### Mpesa callback endpoint

Endpoint:

```http
POST /api/payments/mpesa/callback
```

Accepted payload shape:

```json
{
  "transactionId": "txn_...",
  "providerReference": "MPESA-...",
  "status": "SUCCESS"
}
```

If `MPESA_CALLBACK_TOKEN` is configured, include:

```json
{
  "callbackToken": "your-shared-token"
}
```

### Paystack webhook endpoint

Endpoint:

```http
POST /api/payments/paystack/webhook
```

Requirements:

- Include `x-paystack-signature`
- Signature verification uses `PAYSTACK_WEBHOOK_SECRET`

Accepted payload shape:

```json
{
  "transactionId": "txn_...",
  "providerReference": "PSTK-...",
  "status": "SUCCESS"
}
```

## 11. Connecting External Services

### Connecting a client application to OtoPay

To connect a Django, Node.js, or other backend service:

1. Create or reuse a `Service` record in the database
2. Set its `slug`
3. Set its `webhookUrl`
4. Create an API key linked to that service
5. Call OtoPay payment routes using that API key

The `serviceSlug` in request payloads must match the service tied to the API key.

### Connecting Mpesa

Add these values to `.env`:

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`

Optional:

- `MPESA_CALLBACK_TOKEN`

Per-service overrides can also be stored in `Service.providerSettings`, such as:

- `mpesaShortcode`

### Connecting Paystack

Add these values to `.env`:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`

Per-service overrides can also be stored in `Service.providerSettings`, such as:

- `paystackChannel`

### Connecting downstream service webhooks

Each service should expose an endpoint that OtoPay can call after transaction updates.

OtoPay sends a JSON payload shaped like:

```json
{
  "transactionId": "txn_123",
  "status": "SUCCESS",
  "providerData": {
    "providerReference": "PSTK-ABC123",
    "initiated": {},
    "callback": {}
  },
  "metadata": {
    "source": "checkout"
  }
}
```

If `OTOPAY_WEBHOOK_SIGNING_SECRET` is set, OtoPay also sends:

```http
x-otopay-signature: <hmac-sha256>
```

## 12. Recommended Development Workflow

When changing the schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Run `npm run db:generate`
4. Update `prisma/seed.ts` if seed data must change

When testing API flows:

1. Seed the database
2. Use one of the seeded API keys
3. Create a payment
4. Trigger a callback or webhook
5. Verify transaction and webhook status in the dashboard

## 13. Troubleshooting

### `Environment variable not found: DATABASE_URL`

Make sure `.env` exists and includes a valid PostgreSQL `DATABASE_URL`.

### `P1000: Authentication failed`

Your database is reachable, but the user, password, or database name in `DATABASE_URL` is wrong.

### Docker permission denied

Your shell user does not have permission to talk to the Docker socket.

### Port 3000 already in use

Next.js will start on another port such as `3001`.

## 14. Important Notes

- Provider adapters are still deterministic mocks for payment initiation
- The database, orchestration, and webhook logging are live in the application flow
- Admin authentication is not fully implemented yet
