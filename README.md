# OtoPay

OtoPay is a centralized payment orchestration platform with a built-in admin dashboard for Mpesa and Paystack.

## Included in this scaffold

- Next.js App Router dashboard
- API routes for STK, Paystack initialization, transaction lookup, and webhooks
- Payment orchestrator plus provider adapters
- Prisma schema for services, API keys, transactions, webhook logs, and dashboard users
- Mock-backed dashboard data so the UI is meaningful before provider integration

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

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Generate the Prisma client with `npm run db:generate`.
4. Push the schema with `npm run db:push`.
5. Seed local data with `npm run db:seed`.
6. Start the app with `npm run dev`.

## Current integration status

- Mpesa and Paystack adapters currently return deterministic mock responses.
- Webhook dispatching is modeled as a service contract and log payload.
- API routes and domain types are ready to connect to live credentials and a real database-backed repository.
