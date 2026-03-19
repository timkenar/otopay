import { DashboardShell } from "@/components/dashboard-shell";

const settingsGroups = [
  {
    title: "Provider credentials",
    detail: "Store Mpesa consumer keys, shortcode settings, and Paystack secrets in environment variables."
  },
  {
    title: "Dashboard authentication",
    detail: "Add session or JWT-based admin authentication before exposing the dashboard beyond local development."
  },
  {
    title: "Webhook signing",
    detail: "Support optional HMAC signing when dispatching service webhooks."
  },
  {
    title: "Observability",
    detail: "Integrate structured logging and external monitoring such as Sentry or Datadog."
  }
];

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Operational controls and follow-up implementation areas for production hardening."
    >
      <section className="settings-grid">
        {settingsGroups.map((group) => (
          <article key={group.title} className="card">
            <p className="eyebrow">Production readiness</p>
            <h3>{group.title}</h3>
            <p className="muted">{group.detail}</p>
          </article>
        ))}
      </section>
    </DashboardShell>
  );
}
