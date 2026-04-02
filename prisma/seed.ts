import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashApiKey(apiKey: string) {
  return createHash("sha256").update(apiKey).digest("hex");
}

async function main() {
  await prisma.webhookLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.aPIKey.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "admin@otopay.local",
      name: "OtoPay Admin",
      role: "ADMIN"
    }
  });

  await prisma.service.create({
    data: {
      id: "svc_core_shop",
      name: "Core Shop",
      slug: "core-shop",
      webhookUrl: "https://core-shop.example.com/webhooks/otopay",
      providerSettings: {
        mpesaShortcode: "174379",
        paystackChannel: "card"
      }
    }
  });

  await prisma.service.create({
    data: {
      id: "svc_rides",
      name: "Oto Rides",
      slug: "oto-rides",
      webhookUrl: "https://oto-rides.example.com/webhooks/payments",
      providerSettings: {
        mpesaShortcode: "603021",
        paystackChannel: "bank_transfer"
      }
    }
  });

  await prisma.aPIKey.createMany({
    data: [
      {
        id: "key_1",
        label: "Production Server",
        keyPrefix: "otop_live_6e2c",
        keyHash: hashApiKey("otop_live_6e2c.core-shop-secret"),
        scopes: ["payments:write", "transactions:read"],
        lastUsedAt: new Date("2026-03-19T10:30:00.000Z"),
        serviceId: "svc_core_shop"
      },
      {
        id: "key_2",
        label: "Staging Server",
        keyPrefix: "otop_test_89af",
        keyHash: hashApiKey("otop_test_89af.oto-rides-secret"),
        scopes: ["payments:write"],
        serviceId: "svc_rides"
      }
    ]
  });

  await prisma.transaction.createMany({
    data: [
      {
        id: "txn_001",
        externalReference: "ORDER-1001",
        providerReference: "MPESA-8DJK20",
        provider: "MPESA",
        status: "SUCCESS",
        amount: 2500,
        currency: "KES",
        customerPhone: "+254700000001",
        metadata: {
          source: "checkout"
        },
        serviceId: "svc_core_shop"
      },
      {
        id: "txn_002",
        externalReference: "SUB-2002",
        providerReference: "PSTK-220011",
        provider: "PAYSTACK",
        status: "PENDING",
        amount: 1500,
        currency: "KES",
        customerEmail: "billing@example.com",
        metadata: {
          source: "subscription"
        },
        serviceId: "svc_rides"
      },
      {
        id: "txn_003",
        externalReference: "TOPUP-3003",
        providerReference: "MPESA-91QW31",
        provider: "MPESA",
        status: "FAILED",
        amount: 500,
        currency: "KES",
        customerPhone: "+254700000007",
        metadata: {
          failureReason: "insufficient_funds"
        },
        serviceId: "svc_rides"
      }
    ]
  });

  await prisma.webhookLog.createMany({
    data: [
      {
        id: "wh_001",
        eventType: "transaction.updated",
        status: "DELIVERED",
        attempt: 1,
        requestUrl: "https://core-shop.example.com/webhooks/otopay",
        requestBody: {
          transactionId: "txn_001",
          status: "SUCCESS"
        },
        responseCode: 200,
        responseBody: "ok",
        transactionId: "txn_001",
        serviceId: "svc_core_shop"
      },
      {
        id: "wh_002",
        eventType: "transaction.updated",
        status: "RETRYING",
        attempt: 2,
        requestUrl: "https://oto-rides.example.com/webhooks/payments",
        requestBody: {
          transactionId: "txn_002",
          status: "PENDING"
        },
        responseCode: 503,
        responseBody: "service unavailable",
        nextRetryAt: new Date("2026-03-19T08:10:00.000Z"),
        transactionId: "txn_002",
        serviceId: "svc_rides"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
