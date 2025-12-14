import React from "react";
import type { Site } from "@shared/api";
import { Link } from "react-router-dom";

export default function SiteCard({ site }: { site: Site }) {
  return (
    <div className="card card-elevated card-clickable">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, rgba(91,140,255,0.14), rgba(6,52,90,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
            <span style={{ fontWeight: 700 }}>{(site.name || "?").slice(0,2).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{site.name}</h3>
            <p className="text-sm text-muted mt-1">{site.address || "Adresse non renseignée"}</p>
            <p className="text-sm text-muted">{site.city ? `${site.city}, ${site.country}` : site.country}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-sm text-muted">Bâtiments</div>
          <div className="text-xl font-bold">{Math.floor(Math.random() * 8) + 1}</div>
          <div className="flex gap-2">
            <Link to={`/site/${site.id}`} className="btn-primary btn-sm">Ouvrir</Link>
            <Link to={`/audit?site=${site.id}`} className="btn-ghost btn-sm">Audits</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
