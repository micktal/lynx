import React, { useEffect, useState } from "react";
import type { Building } from "@shared/api";

export default function BuildingForm({
  initial,
  open,
  onClose,
  onSave,
}: {
  initial?: Building | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Building>) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mainUse, setMainUse] = useState("");
  const [floors, setFloors] = useState<number>(1);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setCode(initial.code || "");
      setMainUse(initial.mainUse || "");
      setFloors(initial.floors || 1);
    } else {
      setName("");
      setCode("");
      setMainUse("");
      setFloors(1);
    }
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="bg-card border border-border rounded-md p-6 z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold">{initial ? "Modifier le bâtiment" : "Ajouter un bâtiment"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du bâtiment" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input value={mainUse} onChange={(e) => setMainUse(e.target.value)} placeholder="Usage principal" className="px-3 py-2 rounded-md border border-border bg-input" />
          <input type="number" value={floors} onChange={(e) => setFloors(Number(e.target.value || 1))} placeholder="Étages" className="px-3 py-2 rounded-md border border-border bg-input" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-md border border-border text-sm">Annuler</button>
          <button onClick={() => onSave({ name, code, mainUse, floors })} className="brand-btn">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
