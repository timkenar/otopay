import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
  accent
}: {
  label: string;
  value: string;
  detail: string;
  accent: ReactNode;
}) {
  return (
    <article className="card stat-card">
      <div className="stat-head">
        <span>{label}</span>
        <span>{accent}</span>
      </div>
      <strong>{value}</strong>
      <p className="muted">{detail}</p>
    </article>
  );
}
