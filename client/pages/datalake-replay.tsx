import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import * as builder from "../lib/builderService";
import type { DataLakeRecord } from "@shared/api";

export default function DataLakeReplayPage(){
  const { entityType, entityId } = useParams();
  const [records, setRecords] = useState<DataLakeRecord[]>([]);

  useEffect(()=>{ if(entityType && entityId) load(); }, [entityType, entityId]);

  async function load(){
    if(!entityType || !entityId) return;
    const recs = await builder.fetchDataLakeForEntity(entityType, entityId);
    setRecords(recs);
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Replay: {entityType} / {entityId}</h1>
        <div className="text-sm text-muted">Timeline des versions disponibles</div>
      </div>

      <div className="card p-4">
        {records.length===0 ? (
          <div className="text-muted">Aucune version trouvée pour cet élément.</div>
        ) : (
          <ul className="space-y-3">
            {records.map(r=> (
              <li key={r.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{new Date(r.timestamp).toLocaleString()} — {r.changeType}</div>
                    <div className="text-sm text-muted">Par: {r.changedBy || '—'} • Client: {r.clientId || '—'}</div>
                  </div>
                  <div>
                    <button className="btn-ghost" onClick={()=>{ alert(JSON.stringify(JSON.parse(typeof r.snapshot === 'string' ? r.snapshot : JSON.stringify(r.snapshot)), null, 2)); }}>Afficher snapshot</button>
                  </div>
                </div>
                {r.delta && <pre className="mt-2 text-sm bg-slate-50 p-2 rounded overflow-auto">{typeof r.delta === 'string' ? r.delta : JSON.stringify(r.delta)}</pre>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
