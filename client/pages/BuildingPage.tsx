import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { BuildingPlan, PlanArea, PlanMarker, Building } from "@shared/api";
import BuildingPlanInteractive from "../components/BuildingPlanInteractive/BuildingPlanInteractive";
import PlanLegend from "../components/BuildingPlanInteractive/PlanLegend";

export default function BuildingPage() {
  const { id } = useParams();
  const buildingId = id || "";
  const [building, setBuilding] = useState<Building | null>(null);
  const [plans, setPlans] = useState<BuildingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BuildingPlan | null>(null);
  const [areas, setAreas] = useState<PlanArea[]>([]);
  const [markers, setMarkers] = useState<PlanMarker[]>([]);
  const [showAreas, setShowAreas] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  useEffect(() => {
    (async () => {
      if (!buildingId) return;
      const all = await builder.fetchBuildings();
      const b = all.find((x) => x.id === buildingId) || null;
      setBuilding(b);
      const pls = await builder.fetchBuildingPlans(buildingId);
      setPlans(pls);
      if (pls.length) setSelectedPlan(pls.find((p) => p.isDefault) || pls[0]);
    })();
  }, [buildingId]);

  useEffect(() => {
    (async () => {
      if (!selectedPlan) return;
      const pa = await builder.fetchPlanAreas(selectedPlan.id);
      setAreas(pa);
      const pm = await builder.fetchPlanMarkers(selectedPlan.id);
      setMarkers(pm);
    })();
  }, [selectedPlan]);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan du bâtiment</h1>
          <div className="text-sm text-muted">{building ? building.name : "Chargement..."}</div>
        </div>
        <div>
          <Link to={`/building/${buildingId}/plans`} className="btn">Gérer les plans</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center gap-3">
            <select className="input" value={selectedPlan?.id || ""} onChange={(e) => setSelectedPlan(plans.find((p) => p.id === e.target.value) || null)}>
              <option value="">Sélectionner un niveau / étage</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2"><input type="checkbox" checked={showAreas} onChange={(e) => setShowAreas(e.target.checked)} /> Afficher les zones</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} /> Afficher les équipements/risques</label>
          </div>

          {selectedPlan ? (
            <BuildingPlanInteractive buildingPlan={selectedPlan} planAreas={areas} planMarkers={markers} showAreas={showAreas} showMarkers={showMarkers} onMarkerClick={(m)=>{ if (m.equipmentId) window.location.href = `/equipment/${m.equipmentId}`; else if (m.riskId) window.location.href = `/risk/${m.riskId}`; }} onAreaClick={(a)=>{ if (a.spaceId) window.location.href = `/space/${a.spaceId}`; }} />
          ) : (
            <div className="card p-6">Aucun plan sélectionné.</div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <PlanLegend />
          <div className="card p-3">
            <h4 className="font-semibold mb-2">Filtres</h4>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Zones colorées par risque</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Montrer légende</label>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
