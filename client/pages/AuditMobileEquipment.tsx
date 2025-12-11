import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as builder from "../lib/builderService";
import * as offline from "../lib/offline";
import { getCurrentUser } from "../lib/auth";
import type { Equipment } from "@shared/api";

export default function AuditMobileEquipment() {
  const { auditId, equipmentId } = useParams();
  const aid = auditId || "";
  const eid = equipmentId || "";
  const user = getCurrentUser();
  const [equipment, setEquipment] = useState<Equipment | null>(null);

  useEffect(()=>{
    if (!['auditeur','manager'].includes(user.role)) { window.location.href = '/'; return; }
    (async ()=>{
      const eqs = await builder.fetchEquipments();
      const e = eqs.find(x=>x.id===eid) || null;
      setEquipment(e);
    })();
  },[eid]);

  async function changeState(newState: any) {
    if (!equipment) return;
    if (navigator.onLine) {
      await builder.updateEquipment(equipment.id, { state: newState });
      alert('État mis à jour');
    } else {
      offline.addPendingChange(aid, { type: 'updateEquipment', payload: { id: equipment.id, patch: { state: newState } } });
      alert('Mise à jour stockée localement');
    }
  }

  async function addPhoto() {
    const payload = { fileUrl: '/placeholder.svg', fileType: 'image/png', equipmentId: equipment?.id, auditId: aid, uploadedBy: user.id } as any;
    if (navigator.onLine) { await builder.createAttachment(payload); alert('Photo ajoutée'); }
    else { offline.addPendingChange(aid, { type: 'addPhoto', payload }); alert('Photo stockée'); }
  }

  return (
    <div className="bg-background min-h-screen p-3 pb-24">
      <div className="mb-4">
        <div className="font-semibold">{equipment?.name || 'Équipement'}</div>
        <div className="text-xs text-muted">{equipment?.category}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button className="p-3 bg-card rounded" onClick={()=>changeState('OK')}>OK</button>
        <button className="p-3 bg-card rounded" onClick={()=>changeState('A_CONTROLER')}>À contrôler</button>
        <button className="p-3 bg-card rounded" onClick={()=>changeState('NON_CONFORME')}>Non conforme</button>
        <button className="p-3 bg-card rounded" onClick={()=>changeState('OBSOLETE')}>Obsolète</button>
      </div>

      <div className="mb-4">
        <label className="text-sm">Commentaire</label>
        <textarea className="input w-full mt-2" rows={4} defaultValue={equipment?.comment || ''}></textarea>
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={addPhoto}>Ajouter photo</button>
        <button className="btn-ghost" onClick={()=>window.location.href=`/audit-mobile/${aid}/space/${equipment?.spaceId || ''}`}>Voir espace</button>
      </div>
    </div>
  );
}
