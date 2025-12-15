import React from "react";
import type { Site } from "@shared/api";

export default function MapOverview({ sites, onOpen, stats }: { sites: Site[]; onOpen: (id: string) => void; stats?: { siteId: string; score?: number; nonConform?: number; criticalRisks?: number; actionsOpen?: number }[] }) {
  // compute bounding box
  const lats = sites.map(s => s.lat ?? 0);
  const lngs = sites.map(s => s.lng ?? 0);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const statsMap = new Map<string, any>();
  (stats || []).forEach(s => statsMap.set(s.siteId, s));

  // helper to position site relatively in container
  const posFor = (s: Site) => {
    if (minLat === Infinity || maxLat === -Infinity || minLng === Infinity || maxLng === -Infinity) return { left: '50%', top: '50%' };
    const lat = s.lat ?? (minLat + maxLat) / 2;
    const lng = s.lng ?? (minLng + maxLng) / 2;
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100; // invert for CSS
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="card relative overflow-hidden">
      <h3 className="font-semibold mb-3">Carte des sites</h3>

      <div className="relative rounded-lg bg-gradient-to-br from-sky-50 to-white h-72 overflow-hidden">
        {/* heat spots */}
        {sites.map((s) => {
          const st = statsMap.get(s.id);
          const intensity = Math.min(1, ((st?.criticalRisks || 0) * 0.6 + (st?.nonConform || 0) * 0.2 + (st?.actionsOpen || 0) * 0.1) || 0);
          const size = 80 + intensity * 140; // px
          const pos = posFor(s);
          const gradient = `radial-gradient(circle at center, rgba(255,80,60,${0.22 + intensity * 0.5}) 0%, rgba(255,80,60,${0.06 + intensity * 0.1}) 40%, transparent 70%)`;
          return (
            <div key={s.id} style={{ position: 'absolute', left: pos.left, top: pos.top, width: size, height: size, transform: 'translate(-50%, -50%)', pointerEvents: 'none', background: gradient, borderRadius: '50%' }} />
          );
        })}

        {/* map markers */}
        {sites.map((s) => {
          const pos = posFor(s);
          return (
            <button key={`m-${s.id}`} onClick={() => onOpen(s.id)} title={s.name} className="absolute -translate-x-1/2 -translate-y-1/2 p-0" style={{ left: pos.left, top: pos.top }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow" style={{ border: '2px solid var(--primary)' }}>
                <div className="text-xs font-bold text-location">{s.name?.charAt(0) || ""}</div>
              </div>
            </button>
          );
        })}

        {/* callouts */}
        <div className="absolute right-4 top-4 w-56 space-y-2">
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-600/10 to-red-400/6 border border-red-300/10">
            <div className="text-xs text-muted">Risques critiques</div>
            <div className="text-lg font-bold text-destructive">{(stats || []).reduce((acc, s) => acc + (s.criticalRisks || 0), 0)}</div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-400/6 to-yellow-600/8 border border-yellow-300/8">
            <div className="text-xs text-muted">Actions en retard</div>
            <div className="text-lg font-bold">{(stats || []).reduce((acc, s) => acc + (s.actionsOpen || 0), 0)}</div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-sky-50/6 to-sky-300/8 border border-border">
            <div className="text-xs text-muted">Équipements non conformes</div>
            <div className="text-lg font-bold text-destructive">{(stats || []).reduce((acc, s) => acc + (s.nonConform || 0), 0)}</div>
          </div>
        </div>

        {/* list panel bottom */}
        <div className="absolute left-4 bottom-4 right-4 max-h-36 overflow-auto p-2 flex gap-2">
          {sites.map((s) => (
            <button key={`list-${s.id}`} onClick={() => onOpen(s.id)} className="text-left p-2 rounded border border-border bg-card/80 hover:shadow flex-1">
              <div className="font-medium truncate">{s.name}</div>
              <div className="text-xs text-location truncate">{s.city}, {s.country}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
