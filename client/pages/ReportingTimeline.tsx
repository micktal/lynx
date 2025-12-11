import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import * as builder from "@/lib/builderService";
import type { Incident } from "@shared/api";

export default function ReportingTimelinePage(){
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [periodDays, setPeriodDays] = useState<number>(90);

  useEffect(()=>{ builder.fetchIncidents().then(setIncidents); },[]);

  const filtered = useMemo(()=>{
    const since = new Date(); since.setDate(since.getDate()-periodDays);
    const sinceIso = since.toISOString();
    return incidents.filter(i=> (i.createdAt? i.createdAt>=sinceIso : true));
  },[incidents, periodDays]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Analyse temporelle</h1>
          <div className="text-sm text-muted">Évolution des incidents, risques et actions</div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex gap-2 items-center">
          <select className="input" value={periodDays} onChange={(e)=>setPeriodDays(Number(e.target.value))}>
            <option value={30}>30 jours</option>
            <option value={90}>3 mois</option>
            <option value={180}>6 mois</option>
            <option value={365}>12 mois</option>
          </select>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Timeline incidents</h3>
        <div className="space-y-2">
          {filtered.map(i=> (
            <div key={i.id} className="p-2 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{i.type} <span className="text-muted text-sm">{i.priority}</span></div>
                <div className="text-sm text-muted">{i.description}</div>
              </div>
              <div className="text-sm text-muted">{i.createdAt}</div>
            </div>
          ))}
        </div>
      </div>

    </Layout>
  );
}
