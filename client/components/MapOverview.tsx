import React from "react";
import type { Site } from "@shared/api";

export default function MapOverview({ sites, onOpen }: { sites: Site[]; onOpen: (id: string) => void }) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Carte des sites</h3>
      <div className="h-64 bg-gradient-to-br from-sky-50 to-white rounded flex items-center justify-center">
        <div className="text-sm text-muted text-center">
          Carte interactive (placeholder)
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-auto p-2">
            {sites.map((s) => (
              <button key={s.id} onClick={() => onOpen(s.id)} className="text-left p-2 rounded border border-border bg-card hover:shadow">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted">{s.city}, {s.country}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
