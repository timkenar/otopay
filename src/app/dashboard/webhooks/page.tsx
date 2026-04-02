import { DashboardShell } from "@/components/dashboard-shell";
import { listWebhookLogsWithServices } from "@/lib/data";

export default async function WebhooksPage() {
  const webhookLogs = await listWebhookLogsWithServices();

  return (
    <DashboardShell
      title="Webhook Delivery"
      description="Delivery outcomes, retries, and operational visibility for downstream service callbacks."
    >
      <section className="card table-grid">
        <div className="table">
          {webhookLogs.map((log) => {
            return (
              <div key={log.id} className="table-row">
                <div>
                  <strong>{log.service.name}</strong>
                  <p className="muted">{log.requestUrl}</p>
                </div>
                <div className="status-row">
                  <span className={`pill ${log.status.toLowerCase()}`}>{log.status}</span>
                  <span className="muted">Attempt {log.attempt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
