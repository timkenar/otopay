import { Activity, BellRing, CreditCard, Landmark } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { services, transactions, webhookLogs } from "@/lib/mock-data";

export default function DashboardPage() {
  const totalVolume = transactions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DashboardShell
      title="Operations overview"
      description="Real-time operational visibility across transaction processing, webhooks, and services."
    >
      <section className="metrics-grid">
        <StatCard
          label="Processed volume"
          value={`KES ${totalVolume.toLocaleString()}`}
          detail="Mock data representing historical and active payment flows"
          accent={<CreditCard size={18} />}
        />
        <StatCard
          label="Active services"
          value={String(services.filter((service) => service.isActive).length)}
          detail="Webhook-configured clients using the OtoPay API"
          accent={<Landmark size={18} />}
        />
        <StatCard
          label="Webhook alerts"
          value={String(webhookLogs.filter((log) => log.status !== "DELIVERED").length)}
          detail="Retries are surfaced directly in the dashboard"
          accent={<BellRing size={18} />}
        />
      </section>

      <section className="content-grid">
        <article className="card">
          <p className="eyebrow">Transaction pulse</p>
          <ul className="clean-list">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="list-row">
                <div>
                  <strong>{transaction.externalReference}</strong>
                  <p className="muted">
                    {transaction.provider} • {transaction.currency} {transaction.amount.toLocaleString()}
                  </p>
                </div>
                <span className={`pill ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <p className="eyebrow">Control principles</p>
          <div className="table">
            <div className="table-row">
              <div>
                <strong>Provider isolation</strong>
                <p className="muted">Adapters keep Mpesa and Paystack logic out of the orchestrator.</p>
              </div>
              <Activity size={18} />
            </div>
            <div className="table-row">
              <div>
                <strong>Webhook delivery logs</strong>
                <p className="muted">Every dispatch attempt can be retried with exponential backoff.</p>
              </div>
              <Activity size={18} />
            </div>
            <div className="table-row">
              <div>
                <strong>Unified API surface</strong>
                <p className="muted">Client systems integrate once and select providers as needed.</p>
              </div>
              <Activity size={18} />
            </div>
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
