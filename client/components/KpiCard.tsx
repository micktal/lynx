import React from "react";

export default function KpiCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="kpi-premium">
      <div className="text-3xl" style={{opacity: 0.95}}>{icon}</div>
      <div>
        <div className="text-sm" style={{opacity: 0.9}}>{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
    </div>
  );
}
