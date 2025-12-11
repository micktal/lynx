import React from "react";
import type { Building } from "@shared/api";

export default function BuildingCard({
  building,
  stats,
  onEdit,
  onDelete,
}: {
  building: Building;
  stats: { spaces: number; equipments: number; risks: number; lastAudit?: { title?: string; scheduledAt?: string; completedAt?: string } };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { risks } = stats;
  let statusColor = "bg-gray-200 text-gray-800";
  if (risks === 0) statusColor = "bg-green-100 text-green-800";
  else if (risks <= 2) statusColor = "bg-orange-100 text-orange-800";
  else statusColor = "bg-red-100 text-red-800";

  return (
    <div className="card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{building.name}</h3>
            <div className="text-sm text-muted">Code: {building.code || "-"} • {building.mainUse || "-"}</div>
            <div className="text-sm text-muted mt-2">Étages: {building.floors ?? 1}</div>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}> {risks === 0 ? "OK" : risks <= 2 ? "MOYEN" : "CRITIQUE"} </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted">Espaces</div>
            <div className="font-semibold">{stats.spaces}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted">Équipements</div>
            <div className="font-semibold">{stats.equipments}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted">Risques ouverts</div>
            <div className="font-semibold text-destructive">{stats.risks}</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <div className="text-xs text-muted">Dernier audit</div>
            <div className="font-semibold">{stats.lastAudit ? `${stats.lastAudit.title} • ${stats.lastAudit.completedAt || stats.lastAudit.scheduledAt}` : "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <a className="px-3 py-2 rounded-md text-sm border border-border" href={`/building/${building.id}`}>
          Ouvrir le bâtiment
        </a>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} title="Modifier" className="px-2 py-2 rounded-md border border-border text-sm">✏️</button>
          <button onClick={onDelete} title="Supprimer" className="px-2 py-2 rounded-md border border-border text-sm">🗑️</button>
        </div>
      </div>
    </div>
  );
}
