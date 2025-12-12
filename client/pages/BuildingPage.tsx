import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

import type {
  BuildingPlan,
  PlanArea,
  PlanMarker,
  Building,
} from "@shared/api";

import BuildingPlanInteractive from "../components/BuildingPlanInteractive/BuildingPlanInteractive";
import PlanLegend from "../components/BuildingPlanInteractive/PlanLegend";

export default function BuildingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const buildingId = id || "";

  const [building, setBuilding] = useState<Building | null>(null);
  const [plans, setPlans] = useState<BuildingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BuildingPlan | null>(null);

  const [areas, setAreas] = useState<PlanArea[]>([]);
  const [markers, setMarkers] = useState<PlanMarker[]>([]);

  const [showAreas, setShowAreas] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const [loadingPlans, setLoadingPlans] = useState(true);

  /* ------------------------------------------
     LOAD BUILDING + PLANS
  -------------------------------------------*/
  useEffect(() => {
    (async () => {
      if (!buildingId) return;

      const allBuildings = await builder.fetchBuildings();
      const b = allBuildings.find((x) => x.id === buildingId) || null;
      setBuilding(b);

      const pls = await builder.fetchBuildingPlans(buildingId);
      setPlans(pls);

      if (pls.length) {
        const def = pls.find((p) => p.isDefault) || pls[0];
        setSelectedPlan(def);
      }

      setLoadingPlans(false);
    })();
  }, [buildingId]);

  /* ------------------------------------------
     LOAD AREAS + MARKERS WHEN PLAN CHANGES
  -------------------------------------------*/
  useEffect(() => {
    (async () => {
      if (!selectedPlan) return;

      const pa = await builder.fetchPlanAreas(selectedPlan.id);
      setAreas(pa);

      const pm = await builder.fetchPlanMarkers(selectedPlan.id);
      setMarkers(pm);
    })();
  }, [selectedPlan]);

  /* ------------------------------------------
     HEADER PREMIUM
  -------------------------------------------*/
  const Header = () => (
    <div className="mb-6 p-4 bg-card rounded-xl shadow border border-border flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{building?.name || "Bâtiment"}</h1>
        <div className="text-sm text-muted mt-1">
          {building?.code ? `Code : ${building.code}` : "Aucun code indiqué"}
        </div>

        {building?.mainUse && (
          <div className="text-sm text-muted mt-1">
            Usage principal : <span className="font-medium">{building.mainUse}</span>
          </div>
        )}

        {building?.siteId && (
          <div
            className="mt-3 text-primary underline cursor-pointer text-sm"
            onClick={() => navigate(`/site/${building.siteId}`)}
          >
            ← Retour au site
          </div>
        )}
      </div>

      <div>
        <Link to={`/building/${buildingId}/plans`} className="btn">
          Gérer les plans
        </Link>
      </div>
    </div>
  );

  /* ------------------------------------------
     MAIN RENDER
  -------------------------------------------*/
  return (
    <Layout>
      <Header />

      {/* Loading */}
      {loadingPlans && (
        <div className="card p-6 text-center text-muted">
          Chargement des plans…
        </div>
      )}

      {/* No plans */}
      {!loadingPlans && plans.length === 0 && (
        <div className="card p-6 text-center">
          <h3 className="font-semibold text-lg">Aucun plan disponible</h3>
          <p className="text-muted text-sm mt-2">
            Ajoutez un plan pour commencer la cartographie du bâtiment.
          </p>
          <div className="mt-4">
            <Link className="btn" to={`/building/${buildingId}/plans`}>
              Ajouter un plan
            </Link>
          </div>
        </div>
      )}

      {/* Plans available */}
      {plans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* LEFT — INTERACTIVE PLAN */}
          <div className="lg:col-span-3">
            <div className="mb-3 flex items-center gap-3 flex-wrap">
              {/* Plan selector */}
              <select
                className="input"
                value={selectedPlan?.id || ""}
                onChange={(e) =>
                  setSelectedPlan(
                    plans.find((p) => p.id === e.target.value) || null
                  )
                }
              >
                <option value="">Sélectionner un niveau / étage</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Toggles */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showAreas}
                  onChange={(e) => setShowAreas(e.target.checked)}
                />
                Zones
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                />
                Équipements / risques
              </label>
            </div>

            {/* Interactive Plan */}
            {selectedPlan ? (
              <BuildingPlanInteractive
                buildingPlan={selectedPlan}
                planAreas={areas}
                planMarkers={markers}
                showAreas={showAreas}
                showMarkers={showMarkers}
                onMarkerClick={(m) => {
                  if (m.equipmentId) navigate(`/equipment/${m.equipmentId}`);
                  else if (m.riskId) navigate(`/risk/${m.riskId}`);
                }}
                onAreaClick={(a) => {
                  if (a.spaceId) navigate(`/space/${a.spaceId}`);
                }}
              />
            ) : (
              <div className="card p-6">Aucun plan sélectionné.</div>
            )}
          </div>

          {/* RIGHT — LEGEND + FILTERS */}
          <div className="lg:col-span-1 space-y-4">
            <PlanLegend />

            <div className="card p-3">
              <h4 className="font-semibold mb-2">Filtres</h4>

              <div className="flex flex-col gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Zones colorées par risque
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  Afficher la légende
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
