import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Incident, Agent, SupervisionEvent } from "@shared/api";

export default function Supervision() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<SupervisionEvent[]>([]);
  const [live, setLive] = useState(true);
  const intervalRef = useRef<number | null>(null);

  async function loadAll() {
    const [incs, ags, evs] = await Promise.all([builder.fetchIncidents(), builder.fetchAgents(), builder.fetchSupervisionEvents()]);
    setIncidents(incs);
    setAgents(ags);
    setEvents(evs.slice(0,200));
  }

  useEffect(()=>{
    loadAll();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(()=>{ if (live) loadAll(); }, 5000);
    return ()=> { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  },[]);

  async function takeOwnership(incident: Incident) {
    const user = 'pc_user';
    await builder.updateIncident(incident.id, { assignedTo: user, status: 'IN_PROGRESS' });
    await builder.createSupervisionEvent({ eventType: 'ALERT', entityType: 'incident', entityId: incident.id, description: `Incident ${incident.id} pris en charge par ${user}`, timestamp: new Date().toISOString() });
    loadAll();
  }

  async function markResolved(incident: Incident) {
    await builder.updateIncident(incident.id, { status: 'RESOLVED', resolvedAt: new Date().toISOString() });
    await builder.createSupervisionEvent({ eventType: 'INFO', entityType: 'incident', entityId: incident.id, description: `Incident ${incident.id} résolu`, timestamp: new Date().toISOString() });
    loadAll();
  }

  async function triggerPanic() {
    await builder.createSupervisionEvent({ eventType: 'ALERT', entityType: 'system', description: 'PROTOCOL PANIC ACTIVATED', timestamp: new Date().toISOString() });
    alert('Protocole d\'alerte activé');
    loadAll();
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supervision Temps Réel</h1>
          <div className="text-sm text-muted">Vue centrale incidents & agents</div>
        </div>
        <div className="flex items-center gap-2">
          <button className={`btn ${live?'btn-primary':''}`} onClick={()=>setLive(l=>!l)}>{live? 'LIVE — Connected 🔴' : 'Offline'}</button>
          <button className="btn-destructive" onClick={triggerPanic}>PANIC</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="card p-4 mb-4">
            <h3 className="font-semibold mb-2">Carte Temps Réel (placeholder)</h3>
            <div style={{ height: 420, background: '#0f172a', color: 'white' }} className="rounded p-4">Mapbox / Google Maps placeholder — integrate map SDK for real UI</div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Incidents en direct</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left"><th>Type</th><th>Priorité</th><th>Statut</th><th>Site</th><th>Heure</th><th>Assigné</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {incidents.map(i=> (
                  <tr key={i.id} className="border-t">
                    <td className="py-2">{i.type}</td>
                    <td>{i.priority}</td>
                    <td>{i.status}</td>
                    <td>{i.siteId}</td>
                    <td>{i.createdAt?(new Date(i.createdAt).toLocaleTimeString()):'-'}</td>
                    <td>{i.assignedTo || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-sm" onClick={()=>takeOwnership(i)}>Prendre en charge</button>
                        <button className="btn-sm" onClick={()=>markResolved(i)}>Marquer résolu</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card p-4 mb-4">
            <h3 className="font-semibold mb-2">Agents</h3>
            <ul className="space-y-2">
              {agents.map(a=> (
                <li key={a.id} className="p-3 bg-card rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted">{a.status} • {a.lastCheckIn? new Date(a.lastCheckIn).toLocaleTimeString() : '-'}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm">{a.lastKnownPosition? `${a.lastKnownPosition.lat.toFixed(3)},${a.lastKnownPosition.lng.toFixed(3)}` : '—'}</div>
                    <button className="btn-sm mt-2" onClick={()=>{ if (a.lastKnownPosition) alert('Center map to '+a.name); }}>Localiser</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Journal Live</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {events.map(ev=> (
                <div key={ev.id} className="p-2 border-b text-sm"><span className="text-muted">{new Date(ev.timestamp).toLocaleTimeString()} — </span>{ev.description}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
