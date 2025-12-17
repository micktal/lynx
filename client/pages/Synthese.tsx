import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import SyntheseFilters from "../components/SyntheseFilters";
import VisualSummary from "../components/VisualSummary";
import EquipmentTable from "../components/EquipmentTable";
import RiskTable from "../components/RiskTable";
import * as builder from "../lib/builderService";
import type { Equipment, Space, Building, Site, Risk } from "@shared/api";

export default function Synthese() {
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);

  // filters
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [importance, setImportance] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const [view, setView] = useState<"equipments" | "risks">("equipments");

  useEffect(() => {
    (async () => {
      setSites(await builder.fetchSites());
      setBuildings(await builder.fetchBuildings());
      setSpaces(await builder.fetchSpaces());
      setEquipments(await builder.fetchEquipments());
      setRisks(await builder.fetchRisks());
    })();
  }, []);

  // helpers to map ids to names
  const spaceMap = useMemo(() => Object.fromEntries(spaces.map((s) => [s.id, s])), [spaces]);
  const buildingMap = useMemo(() => Object.fromEntries(buildings.map((b) => [b.id, b])), [buildings]);

  // apply filters
  const filteredEquipments = useMemo(() => {
    return equipments.filter((e) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(e.name.toLowerCase().includes(q) || (e.reference || "").toLowerCase().includes(q))) return false;
      }
      if (category && e.category !== category) return false;
      if (stateFilter && e.state !== stateFilter) return false;
      const sp = spaceMap[e.spaceId];
      if (!sp) return false;
      if (importance && sp.importance !== importance) return false;
      if (selectedSite) {
        const b = buildingMap[sp.buildingId];
        if (!b || b.siteId !== selectedSite) return false;
      }
      if (selectedBuilding && sp.buildingId !== selectedBuilding) return false;
      return true;
    });
  }, [equipments, query, category, stateFilter, importance, selectedSite, selectedBuilding, spaceMap, buildingMap]);

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(r.title.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q) || (r.recommendation || "").toLowerCase().includes(q))) return false;
      }
      if (levelFilter && r.level !== levelFilter) return false;
      const sp = spaceMap[r.spaceId || ""];
      if (!sp) return false;
      if (importance && sp.importance !== importance) return false;
      if (selectedSite) {
        const b = buildingMap[sp.buildingId];
        if (!b || b.siteId !== selectedSite) return false;
      }
      if (selectedBuilding && sp.buildingId !== selectedBuilding) return false;
      return true;
    });
  }, [risks, query, levelFilter, importance, selectedSite, selectedBuilding, spaceMap, buildingMap]);

  // KPIs
  const totalEquip = filteredEquipments.length;
  const totalRisks = filteredRisks.length;
  const percentOk = Math.round((equipments.filter((e) => e.state === "OK").length / (equipments.length || 1)) * 100);
  const percentNon = Math.round((equipments.filter((e) => e.state === "NON_CONFORME").length / (equipments.length || 1)) * 100);
  const criticalRisks = risks.filter((r) => r.level === "CRITIQUE").length;

  // Visual data
  const pieData = [
    { label: "OK", value: equipments.filter((e) => e.state === "OK").length },
    { label: "À contrôler", value: equipments.filter((e) => e.state === "A_CONTROLER").length },
    { label: "Non conforme", value: equipments.filter((e) => e.state === "NON_CONFORME").length },
    { label: "Obsolète", value: equipments.filter((e) => e.state === "OBSOLETE").length },
    { label: "Absent", value: equipments.filter((e) => e.state === "ABSENT").length },
  ];

  const barData = useMemo(() => {
    return buildings.map((b) => {
      const bSpaces = spaces.filter((s) => s.buildingId === b.id).map((s) => s.id);
      const bRisks = risks.filter((r) => bSpaces.includes(r.spaceId || ""));
      return {
        label: b.name,
        critical: bRisks.filter((r) => r.level === "CRITIQUE").length,
        important: bRisks.filter((r) => r.level === "IMPORTANT").length,
        medium: bRisks.filter((r) => r.level === "MOYEN").length,
        low: bRisks.filter((r) => r.level === "FAIBLE").length,
      };
    }).slice(0,8);
  }, [buildings, spaces, risks]);

  const resetFilters = () => {
    setSelectedSite(null);
    setSelectedBuilding(null);
    setCategory(null);
    setStateFilter(null);
    setLevelFilter(null);
    setImportance(null);
    setQuery("");
  };

  const exportCsv = () => {
    if (view === "equipments") {
      const rows = filteredEquipments.map((e) => {
        const sp = spaceMap[e.spaceId];
        const buildingName = sp ? (buildingMap[sp.buildingId]?.name || "") : "";
        return [buildingName, sp?.name || "", e.category, e.name, e.reference || "", e.state, e.comment || ""].map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",");
      });
      const csv = ["building,space,category,name,reference,state,comment", ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "equipements.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const rows = filteredRisks.map((r) => {
        const sp = spaceMap[r.spaceId || ""];
        const buildingName = sp ? (buildingMap[sp.buildingId]?.name || "") : "";
        return [buildingName, sp?.name || "", r.title, r.level, r.probability, r.impact, r.recommendation || ""].map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(",");
      });
      const csv = ["building,space,title,level,probability,impact,recommendation", ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "risques.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // pagination simple
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil((view === "equipments" ? filteredEquipments.length : filteredRisks.length) / pageSize));
  useEffect(() => { setPage(1); }, [view, query, selectedSite, selectedBuilding, category, stateFilter, levelFilter, importance]);

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Synthèse Globale de la Sécurité</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text)', fontWeight: 600 }}>Vue consolidée des équipements, risques et statuts pour l’ensemble du périmètre sélectionné.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCsv} className="brand-btn">Exporter Excel</button>
        </div>
      </div>

      <section className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard title="Équipements total" value={equipments.length} icon={<span>🔧</span>} />
        <KpiCard title="Risques total" value={risks.length} icon={<span>⚠️</span>} />
        <KpiCard title="% OK" value={`${percentOk}%`} icon={<span>✅</span>} />
        <KpiCard title="% Non conformes" value={`${percentNon}%`} icon={<span>❌</span>} />
        <KpiCard title="Risques critiques" value={criticalRisks} icon={<span>🔥</span>} />
      </section>

      <section className="mb-4">
        <SyntheseFilters
          sites={sites}
          buildings={buildings}
          selectedSite={selectedSite}
          setSelectedSite={setSelectedSite}
          selectedBuilding={selectedBuilding}
          setSelectedBuilding={setSelectedBuilding}
          category={category}
          setCategory={setCategory}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          importance={importance}
          setImportance={setImportance}
          query={query}
          setQuery={setQuery}
          onReset={resetFilters}
          onExport={exportCsv}
        />
      </section>

      <section className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("equipments")} className={`px-3 py-2 rounded-md ${view==="equipments"?"bg-primary text-white":"border border-border"}`}>Équipements</button>
          <button onClick={() => setView("risks")} className={`px-3 py-2 rounded-md ${view==="risks"?"bg-destructive text-white":"border border-border"}`}>Risques</button>
        </div>
        <div className="text-sm text-muted">Vue: {view === "equipments" ? "Équipements" : "Risques"} • Résultats: {view === "equipments" ? filteredEquipments.length : filteredRisks.length}</div>
      </section>

      <section className="mb-6">
        <VisualSummary pieData={pieData} barData={barData} />
      </section>

      <section>
        {view === "equipments" ? (
          <div>
            <EquipmentTable
              items={filteredEquipments.slice((page-1)*pageSize, page*pageSize)}
              onEdit={() => { alert('Édition équipement (mock)'); }}
              onDelete={(id)=>{ if(window.confirm('Supprimer équipement ?')){ builder.deleteEquipment(id).then(()=> setEquipments(prev=>prev.filter(e=>e.id!==id))); } }}
              onAdd={() => { alert('Ajouter équipement (mock)'); }}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted">Page {page} / {pageCount}</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border border-border rounded">Préc</button>
                <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="px-3 py-1 border border-border rounded">Suiv</button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <RiskTable
              items={filteredRisks.slice((page-1)*pageSize, page*pageSize)}
              onEdit={(r)=>{ alert('Modifier risque (mock)'); }}
              onDelete={(id)=>{ if(window.confirm('Supprimer risque ?')){ builder.deleteRisk(id).then(()=> setRisks(prev=>prev.filter(x=>x.id!==id))); } }}
              onCreateAction={(riskId)=>{ alert('Créer action pour ' + riskId); }}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-muted">Page {page} / {pageCount}</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border border-border rounded">Préc</button>
                <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="px-3 py-1 border border-border rounded">Suiv</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6">
        {/* Alerts */}
        { (risks.filter(r=>r.level==='CRITIQUE').length > 0 || equipments.filter(e=>e.state==='NON_CONFORME').length > 0) && (
          <div className="card">
            <h3 className="text-lg font-semibold">Alerte critiques</h3>
            <div className="mt-2 text-sm text-muted">
              {equipments.filter(e=>e.state==='NON_CONFORME').length > 0 && (
                <div className="mb-2">⚠️ {equipments.filter(e=>e.state==='NON_CONFORME').length} équipements non conformes détectés</div>
              )}
              {risks.filter(r=>r.level==='CRITIQUE').length > 0 && (
                <div>🔥 {risks.filter(r=>r.level==='CRITIQUE').length} risques critiques — Vérifier immédiatement les zones concernées.</div>
              )}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
