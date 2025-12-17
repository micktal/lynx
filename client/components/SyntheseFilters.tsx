import React from "react";
import type { Site, Building } from "@shared/api";

export default function SyntheseFilters({
  sites,
  buildings,
  selectedSite,
  setSelectedSite,
  selectedBuilding,
  setSelectedBuilding,
  category,
  setCategory,
  stateFilter,
  setStateFilter,
  levelFilter,
  setLevelFilter,
  importance,
  setImportance,
  query,
  setQuery,
  onReset,
  onExport,
}: {
  sites: Site[];
  buildings: Building[];
  selectedSite: string | null;
  setSelectedSite: (v: string | null) => void;
  selectedBuilding: string | null;
  setSelectedBuilding: (v: string | null) => void;
  category: string | null;
  setCategory: (v: string | null) => void;
  stateFilter: string | null;
  setStateFilter: (v: string | null) => void;
  levelFilter: string | null;
  setLevelFilter: (v: string | null) => void;
  importance: number | null;
  setImportance: (v: number | null) => void;
  query: string;
  setQuery: (s: string) => void;
  onReset: () => void;
  onExport: () => void;
}) {
  const buildingsForSite = selectedSite ? buildings.filter((b) => b.siteId === selectedSite) : buildings;

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche..." className="px-3 py-2 rounded-md border border-border bg-input w-full md:w-64" />
          <select value={selectedSite ?? ""} onChange={(e) => setSelectedSite(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous les sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select value={selectedBuilding ?? ""} onChange={(e) => setSelectedBuilding(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous les bâtiments</option>
            {buildingsForSite.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 mt-3 md:mt-0 flex-wrap md:flex-nowrap">
          <select value={category ?? ""} onChange={(e) => setCategory(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Toutes catégories</option>
            <option value="alarme">Alarme</option>
            <option value="vidéo">Vidéo</option>
            <option value="incendie">Incendie</option>
            <option value="contrôle d’accès">Contrôle d’accès</option>
            <option value="serrurerie">Serrurerie</option>
          </select>

          <select value={stateFilter ?? ""} onChange={(e) => setStateFilter(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous états</option>
            <option value="OK">OK</option>
            <option value="A_CONTROLER">À contrôler</option>
            <option value="NON_CONFORME">Non conforme</option>
            <option value="OBSOLETE">Obsolète</option>
            <option value="ABSENT">Absent</option>
          </select>

          <select value={levelFilter ?? ""} onChange={(e) => setLevelFilter(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous niveaux</option>
            <option value="FAIBLE">FAIBLE</option>
            <option value="MOYEN">MOYEN</option>
            <option value="IMPORTANT">IMPORTANT</option>
            <option value="CRITIQUE">CRITIQUE</option>
          </select>

          <select value={importance ?? "" as any} onChange={(e) => setImportance(e.target.value ? Number(e.target.value) : null)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Importance</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>

          <button onClick={onReset} className="px-3 py-2 rounded-md border border-border">Reset filtres</button>
          <button onClick={onExport} className="brand-btn">Exporter Excel</button>
        </div>
      </div>
    </div>
  );
}
