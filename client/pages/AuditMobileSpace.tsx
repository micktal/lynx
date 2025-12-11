import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import * as offline from "../lib/offline";
import { getCurrentUser } from "../lib/auth";
import type { Space, Equipment, Risk } from "@shared/api";

export default function AuditMobileSpace() {
  const { auditId, spaceId } = useParams();
  const aid = auditId || "";
  const sid = spaceId || "";
  const user = getCurrentUser();
  const [space, setSpace] = useState<Space | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);

  useEffect(()=>{
    if (!['auditeur','manager'].includes(user.role)) { window.location.href = '/'; return; }
    (async ()=>{
      const spaces = await builder.fetchSpaces();
      const s = spaces.find((x)=>x.id===sid) || null;
      setSpace(s);
      const allEquip = await builder.fetchEquipments();
      setEquipments(allEquip.filter(e=>e.spaceId===sid));
      const allRisks = await builder.fetchRisks();
      setRisks(allRisks.filter(r=>r.spaceId===sid));
    })();
  },[sid]);

  async function quickAddRisk() {
    const title = prompt('Titre risque'); if (!title) return;
    const level = prompt('Niveau','MOYEN') || 'MOYEN';
    const payload = { title, level, spaceId: sid, auditId: aid } as any;
    if (navigator.onLine) { await builder.createRisk(payload); alert('Risque créé'); }
    else { offline.addPendingChange(aid, { type: 'addRisk', payload }); alert('Risque en local'); }
  }

  async function quickAddPhoto() {
    const payload = { fileUrl: '/placeholder.svg', fileType: 'image/png', spaceId: sid, auditId: aid, uploadedBy: user.id } as any;
    if (navigator.onLine) { await builder.createAttachment(payload); alert('Photo uploadée'); }
    else { offline.addPendingChange(aid, { type: 'addPhoto', payload }); alert('Photo stockée localement'); }
  }

  return (
    <div className="bg-background min-h-screen p-3 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">{space?.name || 'Espace'}</div>
          <div className="text-xs text-muted">Étage: {space?.floor || '-'}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <button className="p-4 bg-card rounded" onClick={quickAddRisk}>+ Risque</button>
        <button className="p-4 bg-card rounded" onClick={quickAddPhoto}>+ Photo</button>
        <button className="p-4 bg-card rounded" onClick={()=>window.location.href=`/audit-mobile/${aid}/equipment`}>Équipements</button>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Équipements</h4>
        <ul className="space-y-2 mt-2">
          {equipments.map(e=> (
            <li key={e.id} className="p-3 bg-card rounded flex items-center justify-between" onClick={()=> window.location.href = `/audit-mobile/${aid}/equipment/${e.id}`}>
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted">{e.category}</div>
              </div>
              <div className="text-sm">{e.state}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Risques</h4>
        <ul className="space-y-2 mt-2">
          {risks.map(r=> (
            <li key={r.id} className="p-3 bg-card rounded flex items-center justify-between" onClick={()=> window.location.href = `/risk/${r.id}`}>
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted">Niveau: {r.level}</div>
              </div>
              <div className="text-sm">+</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
