import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function ClientPortal() {
  const [params] = useSearchParams();
  const clientId = params.get('clientId') || undefined;
  const [client, setClient] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      if (!clientId) return;
      const cls = await builder.fetchClients();
      setClient(cls.find((c:any)=>c.id===clientId)||null);
      setRisks((await builder.fetchRisks()).filter(r=>r.clientId===clientId));
      setActions((await builder.fetchActions()).filter(a=>a.clientId===clientId));
      setSites((await builder.fetchSites()).filter(s=>s.clientId===clientId));
    })();
  },[clientId]);

  if (!clientId) return <Layout><div className="card p-4">Client non spécifié</div></Layout>;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{client?.name || 'Portail client'}</div>
            <div className="text-sm text-muted">Dashboard client simplifié</div>
          </div>
          <div>
            <button className="btn">Se déconnecter</button>
          </div>
        </div>
      </div>

      <main className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="card p-4">
            <div className="text-sm text-muted">Risques totaux</div>
            <div className="text-2xl font-bold mt-1">{risks.length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Actions ouvertes</div>
            <div className="text-2xl font-bold mt-1">{actions.filter(a=>a.status!=='CLOTUREE').length}</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-muted">Sites</div>
            <div className="text-2xl font-bold mt-1">{sites.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">Risques critiques</h3>
            <ul className="space-y-2">
              {risks.filter(r=>r.level==='CRITIQUE').map(r=> (<li key={r.id} className="border rounded p-2"><div className="font-medium">{r.title}</div><div className="text-xs text-muted">Espace: {r.spaceId}</div></li>))}
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Actions en retard</h3>
            <ul className="space-y-2">
              {actions.filter(a=>a.status!=='CLOTUREE' && a.dueDate && new Date(a.dueDate) < new Date()).map(a=> (<li key={a.id} className="border rounded p-2"><div className="font-medium">{a.title}</div><div className="text-xs text-muted">Échéance: {a.dueDate}</div></li>))}
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}
