import React, { useEffect, useState } from "react";
import type { Equipment } from "@shared/api";

export default function EquipmentForm({ initial, open, onClose, onSave }: { initial?: Equipment | null; open: boolean; onClose: () => void; onSave: (payload: Partial<Equipment>) => void; }) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [reference, setReference] = useState("");
  const [state, setState] = useState<Equipment["state"]>("OK");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (initial) {
      setCategory(initial.category || "");
      setName(initial.name || "");
      setReference(initial.reference || "");
      setState(initial.state || "OK");
      setComment(initial.comment || "");
    } else {
      setCategory("");
      setName("");
      setReference("");
      setState("OK");
      setComment("");
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold">{initial ? "Modifier équipement" : "Ajouter équipement"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Catégorie" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom équipement" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Référence" className="px-3 py-2 rounded-md border border-border bg-input" />
          <select value={state} onChange={(e) => setState(e.target.value as any)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="OK">OK</option>
            <option value="A_CONTROLER">À contrôler</option>
            <option value="NON_CONFORME">Non conforme</option>
            <option value="OBSOLETE">Obsolète</option>
            <option value="ABSENT">Absent</option>
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Commentaire" className="col-span-1 md:col-span-2 px-3 py-2 rounded-md border border-border bg-input" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-border text-sm">Annuler</button>
          <button onClick={() => onSave({ category, name, reference, state, comment })} className="brand-btn">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
