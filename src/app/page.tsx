import Link from "next/link";
import { ArrowRight, KeyRound, RefreshCcw, ShieldCheck } from "lucide-react";
import { apiKeys, transactions, webhookLogs } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";

export default function HomePage() {
  const successfulTransactions = transactions.filter((entry) => entry.status === "SUCCESS").length;

  return (
    <div className="landing">
      <div className="hero">
        <section className="hero-card">
          <p className="eyebrow">Unified Payments</p>
          <h1>Operate Mpesa and Paystack from one command surface.</h1>
          <p>
            OtoPay combines API routing, payment orchestration, provider callbacks, and webhook
            delivery tracking in a single Next.js app.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="button">
              Open dashboard <ArrowRight size={16} />
            </Link>
            <a href="#architecture" className="button-secondary">
              Review architecture
            </a>
          </div>
        </section>

        <section className="metrics-grid">
          <StatCard
            label="Live transactions"
            value={String(transactions.length)}
            detail={`${successfulTransactions} successful across both providers`}
            accent={<ShieldCheck size={18} />}
          />
          <StatCard
            label="Webhook events"
            value={String(webhookLogs.length)}
            detail="Delivery logs and retry visibility are built in"
            accent={<RefreshCcw size={18} />}
          />
          <StatCard
            label="API keys"
            value={String(apiKeys.length)}
            detail="Per-service credentials managed from the dashboard"
            accent={<KeyRound size={18} />}
          />
        </section>

        <section id="architecture" className="content-grid">
          <article className="card">
            <p className="eyebrow">Core Flow</p>
            <h2 style={{ fontSize: "2rem", marginTop: 0 }}>API layer to orchestrator to adapters</h2>
            <p className="muted">
              Client applications call OtoPay routes. The orchestrator decides the provider, persists
              transaction state, and triggers webhook dispatch after callbacks are processed.
            </p>
          </article>
          <article className="card">
            <p className="eyebrow">Included Routes</p>
            <div className="table">
              <div className="table-row">
                <code>/api/payments/stk</code>
                <span className="muted">Initiate Mpesa STK</span>
              </div>
              <div className="table-row">
                <code>/api/payments/paystack</code>
                <span className="muted">Create Paystack checkout</span>
              </div>
              <div className="table-row">
                <code>/api/payments/transactions/:id</code>
                <span className="muted">Inspect transaction state</span>
              </div>
              <div className="table-row">
                <code>/api/payments/mpesa/callback</code>
                <span className="muted">Handle provider callback</span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
