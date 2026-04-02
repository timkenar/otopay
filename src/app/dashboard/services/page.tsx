import { DashboardShell } from "@/components/dashboard-shell";
import { listServices } from "@/lib/data";

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <DashboardShell
      title="Services"
      description="Connected client systems, webhook endpoints, and provider-level configuration."
    >
      <section className="content-grid">
        {services.map((service) => (
          <article key={service.id} className="card">
            <p className="eyebrow">{service.slug}</p>
            <h3>{service.name}</h3>
            <p className="muted">{service.webhookUrl}</p>
            <div className="table">
              {Object.entries(service.providerSettings).map(([key, value]) => (
                <div key={key} className="table-row">
                  <span>{key}</span>
                  <code>{value}</code>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
