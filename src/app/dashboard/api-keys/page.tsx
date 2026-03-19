import { DashboardShell } from "@/components/dashboard-shell";
import { apiKeys, getServiceById } from "@/lib/mock-data";

export default function ApiKeysPage() {
  return (
    <DashboardShell
      title="API Keys"
      description="Per-service access credentials for external clients integrating with OtoPay."
    >
      <section className="card table-grid">
        <div className="table">
          {apiKeys.map((apiKey) => {
            const service = getServiceById(apiKey.serviceId);

            return (
              <div key={apiKey.id} className="table-row">
                <div>
                  <strong>{apiKey.label}</strong>
                  <p className="muted">{service?.name}</p>
                </div>
                <div>
                  <code>{apiKey.keyPrefix}</code>
                  <p className="muted">{apiKey.scopes.join(", ")}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
