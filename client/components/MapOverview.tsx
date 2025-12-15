import React from "react";
import { useState, useMemo, useEffect } from "react";
import type { Site } from "@shared/api";

export default function MapOverview({
  sites,
  onOpen,
  stats,
  mode = "heat",
}: {
  sites: Site[];
  onOpen: (id: string) => void;
  stats?: {
    siteId: string;
    score?: number;
    nonConform?: number;
    criticalRisks?: number;
    actionsOpen?: number;
  }[];
  mode?: "heat" | "list";
}) {
  const [viewMode, setViewMode] = useState<"heat" | "list">(mode);

  // compute bounding box
  const lats = sites.map((s) => s.lat ?? 0);
  const lngs = sites.map((s) => s.lng ?? 0);
  const minLat = lats.length ? Math.min(...lats) : 0;
  const maxLat = lats.length ? Math.max(...lats) : 0;
  const minLng = lngs.length ? Math.min(...lngs) : 0;
  const maxLng = lngs.length ? Math.max(...lngs) : 0;

  const statsMap = useMemo(() => {
    const m = new Map<string, any>();
    (stats || []).forEach((s) => m.set(s.siteId, s));
    return m;
  }, [stats]);

  // helper to position site relatively in container
  const posFor = (s: Site) => {
    if (minLat === maxLat || minLng === maxLng)
      return { left: "50%", top: "50%" };
    const lat = s.lat ?? (minLat + maxLat) / 2;
    const lng = s.lng ?? (minLng + maxLng) / 2;
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100; // invert for CSS
    return { left: `${x}%`, top: `${y}%` };
  };

  useEffect(() => {
    // slight entrance animation trigger
    const el = document.querySelectorAll(".heat-spot");
    el.forEach((e, i) => {
      (e as HTMLElement).style.opacity = "0";
      setTimeout(() => {
        (e as HTMLElement).style.opacity = "1";
      }, 60 * i);
    });
  }, [sites]);

  const totalCritical = (stats || []).reduce(
    (acc, s) => acc + (s.criticalRisks || 0),
    0,
  );
  const totalActions = (stats || []).reduce(
    (acc, s) => acc + (s.actionsOpen || 0),
    0,
  );
  const totalNonConform = (stats || []).reduce(
    (acc, s) => acc + (s.nonConform || 0),
    0,
  );

  return (
    <div className="card relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold">Carte des sites</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("heat")}
            className={`px-2 py-1 rounded ${viewMode === "heat" ? "bg-primary text-white" : "bg-transparent border border-border"}`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-2 py-1 rounded ${viewMode === "list" ? "bg-primary text-white" : "bg-transparent border border-border"}`}
          >
            Liste
          </button>
        </div>
      </div>

      <div
        className={`relative rounded-lg h-72 overflow-hidden transition-all duration-300 ${viewMode === "list" ? "bg-card" : "bg-gradient-to-br from-sky-50 to-white"}`}
      >
        {/* heat spots */}
        {viewMode === "heat" &&
          sites.map((s) => {
            const st = statsMap.get(s.id);
            const intensity = Math.min(
              1,
              (st?.criticalRisks || 0) * 0.6 +
                (st?.nonConform || 0) * 0.2 +
                (st?.actionsOpen || 0) * 0.1 || 0,
            );
            const size = 80 + intensity * 140; // px
            const pos = posFor(s);
            const gradient = `radial-gradient(circle at center, rgba(255,80,60,${0.22 + intensity * 0.5}) 0%, rgba(255,80,60,${0.06 + intensity * 0.1}) 40%, transparent 70%)`;
            return (
              <div
                key={`spot-${s.id}`}
                className="heat-spot pulse"
                style={{
                  position: "absolute",
                  left: pos.left,
                  top: pos.top,
                  width: size,
                  height: size,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                  background: gradient,
                  borderRadius: "50%",
                }}
              />
            );
          })}

        {/* map markers or list */}
        {viewMode === "heat" ? (
          sites.map((s) => {
            const pos = posFor(s);
            return (
              <button
                key={`m-${s.id}`}
                onClick={() => onOpen(s.id)}
                title={s.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 p-0 transform hover:scale-110 transition"
                style={{ left: pos.left, top: pos.top }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow"
                  style={{ border: "2px solid var(--primary)" }}
                >
                  <div className="text-xs font-bold text-location">
                    {s.name?.charAt(0) || ""}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 h-full overflow-auto">
            {sites.map((s) => (
              <button
                key={`li-${s.id}`}
                onClick={() => onOpen(s.id)}
                className="text-left p-3 rounded border border-border bg-card hover:shadow flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {s.name?.charAt(0) ?? ""}
                </div>
                <div className="truncate">
                  <div className="font-medium truncate">{s.name}</div>
                  <div className="text-xs text-muted truncate">
                    {s.city}, {s.country}
                  </div>
                </div>
                <div className="ml-auto text-sm text-muted">
                  {statsMap.get(s.id)?.criticalRisks || 0} 🔥
                </div>
              </button>
            ))}
          </div>
        )}

        {/* callouts */}
        <div className="absolute right-4 top-4 w-56 space-y-2 z-10">
          <div className="p-3 rounded-lg bg-gradient-to-r from-red-600/10 to-red-400/6 border border-red-300/10">
            <div className="text-xs text-muted">Risques critiques</div>
            <div className="text-lg font-bold text-destructive animate-pulse-fast">
              {totalCritical}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-400/6 to-yellow-600/8 border border-yellow-300/8">
            <div className="text-xs text-muted">Actions en retard</div>
            <div className="text-lg font-bold animate-pop">{totalActions}</div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-r from-sky-50/6 to-sky-300/8 border border-border">
            <div className="text-xs text-muted">Équipements non conformes</div>
            <div className="text-lg font-bold text-destructive animate-pop-slow">
              {totalNonConform}
            </div>
          </div>
        </div>

        {/* list panel bottom (only in heat view) */}
        {viewMode === "heat" && (
          <div className="absolute left-4 bottom-4 right-4 max-h-36 overflow-auto p-2 flex gap-2">
            {sites.map((s) => (
              <button
                key={`list-${s.id}`}
                onClick={() => onOpen(s.id)}
                className="text-left p-2 rounded border border-border bg-card/80 hover:shadow flex-1"
              >
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-location truncate">
                  {s.city}, {s.country}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
