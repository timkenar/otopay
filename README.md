# OtoPay

OtoPay is a centralized payment orchestration platform with a built-in admin dashboard for Mpesa and Paystack.

## What the app includes

- Next.js App Router dashboard
- API routes for STK, Paystack initialization, transaction lookup, and webhooks
- Payment orchestrator plus provider adapters
- Prisma schema for services, API keys, transactions, webhook logs, and dashboard users
- Database-backed dashboard pages and API flows
- Outbound webhook logging with retry scheduling

## Structure

```text
otopay/
├── prisma/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── services/
└── package.json
```

## Quick start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Start Postgres with `docker compose up -d`.
4. Generate the Prisma client with `npm run db:generate`.
5. Push the schema with `npm run db:push`.
6. Seed local data with `npm run db:seed`.
7. Start the app with `npm run dev`.

## Core routes

- `POST /api/payments/stk`
- `POST /api/payments/paystack`
- `GET /api/payments/transactions/:id`
- `POST /api/payments/mpesa/callback`
- `POST /api/payments/paystack/webhook`

## Dashboard navigation

- `/dashboard`
- `/dashboard/transactions`
- `/dashboard/services`
- `/dashboard/webhooks`
- `/dashboard/api-keys`
- `/dashboard/settings`

## Connecting external services

### 1. Connect PostgreSQL

Set `DATABASE_URL` in [.env.example](/home/moti/Desktop/code/otopay/.env.example) format:

```env
DATABASE_URL="postgresql://otopay:otopay@localhost:5432/otopay?schema=public"
```

You can use:

- Local PostgreSQL
- Docker Compose with [docker-compose.yml](/home/moti/Desktop/code/otopay/docker-compose.yml)
- A hosted PostgreSQL instance

### 2. Connect Mpesa

Add these values in `.env`:

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- Optional: `MPESA_CALLBACK_TOKEN`

Service-specific Mpesa settings can also be stored in the `Service.providerSettings` JSON field.

### 3. Connect Paystack

Add these values in `.env`:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`

Service-specific Paystack settings can also be stored in the `Service.providerSettings` JSON field.

### 4. Connect your client application

Your external service should:

1. Have a `Service` record in the database
2. Have a webhook URL stored on that service
3. Use a valid OtoPay API key
4. Send the matching `serviceSlug` on payment requests

API authentication supports:

- `x-api-key: <raw-key>`
- `Authorization: Bearer <raw-key>`

### 5. Connect webhook consumers

OtoPay sends outbound transaction webhooks to each service `webhookUrl`.

If `OTOPAY_WEBHOOK_SIGNING_SECRET` is set, requests include:

```http
x-otopay-signature: <hmac-sha256>
```

## Default seeded access

Seeded service slugs:

- `core-shop`
- `oto-rides`

Seeded raw API keys:

- `otop_live_6e2c.core-shop-secret`
- `otop_test_89af.oto-rides-secret`

## Full setup guide

See [setup.md](/home/moti/Desktop/code/otopay/setup.md) for:

- Database setup
- Prisma push and migrations
- Environment configuration
- API setup and payload examples
- Dashboard navigation
- Service connection instructions
- Troubleshooting
