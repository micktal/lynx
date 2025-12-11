import React, { useMemo, useState } from "react";
import type { ActionItem } from "@shared/api";

export default function ActionList({ items, onEdit, onDelete, onToggleStatus }: { items: ActionItem[]; onEdit: (a: ActionItem) => void; onDelete: (id: string) => void; onToggleStatus: (id: string) => void; }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(it.title.toLowerCase().includes(q) || (it.description || "").toLowerCase().includes(q))) return false;
      }
      if (statusFilter && it.status !== statusFilter) return false;
      return true;
    });
  }, [items, query, statusFilter]);

  const statusBadge = (s: ActionItem["status"]) => {
    switch (s) {
      case "OUVERTE":
        return <span className="px-2 py-1 rounded text-white bg-red-600 text-xs">OUVERTE</span>;
      case "EN_COURS":
        return <span className="px-2 py-1 rounded text-black bg-orange-300 text-xs">EN_COURS</span>;
      case "CLOTUREE":
        return <span className="px-2 py-1 rounded text-white bg-green-600 text-xs">CLOTUREE</span>;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher action..." className="px-3 py-2 rounded-md border border-border bg-input" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous statuts</option>
            <option value="OUVERTE">OUVERTE</option>
            <option value="EN_COURS">EN_COURS</option>
            <option value="CLOTUREE">CLOTUREE</option>
          </select>
        </div>
        <div />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Action</th>
              <th className="p-2">Responsable</th>
              <th className="p-2">Échéance</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="p-2">{it.title}</td>
                <td className="p-2">{it.ownerId}</td>
                <td className="p-2">{it.dueDate}</td>
                <td className="p-2">{statusBadge(it.status)}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(it)} className="px-2 py-1 rounded border border-border text-sm">✏️</button>
                    <button onClick={() => onToggleStatus(it.id)} className="px-2 py-1 rounded border border-border text-sm">🔁</button>
                    <button onClick={() => onDelete(it.id)} className="px-2 py-1 rounded border border-border text-sm">🗑️</button>
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
