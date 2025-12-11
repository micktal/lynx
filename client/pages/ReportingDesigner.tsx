import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import type { ReportDashboard, ReportWidget } from "@shared/api";

function defaultDashboard(): ReportDashboard {
  return { id: `rd_${Date.now()}`, name: `Nouveau dashboard ${Date.now()}`, description: '', ownerId: 'admin', config: '{}', isDefault: false };
}

export default function ReportingDesignerPage(){
  const [dashboards, setDashboards] = useState<ReportDashboard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [name, setName] = useState('');

  useEffect(()=>{
    const raw = localStorage.getItem('REPORT_DASHBOARDS');
    if(raw) setDashboards(JSON.parse(raw));
  },[]);

  useEffect(()=>{ localStorage.setItem('REPORT_DASHBOARDS', JSON.stringify(dashboards)); },[dashboards]);

  const create = ()=>{
    const d = defaultDashboard();
    setDashboards(prev=>[d,...prev]);
    setSelectedId(d.id);
    setName(d.name);
    setWidgets([]);
  };

  const save = ()=>{
    if(!selectedId) return;
    setDashboards(prev=> prev.map(d=> d.id===selectedId?{...d, name, config: JSON.stringify({ widgets })}:d));
  };

  const addWidget = ()=>{
    const w: ReportWidget = { id: `w_${Date.now()}`, dashboardId: selectedId||'unknown', type: 'kpi', title: 'Nouveau KPI', query: '{}', position: { x:0,y:0 }, size: { width: 2, height: 1 } };
    setWidgets(prev=>[...prev,w]);
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Designer de dashboards</h1>
          <div className="text-sm text-muted">Créez et personnalisez vos tableaux de bord</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={create}>Créer un dashboard</button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <div className="w-1/3">
            <div className="mb-2 font-semibold">Dashboards</div>
            <div className="space-y-2">
              {dashboards.map(d=> (
                <div key={d.id} className={`p-2 border rounded cursor-pointer ${selectedId===d.id? 'bg-slate-50':''}`} onClick={()=>{ setSelectedId(d.id); setName(d.name); try{ const cfg = JSON.parse(d.config||'{}'); setWidgets(cfg.widgets||[]); }catch(e){ setWidgets([]);} }}>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-sm text-muted">{d.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {selectedId ? (
              <div>
                <div className="mb-4">
                  <div className="mb-2 font-semibold">Propriétés</div>
                  <input className="input w-full mb-2" value={name} onChange={(e)=>setName(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn" onClick={save}>Sauvegarder</button>
                    <button className="btn" onClick={addWidget}>Ajouter un widget</button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 font-semibold">Widgets</div>
                  <div className="space-y-2">
                    {widgets.map(w=> (
                      <div key={w.id} className="p-2 border rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">{w.title}</div>
                          <div className="text-sm text-muted">Type: {w.type}</div>
                        </div>
                        <div className="text-sm text-muted">{w.size?.width}×{w.size?.height}</div>
                      </div>
                    ))}
                    {widgets.length===0 && <div className="text-sm text-muted">Aucun widget pour ce dashboard</div>}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-muted">Sélectionnez ou créez un dashboard pour commencer</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
