import React, { useMemo, useState } from "react";
import type { Risk } from "@shared/api";

export default function RiskTable({ items, onEdit, onDelete, onCreateAction }: { items: Risk[]; onEdit: (r: Risk) => void; onDelete: (id: string) => void; onCreateAction: (riskId: string) => void; }) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const LEVELS = ["FAIBLE", "MOYEN", "IMPORTANT", "CRITIQUE"];
  const levels = LEVELS;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(i.title.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q))) return false;
      }
      if (levelFilter && i.level !== levelFilter) return false;
      return true;
    });
  }, [items, query, levelFilter]);

  const levelBadge = (l: Risk["level"]) => {
    switch (l) {
      case "FAIBLE":
        return <span className="px-2 py-1 rounded text-white bg-green-600 text-xs">FAIBLE</span>;
      case "MOYEN":
        return <span className="px-2 py-1 rounded text-black bg-yellow-300 text-xs">MOYEN</span>;
      case "IMPORTANT":
        return <span className="px-2 py-1 rounded text-black bg-orange-300 text-xs">IMPORTANT</span>;
      case "CRITIQUE":
        return <span className="px-2 py-1 rounded text-white bg-red-600 text-xs">CRITIQUE</span>;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher risque..." className="px-3 py-2 rounded-md border border-border bg-input" />
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous niveaux</option>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <button className="brand-btn" onClick={() => { /* create risk action outside */ }}>Ajouter un risque</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Titre</th>
              <th className="p-2">Description</th>
              <th className="p-2">Niveau</th>
              <th className="p-2">Probabilité</th>
              <th className="p-2">Impact</th>
              <th className="p-2">Préconisation</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-border align-top">
                <td className="p-2 font-medium">{it.title}</td>
                <td className="p-2">{it.description}</td>
                <td className="p-2">{levelBadge(it.level)}</td>
                <td className="p-2">{it.probability}</td>
                <td className="p-2">{it.impact}</td>
                <td className="p-2">{it.recommendation}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(it)} className="px-2 py-1 rounded border border-border text-sm">✏️</button>
                    <button onClick={() => onDelete(it.id)} className="px-2 py-1 rounded border border-border text-sm">🗑️</button>
                    <button onClick={() => onCreateAction(it.id)} className="px-2 py-1 rounded border border-border text-sm">➕ Action</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
