import React from "react";

export default function PlanLegend() {
  return (
    <div className="card p-3">
      <h4 className="font-semibold mb-2">Légende</h4>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-600 rounded-full" /> Équipement OK</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-300 rounded-full" /> À contrôler</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded-full" /> Non conforme / Risque Critique</div>
      </div>
    </div>
  );
}
