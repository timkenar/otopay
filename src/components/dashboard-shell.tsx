import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/services", label: "Services" },
  { href: "/dashboard/webhooks", label: "Webhooks" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/settings", label: "Settings" }
];

export function DashboardShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">OtoPay</p>
          <h1>Payment orchestration</h1>
          <p className="muted">Mpesa and Paystack in one operational surface.</p>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h2>{title}</h2>
          </div>
          <p className="muted">{description}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
