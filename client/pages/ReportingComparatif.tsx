import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Site } from "@shared/api";

export default function ReportingComparatifPage(){
  const [sites, setSites] = useState<Site[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(()=>{ builder.fetchSites().then(setSites); },[]);

  const selectable = sites;

  const toggle = (id:string)=>{
    setSelected(prev => prev.includes(id) ? prev.filter(p=>p!==id) : (prev.length<10 ? [...prev,id] : prev));
  };

  const rows = useMemo(()=>{
    // summarize simple metrics per site using existing mocks
    return selected.map(id=>{
      const s = sites.find(x=>x.id===id)!;
      return { id, name: s?.name || id, risks: Math.floor(Math.random()*50), actions: Math.floor(Math.random()*20), incidents: Math.floor(Math.random()*10), compliance: Math.floor(Math.random()*100) };
    });
  },[selected, sites]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Comparaison multi-sites</h1>
          <div className="text-sm text-muted">Comparer jusqu'à 10 sites côte à côte</div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="text-sm mb-3">Sélectionnez les sites à comparer (max 10)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {selectable.map(s=> (
            <label key={s.id} className={`p-3 border rounded cursor-pointer ${selected.includes(s.id)?'bg-slate-50':''}`}>
              <input type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)} className="mr-2" /> {s.name}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Tableau comparatif</h3>
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-left border-b">
              <th>Site</th>
              <th>Risques</th>
              <th>Actions</th>
              <th>Incidents</th>
              <th>Taux conformité (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.name}</td>
                <td>{r.risks}</td>
                <td>{r.actions}</td>
                <td>{r.incidents}</td>
                <td>{r.compliance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Layout>
  );
}
