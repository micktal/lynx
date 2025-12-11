import React, { useEffect, useState } from "react";
import type { Risk } from "@shared/api";

export default function RiskForm({ initial, open, onClose, onSave }: { initial?: Risk | null; open: boolean; onClose: () => void; onSave: (payload: Partial<Risk>) => void; }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [probability, setProbability] = useState(1);
  const [impact, setImpact] = useState(1);
  const [level, setLevel] = useState<Risk["level"]>("FAIBLE");
  const [recommendation, setRecommendation] = useState("");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setDescription(initial.description || "");
      setProbability(initial.probability || 1);
      setImpact(initial.impact || 1);
      setLevel(initial.level || "FAIBLE");
      setRecommendation(initial.recommendation || "");
    } else {
      setTitle("");
      setDescription("");
      setProbability(1);
      setImpact(1);
      setLevel("FAIBLE");
      setRecommendation("");
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold">{initial ? "Modifier risque" : "Ajouter risque"}</h3>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="px-3 py-2 rounded-md border border-border bg-input" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 rounded-md border border-border bg-input" />
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">Probabilité</label>
            <input type="number" min={1} max={5} value={probability} onChange={(e) => setProbability(Number(e.target.value))} className="px-2 py-1 rounded-md border border-border w-20" />
            <label className="text-sm text-muted">Impact</label>
            <input type="number" min={1} max={5} value={impact} onChange={(e) => setImpact(Number(e.target.value))} className="px-2 py-1 rounded-md border border-border w-20" />
            <select value={level} onChange={(e) => setLevel(e.target.value as any)} className="px-3 py-2 rounded-md border border-border bg-input">
              <option value="FAIBLE">FAIBLE</option>
              <option value="MOYEN">MOYEN</option>
              <option value="IMPORTANT">IMPORTANT</option>
              <option value="CRITIQUE">CRITIQUE</option>
            </select>
          </div>
          <input value={recommendation} onChange={(e) => setRecommendation(e.target.value)} placeholder="Préconisation" className="px-3 py-2 rounded-md border border-border bg-input" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-border text-sm">Annuler</button>
          <button onClick={() => onSave({ title, description, probability, impact, level, recommendation })} className="brand-btn">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
