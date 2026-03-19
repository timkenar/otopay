import { DashboardShell } from "@/components/dashboard-shell";
import { getServiceById, transactions } from "@/lib/mock-data";

export default function TransactionsPage() {
  return (
    <DashboardShell
      title="Transactions"
      description="Historical and active payment lifecycle tracking across all providers."
    >
      <section className="card table-grid">
        <div className="table">
          {transactions.map((transaction) => {
            const service = getServiceById(transaction.serviceId);

            return (
              <div key={transaction.id} className="table-row">
                <div>
                  <strong>{transaction.externalReference}</strong>
                  <p className="muted">
                    {service?.name} • {transaction.providerReference}
                  </p>
                </div>
                <div>
                  <p>
                    {transaction.currency} {transaction.amount.toLocaleString()}
                  </p>
                  <span className={`pill ${transaction.status.toLowerCase()}`}>{transaction.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
