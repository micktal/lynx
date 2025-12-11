import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Risk, ActionItem, Equipment, Incident, Site, Building, Space } from "@shared/api";

function Kpi({ title, value, color = "bg-white" }: { title: string; value: string | number; color?: string }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${color}`}>{value}</div>
      <div>
        <div className="text-sm text-muted">{title}</div>
      </div>
    </div>
  );
}

function SmallBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div>
      <div className="text-sm mb-1">{label} <span className="text-muted text-xs">({value})</span></div>
      <div className="w-full bg-slate-100 h-3 rounded overflow-hidden">
        <div className="h-3 bg-primary rounded" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

export default function ReportingPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [periodDays, setPeriodDays] = useState<number>(30);

  useEffect(() => {
    builder.fetchClients().then(setClients);
    builder.fetchSites().then(setSites);
    builder.fetchBuildings().then(setBuildings);
    builder.fetchSpaces().then(setSpaces);
    builder.fetchRisks().then(setRisks);
    builder.fetchActions().then(setActions);
    builder.fetchEquipments().then(setEquipments);
    builder.fetchIncidents().then(setIncidents);
  }, []);

  const filtered = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - periodDays);
    const sinceIso = since.toISOString();

    const bySite = (item: any) => (selectedSite ? item.siteId === selectedSite || item.siteId === (selectedSite as any) : true);
    const byBuilding = (item: any) => (selectedBuilding ? item.buildingId === selectedBuilding : true);
    const bySpace = (item: any) => (selectedSpace ? item.spaceId === selectedSpace : true);
    const byLevel = (item: any) => (selectedLevel ? item.level === selectedLevel : true);

    return {
      risks: risks.filter(r => bySite(r) && byBuilding(r) && bySpace(r) && byLevel(r)),
      actions: actions.filter(a => bySite(a) && byBuilding(a) && a.dueDate ? a.dueDate >= sinceIso || true : true),
      equipments: equipments.filter(e => bySite(e) || !selectedSite),
      incidents: incidents.filter(i => (i.createdAt ? i.createdAt >= sinceIso : true) && bySite(i) && byBuilding(i) && bySpace(i)),
    };
  }, [risks, actions, equipments, incidents, selectedSite, selectedBuilding, selectedSpace, selectedLevel, periodDays]);

  const kpis = useMemo(() => {
    const totalRisks = filtered.risks.length;
    const criticalRisks = filtered.risks.filter(r => r.level === 'CRITIQUE').length;
    const nonConform = filtered.equipments.filter(e => e.state === 'NON_CONFORME').length;
    const actionsOpen = filtered.actions.filter(a => a.status !== 'CLOTUREE').length;
    const incidentsOpen = filtered.incidents.filter(i => i.status === 'OPEN').length;
    return { totalRisks, criticalRisks, nonConform, actionsOpen, incidentsOpen };
  }, [filtered]);

  const risksByLevel = useMemo(() => {
    const map: Record<string, number> = { FAIBLE: 0, MOYEN: 0, IMPORTANT: 0, CRITIQUE: 0 };
    filtered.risks.forEach(r => map[r.level] = (map[r.level] || 0) + 1);
    return map;
  }, [filtered]);

  const risksBySite = useMemo(() => {
    const map = new Map<string, number>();
    filtered.risks.forEach(r => { if (r.siteId) map.set(r.siteId, (map.get(r.siteId) || 0) + 1); });
    const arr = Array.from(map.entries()).map(([siteId, count]) => ({ siteId, siteName: sites.find(s => s.id === siteId)?.name || siteId, count }));
    arr.sort((a,b)=>b.count-a.count);
    return arr;
  }, [filtered, sites]);

  const actionsByStatus = useMemo(() => {
    const map: Record<string, number> = { OUVERTE: 0, EN_COURS: 0, CLOTUREE: 0 };
    filtered.actions.forEach(a => map[a.status] = (map[a.status] || 0) + 1);
    return map;
  }, [filtered]);

  const equipmentByCategory = useMemo(() => {
    const map = new Map<string, { OK:number; NC:number; OBS:number; total:number }>();
    filtered.equipments.forEach(e => {
      const key = e.category || 'Autre';
      if (!map.has(key)) map.set(key, { OK:0, NC:0, OBS:0, total:0 } as any);
      const cur = map.get(key)!;
      cur.total++;
      if (e.state === 'OK') cur.OK++;
      if (e.state === 'NON_CONFORME') cur.NC++;
      if (e.state === 'OBSOLETE') cur.OBS++;
    });
    return Array.from(map.entries()).map(([category, data]) => ({ category, ...data }));
  }, [filtered]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporting & Analytics</h1>
          <div className="text-sm text-muted">Tableaux de bord dynamiques et analyses</div>
        </div>
        <div className="flex gap-2">
          <button className="btn">Créer un dashboard</button>
          <button className="btn">Mode plein écran</button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select className="input" value={selectedClient} onChange={(e)=>setSelectedClient(e.target.value)}>
            <option value="">Tous les clients</option>
            {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select className="input" value={selectedSite} onChange={(e)=>setSelectedSite(e.target.value)}>
            <option value="">Tous les sites</option>
            {sites.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select className="input" value={selectedBuilding} onChange={(e)=>setSelectedBuilding(e.target.value)}>
            <option value="">Tous les bâtiments</option>
            {buildings.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select className="input" value={selectedSpace} onChange={(e)=>setSelectedSpace(e.target.value)}>
            <option value="">Tous les espaces</option>
            {spaces.map(sp=> <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>

          <select className="input" value={selectedLevel} onChange={(e)=>setSelectedLevel(e.target.value)}>
            <option value="">Tous niveaux</option>
            <option value="FAIBLE">Faible</option>
            <option value="MOYEN">Moyen</option>
            <option value="IMPORTANT">Important</option>
            <option value="CRITIQUE">Critique</option>
          </select>

          <select className="input" value={periodDays} onChange={(e)=>setPeriodDays(Number(e.target.value))}>
            <option value={30}>30 jours</option>
            <option value={90}>3 mois</option>
            <option value={180}>6 mois</option>
            <option value={365}>12 mois</option>
          </select>

        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Kpi title="Total risques" value={kpis.totalRisks} color="bg-blue-600" />
        <Kpi title="Risques critiques" value={kpis.criticalRisks} color="bg-red-600" />
        <Kpi title="Équipements non conformes" value={kpis.nonConform} color="bg-yellow-500" />
        <Kpi title="Actions non clôturées" value={kpis.actionsOpen} color="bg-indigo-600" />
        <Kpi title="Incidents ouverts" value={kpis.incidentsOpen} color="bg-emerald-600" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Risques par niveau</h3>
          <div className="space-y-3">
            {Object.entries(risksByLevel).map(([k,v])=> <SmallBar key={k} label={k} value={v} max={Math.max(...Object.values(risksByLevel),1)} />)}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Risques par site</h3>
          <div className="space-y-3">
            {risksBySite.map(s=> <div key={s.siteId}><SmallBar label={s.siteName} value={s.count} max={risksBySite.length?risksBySite[0].count:1} /></div>)}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Actions par statut</h3>
          <div className="space-y-3">
            {Object.entries(actionsByStatus).map(([k,v])=> <SmallBar key={k} label={k} value={v} max={Math.max(...Object.values(actionsByStatus),1)} />)}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Incidents & Risques - Tendance</h3>
          <div className="text-sm text-muted">Courbe temporelle (données simulées)</div>
          <div className="h-48 flex items-end gap-2 mt-4">
            {Array.from({ length: 12 }).map((_,i)=> <div key={i} className="flex-1 bg-slate-100 rounded p-1 flex items-end"><div className="w-full bg-primary rounded" style={{height: `${20 + (i%5)*10}px`}}/></div>)}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Heatmap: Bâtiments × Niveau</h3>
          <div className="text-sm text-muted mb-4">Matrice de risque par bâtiment</div>
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left">
                <th>Bâtiment</th>
                <th className="text-center">Faible</th>
                <th className="text-center">Moyen</th>
                <th className="text-center">Important</th>
                <th className="text-center">Critique</th>
              </tr>
            </thead>
            <tbody>
              {buildings.map(b=>{
                const counts = { FAIBLE:0, MOYEN:0, IMPORTANT:0, CRITIQUE:0 } as any;
                filtered.risks.filter(r=>r.buildingId===b.id).forEach(r=>counts[r.level] = (counts[r.level]||0)+1);
                return (
                  <tr key={b.id} className="border-t">
                    <td className="py-2">{b.name}</td>
                    <td className="text-center">{counts.FAIBLE}</td>
                    <td className="text-center">{counts.MOYEN}</td>
                    <td className="text-center">{counts.IMPORTANT}</td>
                    <td className="text-center">{counts.CRITIQUE}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Équipements par catégorie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentByCategory.map(ec=> (
              <div key={ec.category} className="p-3 border rounded">
                <div className="font-medium mb-2">{ec.category} <span className="text-muted text-sm">({ec.total})</span></div>
                <div className="flex gap-2">
                  <div className="text-sm">OK: {ec.OK}</div>
                  <div className="text-sm">NC: {ec.NC}</div>
                  <div className="text-sm">OBS: {ec.OBS}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
}
