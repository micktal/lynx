import React from "react";
import type { Site } from "@shared/api";

export default function FiltersBar({
  sites,
  country,
  setCountry,
  city,
  setCity,
  buildingsMax,
  setBuildingsMax,
  query,
  setQuery,
  onExport,
}: {
  sites: Site[];
  country: string | null;
  setCountry: (v: string | null) => void;
  city: string | null;
  setCity: (v: string | null) => void;
  buildingsMax: number;
  setBuildingsMax: (n: number) => void;
  query: string;
  setQuery: (s: string) => void;
  onExport: () => void;
}) {
  const countries = Array.from(new Set(sites.map((s) => s.country || "Autre")));
  const cities = Array.from(new Set(sites.filter((s) => (country ? s.country === country : true)).map((s) => s.city || "Autre")));

  return (
    <div className="bg-card border border-border rounded-md p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, ville, contact..."
          className="px-3 py-2 rounded-md border border-border bg-input text-sm w-full md:w-96"
        />

        <select value={country ?? ""} onChange={(e) => setCountry(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input text-sm">
          <option value="">Tous les pays</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={city ?? ""} onChange={(e) => setCity(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input text-sm">
          <option value="">Toutes les villes</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted">Max bâtiments</label>
          <input
            type="range"
            min={0}
            max={10}
            value={buildingsMax}
            onChange={(e) => setBuildingsMax(Number(e.target.value))}
            className="w-36"
          />
          <div className="text-sm w-8 text-right">{buildingsMax}</div>
        </div>

        <button onClick={onExport} className="btn-premium px-3 py-2 rounded-md text-sm">
          Export Excel – Liste Sites
        </button>
      </div>
    </div>
  );
}
