import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import MapOverview from "../components/MapOverview";
import SiteRanking from "../components/SiteRanking";
import * as builder from "../lib/builderService";
import type { Site } from "@shared/api";

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setSites(await builder.fetchSites());
      setBuildings(await builder.fetchBuildings());
      setSpaces(await builder.fetchSpaces());
      setEquipments(await builder.fetchEquipments());
      setRisks(await builder.fetchRisks());
      setActions(await builder.fetchActions());
    })();
  }, []);

  const totals = useMemo(() => ({
    sites: sites.length,
    buildings: buildings.length,
    spaces: spaces.length,
    equipments: equipments.length,
    nonConform: equipments.filter((e:any)=>e.state==='NON_CONFORME').length,
    criticalRisks: risks.filter((r:any)=>r.level==='CRITIQUE').length,
  }), [sites, buildings, spaces, equipments, risks]);

  const siteStats = useMemo(() => {
    // compute per-site stats
    return sites.map((s) => {
      const blds = buildings.filter((b:any)=>b.siteId===s.id);
      const sp = spaces.filter((sp:any)=>blds.some((b:any)=>b.id===sp.buildingId));
      const eq = equipments.filter((e:any)=>sp.some((ss:any)=>ss.id===e.spaceId));
      const rs = risks.filter((r:any)=>r.siteId===s.id);
      const nonConform = eq.filter((e:any)=>e.state==='NON_CONFORME').length;
      const criticalRisks = rs.filter((r:any)=>r.level==='CRITIQUE').length;
      const actionsOpen = actions.filter((a:any)=>a.status==='OUVERTE' && rs.some((r:any)=>r.id===a.riskId)).length;
      // simple score: 100 - (nonConform * 2 + criticalRisks * 5 + actionsOpen * 1)
      const score = Math.max(0, Math.round(100 - (nonConform*2 + criticalRisks*5 + actionsOpen*1)));
      return { site: s, nonConform, criticalRisks, actionsOpen, score };
    }).sort((a,b)=>b.score-a.score);
  }, [sites, buildings, spaces, equipments, risks, actions]);

  const topSites = siteStats.slice(0,5);
  const bottomSites = siteStats.slice(-5).reverse();
  const rankingList = [...topSites, ...bottomSites];

  const handleOpenSite = (id:string) => { window.location.href = `/site/${id}`; };

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Global Sécurité — Multi-Sites</h1>
          <p className="text-sm text-muted mt-1">Vue consolidée sur l’ensemble des sites, bâtiments, équipements et risques.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={async()=>{ setSites(await builder.fetchSites()); setBuildings(await builder.fetchBuildings()); setSpaces(await builder.fetchSpaces()); setEquipments(await builder.fetchEquipments()); setRisks(await builder.fetchRisks()); setActions(await builder.fetchActions()); }} className="px-3 py-2 rounded-md border border-border">🔄 Rafraîchir</button>
          <button onClick={() => { alert('Exporter CSV (mock)'); }} className="brand-btn">Exporter la synthèse</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard title="Sites" value={totals.sites} icon={<span>🌍</span>} />
        <KpiCard title="Bâtiments" value={totals.buildings} icon={<span>🏢</span>} />
        <KpiCard title="Espaces" value={totals.spaces} icon={<span>🗂️</span>} />
        <KpiCard title="Équipements" value={totals.equipments} icon={<span>🔧</span>} />
        <KpiCard title="Non conformes" value={`${totals.nonConform}`} icon={<span>❌</span>} />
        <KpiCard title="Risques critiques" value={totals.criticalRisks} icon={<span>🔥</span>} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <MapOverview sites={sites} onOpen={handleOpenSite} />
        </div>

        <div className="lg:col-span-1">
          <SiteRanking items={rankingList} onOpen={handleOpenSite} />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Répartition des risques par niveau</h3>
          <div className="text-sm text-muted">Bar chart placeholder (data-driven)</div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Tendance mensuelle des risques</h3>
          <div className="text-sm text-muted">Line chart placeholder (data-driven)</div>
        </div>
      </section>

      <section className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold mb-3">État global des équipements</h3>
            <div className="text-sm text-muted">Donut chart placeholder</div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Actions correctives globales</h3>
            <div className="text-sm text-muted">Tableau synthétique des actions (placeholder)</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Alertes Immédiates</h3>
          <div className="text-sm text-muted">
            {(totals.criticalRisks>0 || totals.nonConform>0) ? (
              <div>
                {totals.criticalRisks>0 && <div className="mb-2">🔥 Alerte : {totals.criticalRisks} risques critiques actifs</div>}
                {totals.nonConform>0 && <div>⚠️ {totals.nonConform} équipements non conformes</div>}
              </div>
            ) : (
              <div>Pas d'alerte critique</div>
            )}
          </div>
        </div>
      </section>

    </Layout>
  );
}
