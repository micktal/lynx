import React from "react";

export default function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="kpi-premium card-elevated" role="region" aria-label={title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: 12, boxShadow: '0 6px 20px rgba(12,18,30,0.06)' }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div aria-hidden style={{ width: 64, height: 64, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(91,140,255,0.14), rgba(32,201,151,0.06))" }}>
          <div style={{ fontSize: 26 }}>{icon}</div>
        </div>
        <div>
          <div className="text-sm" style={{ color: "var(--text-muted)", fontWeight: 700 }}>
            {title}
          </div>
          <div className="text-2xl font-bold" style={{ marginTop: 6 }}>{value}</div>
        </div>
      </div>

      <div style={{ alignSelf: "stretch", display: "flex", alignItems: "center" }}>
        <div style={{ padding: 8, borderRadius: 12, background: "rgba(255,255,255,0.03)", color: "var(--text-muted)", fontSize: 12 }} role="img" aria-hidden>Voir</div>
      </div>
    </div>
  );
}
