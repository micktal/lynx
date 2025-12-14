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
    <div className="kpi-premium card-elevated" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 54, height: 54, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(91,140,255,0.18), rgba(32,201,151,0.08))" }}>
          <div style={{ fontSize: 22 }}>{icon}</div>
        </div>
        <div>
          <div className="text-sm" style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {title}
          </div>
          <div className="text-2xl font-bold" style={{ marginTop: 6 }}>{value}</div>
        </div>
      </div>

      <div style={{ alignSelf: "stretch", display: "flex", alignItems: "center" }}>
        <div style={{ padding: 6, borderRadius: 10, background: "rgba(255,255,255,0.02)", color: "var(--text-muted)", fontSize: 12 }}>Voir</div>
      </div>
    </div>
  );
}
