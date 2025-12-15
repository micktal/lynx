import React, { useMemo, useState } from "react";
import type { Equipment } from "@shared/api";

export default function EquipmentTable({
  items,
  onEdit,
  onDelete,
  onAdd,
}: {
  items: Equipment[];
  onEdit: (e: Equipment) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");

  const DEFAULT_CATEGORIES = [
    "alarme",
    "vidéo",
    "incendie",
    "éclairage",
    "clim",
    "électrique",
    "sécurité",
    "autre",
  ];
  const categories = Array.from(
    new Set([
      ...(DEFAULT_CATEGORIES || []),
      ...items.map((i) => i.category || "autre"),
    ]),
  );

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !(
            i.name.toLowerCase().includes(q) ||
            (i.reference || "").toLowerCase().includes(q)
          )
        )
          return false;
      }
      if (category && i.category !== category) return false;
      if (state && i.state !== state) return false;
      return true;
    });
  }, [items, query, category, state]);

  const stateBadge = (s: Equipment["state"]) => {
    switch (s) {
      case "OK":
        return (
          <span className="px-2 py-1 rounded text-white bg-green-600 text-xs">
            OK
          </span>
        );
      case "A_CONTROLER":
        return (
          <span className="px-2 py-1 rounded text-black bg-yellow-300 text-xs">
            À contrôler
          </span>
        );
      case "NON_CONFORME":
        return (
          <span className="px-2 py-1 rounded text-white bg-red-600 text-xs">
            Non conforme
          </span>
        );
      case "OBSOLETE":
        return (
          <span className="px-2 py-1 rounded text-black bg-orange-200 text-xs">
            Obsolète
          </span>
        );
      case "ABSENT":
        return (
          <span className="px-2 py-1 rounded text-black bg-gray-200 text-xs">
            Absent
          </span>
        );
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher équipement..."
            className="px-3 py-2 rounded-md border border-border bg-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-input"
          >
            <option value="">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-input"
          >
            <option value="">Tous états</option>
            <option value="OK">OK</option>
            <option value="A_CONTROLER">À contrôler</option>
            <option value="NON_CONFORME">Non conforme</option>
            <option value="OBSOLETE">Obsolète</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
        <div>
          <button onClick={onAdd} className="brand-btn">
            Ajouter équipement
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Catégorie</th>
              <th className="p-2">Nom</th>
              <th className="p-2">Référence</th>
              <th className="p-2">État</th>
              <th className="p-2">Commentaire</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-border">
                <td className="p-2">{it.category}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.reference}</td>
                <td className="p-2">{stateBadge(it.state)}</td>
                <td className="p-2">{it.comment}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(it)}
                      className="px-2 py-1 rounded border border-border text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(it.id)}
                      className="px-2 py-1 rounded border border-border text-sm"
                    >
                      🗑️
                    </button>
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
