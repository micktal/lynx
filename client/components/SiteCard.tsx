import React from "react";
import type { Site } from "@shared/api";

export default function SiteCard({ site }: { site: Site }) {
  return (
    <div className="card hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{site.name}</h3>
          <p className="text-sm text-muted mt-1">{site.address || "Adresse non renseignée"}</p>
          <p className="text-sm text-muted">{site.city ? `${site.city}, ${site.country}` : site.country}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">Bâtiments</div>
          <div className="mt-1 text-xl font-bold">{Math.floor(Math.random() * 8) + 1}</div>
        </div>
      </div>
    </div>
  );
}
