import { DashboardShell } from "@/components/dashboard-shell";
import { listApiKeysWithServices } from "@/lib/data";

export default async function ApiKeysPage() {
  const apiKeys = await listApiKeysWithServices();

  return (
    <DashboardShell
      title="API Keys"
      description="Per-service access credentials for external clients integrating with OtoPay."
    >
      <section className="card table-grid">
        <div className="table">
          {apiKeys.map((apiKey) => {
            return (
              <div key={apiKey.id} className="table-row">
                <div>
                  <strong>{apiKey.label}</strong>
                  <p className="muted">{apiKey.service.name}</p>
                </div>
                <div>
                  <code>{apiKey.keyPrefix}</code>
                  <p className="muted">
                    {Array.isArray(apiKey.scopes) ? apiKey.scopes.map(String).join(", ") : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DashboardShell>
  );
}
