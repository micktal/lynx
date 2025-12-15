import React from "react";
import type { Site } from "@shared/api";

export default function SiteRanking({
  items,
  onOpen,
}: {
  items: {
    site: Site;
    nonConform: number;
    criticalRisks: number;
    score: number;
    actionsOpen: number;
  }[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Classement des sites</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Site</th>
              <th className="p-2">Pays</th>
              <th className="p-2">Non conformes</th>
              <th className="p-2">Risques critiques</th>
              <th className="p-2">Score</th>
              <th className="p-2">Actions ouvertes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr
                key={`${it.site.id}-${idx}`}
                className="border-t border-border align-top hover:bg-muted/10"
              >
                <td className="p-2 font-medium">{it.site.name}</td>
                <td className="p-2">{it.site.country}</td>
                <td className="p-2 text-destructive">{it.nonConform}</td>
                <td className="p-2 text-destructive">{it.criticalRisks}</td>
                <td className="p-2">{it.score}</td>
                <td className="p-2">{it.actionsOpen}</td>
                <td className="p-2">
                  <button
                    onClick={() => onOpen(it.site.id)}
                    className="px-2 py-1 rounded border border-border text-sm"
                  >
                    Ouvrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
