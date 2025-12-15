import React, { useMemo, useState } from "react";
import React, { useState, useMemo } from "react";
import type { Risk } from "@shared/api";
import ConfirmModal from "./ConfirmModal";

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

  const [selected, setSelected] = useState<string[]>([]);
  const [probFilter, setProbFilter] = useState<string>("");
  const [impactFilter, setImpactFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  const toggleOne = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((f) => f.id));
  };

  const exportCSV = () => {
    const rows = [
      ["id", "title", "description", "level", "probability", "impact", "recommendation"],
      ...filtered
        .filter((r) => selected.length === 0 || selected.includes(r.id))
        .map((r) => [r.id, r.title, (r.description || '').replace(/\n/g,' '), r.level, String(r.probability), String(r.impact), (r.recommendation || '').replace(/\n/g,' ')]),
    ];
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risks_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionsToCloseCount, setActionsToCloseCount] = useState<number | null>(null);

  const bulkCloseActions = async () => {
    if (selected.length === 0) return;
    try {
      const { fetchActionsForRisks } = await import('../lib/builderService');
      const acts = await fetchActionsForRisks(selected);
      setActionsToCloseCount(acts.length);
      setConfirmOpen(true);
    } catch (e) {
      console.error('Bulk close actions failed', e);
      const { toast } = await import('@/hooks/use-toast');
      toast({ title: 'Erreur', description: 'Impossible de préparer la fermeture des actions' });
    }
  };

  const confirmBulkClose = async () => {
    setConfirmOpen(false);
    try {
      const { fetchActionsForRisks, updateAction } = await import('../lib/builderService');
      const acts = await fetchActionsForRisks(selected);
      let closed = 0;
      for (const a of acts) {
        try {
          await updateAction(a.id, { status: 'CLOTUREE' });
          closed++;
        } catch (e) {
          // ignore individual failures
        }
      }
      const { toast } = await import('@/hooks/use-toast');
      toast({ title: 'Bulk close', description: `Tentative effectuée: ${closed} actions fermées` });
      // clear selection
      setSelected([]);
    } catch (e) {
      console.error('Bulk close confirm failed', e);
      const { toast } = await import('@/hooks/use-toast');
      toast({ title: 'Erreur', description: 'Échec lors de la fermeture des actions' });
    }
  };

  const visible = filtered.filter((r) => {
    if (probFilter && String(r.probability) !== probFilter) return false;
    if (impactFilter && String(r.impact) !== impactFilter) return false;
    return true;
  });

  // apply sorting
  if (sortBy) {
    visible.sort((a, b) => {
      if (sortBy === 'prob') return (b.probability || 0) - (a.probability || 0);
      if (sortBy === 'impact') return (b.impact || 0) - (a.impact || 0);
      if (sortBy === 'level') return LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level);
      return 0;
    });
  }

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

          <select value={probFilter} onChange={(e) => setProbFilter(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Toutes probabilités</option>
            {[5,4,3,2,1].map(p => <option key={p} value={String(p)}>{p}</option>)}
          </select>

          <select value={impactFilter} onChange={(e) => setImpactFilter(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Tous impacts</option>
            {[5,4,3,2,1].map(p => <option key={p} value={String(p)}>{p}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="">Trier par</option>
            <option value="prob">Probabilité (desc)</option>
            <option value="impact">Impact (desc)</option>
            <option value="level">Niveau (critique first)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn">Exporter</button>
          <button onClick={bulkCloseActions} className="btn">Fermer actions liées</button>
          <button className="brand-btn" onClick={() => { /* create risk action outside */ }}>Ajouter un risque</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2"><input type="checkbox" checked={selected.length===visible.length && visible.length>0} onChange={toggleAll} /></th>
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
            {visible.map((it) => (
              <tr key={it.id} className="border-t border-border align-top">
                <td className="p-2"><input type="checkbox" checked={selected.includes(it.id)} onChange={() => toggleOne(it.id)} /></td>
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

      <ConfirmModal
        open={confirmOpen}
        title={"Confirmer fermeture des actions"}
        description={`Vous allez fermer ${actionsToCloseCount ?? 0} action(s) liées à ${selected.length} risque(s). Voulez-vous continuer ?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmBulkClose}
      />
    </div>
  );
}
