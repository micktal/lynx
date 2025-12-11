import React, { useEffect, useState } from "react";
import type { ActionItem } from "@shared/api";

export default function ActionForm({ initial, open, onClose, onSave }: { initial?: ActionItem | null; open: boolean; onClose: () => void; onSave: (payload: Partial<ActionItem>) => void; }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<ActionItem["status"]>("OUVERTE");

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || "");
      setDescription(initial.description || "");
      setOwnerId(initial.ownerId || "");
      setDueDate(initial.dueDate || "");
      setStatus(initial.status || "OUVERTE");
    } else {
      setTitle("");
      setDescription("");
      setOwnerId("");
      setDueDate("");
      setStatus("OUVERTE");
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold">{initial ? "Modifier action" : "Ajouter action"}</h3>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" className="px-3 py-2 rounded-md border border-border bg-input" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={ownerId} onChange={(e) => setOwnerId(e.target.value)} placeholder="Responsable (id)" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-input" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 rounded-md border border-border bg-input">
            <option value="OUVERTE">OUVERTE</option>
            <option value="EN_COURS">EN_COURS</option>
            <option value="CLOTUREE">CLOTUREE</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-border text-sm">Annuler</button>
          <button onClick={() => onSave({ title, description, ownerId, dueDate, status })} className="brand-btn">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
