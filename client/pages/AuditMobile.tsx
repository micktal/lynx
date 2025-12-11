import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import Fab from "../components/mobile/Fab";
import * as builder from "../lib/builderService";
import { getCurrentUser } from "../lib/auth";
import * as offline from "../lib/offline";
import type { Space, Equipment, Risk, Audit } from "@shared/api";

export default function AuditMobile() {
  const { auditId } = useParams();
  const aid = auditId || "";
  const user = getCurrentUser();
  const [tab, setTab] = useState<string>("spaces");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (!['auditeur','manager'].includes(user.role)) {
      window.location.href = "/";
      return;
    }
    (async ()=>{
      // try online load
      try {
        const allAudits = await builder.fetchAudits();
        const a = allAudits.find((x)=>x.id===aid) || null;
        setAudit(a);
        // load spaces for building if available
        if (a && a.buildingId) {
          const allSpaces = await builder.fetchSpaces();
          const sps = allSpaces.filter((s)=>s.buildingId===a.buildingId);
          setSpaces(sps);
          const allEquip = await builder.fetchEquipments();
          setEquipments(allEquip.filter((e)=>sps.some((sp)=>sp.id===e.spaceId)));
          const allRisks = await builder.fetchRisks();
          setRisks(allRisks.filter((r)=>sps.some((sp)=>sp.id===r.spaceId)));
        }
        // cache
        await offline.saveCache(aid, { audit: a, spaces, equipments, risks });
      } catch (e) {
        // load from cache
        const cache = await offline.loadCache(aid);
        if (cache) {
          setAudit(cache.audit || null);
          setSpaces(cache.spaces || []);
          setEquipments(cache.equipments || []);
          setRisks(cache.risks || []);
        }
      }

      setPending(offline.getPendingChanges(aid));
    })();

    const onOnline = async () => {
      // auto sync
      await handleSync();
    };
    window.addEventListener('online', onOnline);
    return ()=> window.removeEventListener('online', onOnline);
  }, [aid]);

  async function handleAddRiskQuick(spaceId?: string) {
    const title = prompt('Titre du risque (court)');
    if (!title) return;
    const level = prompt('Niveau (FAIBLE/MOYEN/IMPORTANT/CRITIQUE)','MOYEN') || 'MOYEN';
    const payload = { title, level, spaceId, auditId: aid } as any;
    // if online, attempt to create immediately else queue
    if (navigator.onLine) {
      await builder.createRisk(payload);
      alert('Risque ajouté (en ligne)');
    } else {
      offline.addPendingChange(aid, { type: 'addRisk', payload });
      setPending(offline.getPendingChanges(aid));
      alert('Risque ajouté en local (offline)');
    }
  }

  async function handleTakePhoto(spaceId?: string) {
    // mock: create attachment pointing to placeholder
    const payload = { fileUrl: '/placeholder.svg', fileType: 'image/png', spaceId, auditId: aid, uploadedBy: user.id } as any;
    if (navigator.onLine) {
      await builder.createAttachment(payload);
      alert('Photo uploadée (mock)');
    } else {
      offline.addPendingChange(aid, { type: 'addPhoto', payload });
      setPending(offline.getPendingChanges(aid));
      alert('Photo stockée en local');
    }
  }

  async function handleSync() {
    setSyncing(true);
    const res = await offline.syncPendingChanges(aid, (t)=>console.log(t));
    setPending(offline.getPendingChanges(aid));
    setSyncing(false);
    if (res.every(r=>r.ok)) alert('Synchronisation réussie 👍'); else alert('Synchronisation partielle');
  }

  return (
    <div className={dark? 'bg-black text-white min-h-screen pb-24':'bg-background min-h-screen pb-24'}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="font-semibold">{audit?.title || 'Audit'}</div>
          <div className="text-xs text-muted">{audit?.siteId || ''}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-sm" onClick={()=>setDark(d=>!d)}>{dark? '🌙':'🌙'}</button>
          <Link to={`/audit/${audit?.id||''}`} className="btn-sm">Retour</Link>
        </div>
      </div>

      <div className="p-3">
        {tab === 'spaces' && (
          <div>
            <div className="text-sm text-muted mb-2">Espaces</div>
            <ul className="space-y-2">
              {spaces.map((s)=> (
                <li key={s.id} className="p-3 bg-card rounded flex items-center justify-between" onClick={()=> window.location.href = `/audit-mobile/${aid}/space/${s.id}`}>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted">Étage: {s.floor || '-'}</div>
                  </div>
                  <div className="text-sm text-muted">⚠️ {risks.filter(r=>r.spaceId===s.id).length} • 🔧 {equipments.filter(e=>e.spaceId===s.id).length}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'equipments' && (
          <div>
            <div className="text-sm text-muted mb-2">Équipements</div>
            <ul className="space-y-2">
              {equipments.map((e)=> (
                <li key={e.id} className="p-3 bg-card rounded flex items-center justify-between" onClick={()=> window.location.href = `/audit-mobile/${aid}/equipment/${e.id}`}>
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-muted">{e.category} • {e.reference || ''}</div>
                  </div>
                  <div className="text-sm">{e.state}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'risks' && (
          <div>
            <div className="text-sm text-muted mb-2">Risques</div>
            <ul className="space-y-2">
              {risks.map((r)=> (
                <li key={r.id} className="p-3 bg-card rounded flex items-center justify-between" onClick={()=> window.location.href = `/risk/${r.id}`}>
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted">Espace: {r.spaceId || '-'}</div>
                  </div>
                  <div className="text-sm">{r.level}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'photos' && (
          <div>
            <div className="text-sm text-muted mb-2">Photos</div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p,i)=> (
                <div key={i} className="bg-card p-2 rounded"><img src={p.fileUrl} alt="photo" /></div>
              ))}
            </div>
            <div className="mt-4">
              <button className="btn" onClick={()=>handleTakePhoto()}>Prendre une photo</button>
            </div>
          </div>
        )}

        {tab === 'sync' && (
          <div>
            <div className="text-sm text-muted mb-2">Synchronisation</div>
            <div className="card p-3">
              <div>En attente: {pending.length}</div>
              <div>Statut connexion: {navigator.onLine? 'En ligne' : 'Hors ligne'}</div>
              <div className="mt-3 flex gap-2">
                <button className="btn" onClick={handleSync} disabled={syncing}>{syncing? 'Sync...' : 'Forcer synchronisation'}</button>
                <button className="btn-ghost" onClick={()=>{ const pc = offline.getPendingChanges(aid); alert(JSON.stringify(pc,null,2)); }}>Voir pending</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Fab onClick={()=>{ if (tab==='spaces') handleAddRiskQuick(); else if (tab==='equipments') window.location.href=`/audit-mobile/${aid}/equipment/new`; else if (tab==='risks') handleAddRiskQuick(); else if (tab==='photos') handleTakePhoto(); }} />

      <MobileBottomNav value={tab} onChange={setTab} />
    </div>
  );
}
