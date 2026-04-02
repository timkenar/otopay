import { DashboardShell } from "@/components/dashboard-shell";
import { listTransactionsWithServices } from "@/lib/data";

export default async function TransactionsPage() {
  const transactions = await listTransactionsWithServices();

  return (
    <DashboardShell
      title="Transactions"
      description="Historical and active payment lifecycle tracking across all providers."
    >
      <section className="card table-grid">
        <div className="table">
          {transactions.map((transaction) => {
            return (
              <div key={transaction.id} className="table-row">
                <div>
                  <strong>{transaction.externalReference ?? transaction.id}</strong>
                  <p className="muted">
                    {transaction.service.name} • {transaction.providerReference ?? "Pending reference"}
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
