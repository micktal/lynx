import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Equipment, Space, Building, Risk, Attachment, ActionItem, ActivityLog } from "@shared/api";
import EquipmentForm from "../components/EquipmentForm";
import RiskTable from "../components/RiskTable";
import ActionList from "../components/ActionList";
import Gallery from "../components/Gallery";
import ActionForm from "../components/ActionForm";
import ConfirmModal from "../components/ConfirmModal";

export default function EquipmentPage() {
  const { id } = useParams();
  const equipId = id || "";

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [riskFormOpen, setRiskFormOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: "risk" | "attachment" | "action"; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const allEquip = await builder.fetchEquipments();
      const eq = allEquip.find((e) => e.id === equipId) || null;
      setEquipment(eq);
      if (!eq) return;
      const allSpaces = await builder.fetchSpaces();
      const sp = allSpaces.find((s) => s.id === eq.spaceId) || null;
      setSpace(sp);
      const allBuildings = await builder.fetchBuildings();
      const b = sp ? allBuildings.find((bb) => bb.id === sp.buildingId) || null : null;
      setBuilding(b);
      const allRisks = await builder.fetchRisks();
      const myRisks = allRisks.filter((r) => r.equipmentId === eq.id);
      setRisks(myRisks);
      const atts = (await builder.fetchAttachments()).filter((a) => a.equipmentId === eq.id);
      setAttachments(atts);
      const acts = await builder.fetchActionsForRisks(myRisks.map((r) => r.id));
      setActions(acts);

      const logs = await builder.fetchActivityLogsForEntity('equipment', eq.id);
      setLogs(logs);
    })();
  }, [equipId]);


  const handleSaveEquipment = async (payload: Partial<Equipment>) => {
    if (!equipment) return;
    const updated = await builder.updateEquipment(equipment.id, payload);
    if (updated) setEquipment(updated);
    setEditOpen(false);
  };

  const handleQuickState = async (state: Equipment["state"]) => {
    if (!equipment) return;
    const updated = await builder.updateEquipment(equipment.id, { state });
    if (updated) setEquipment(updated);
  };

  const handleAddRisk = () => {
    setRiskFormOpen(true);
  };

  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (!equipment) return;
    const created = await builder.createRisk({ ...payload, equipmentId: equipment.id, spaceId: equipment.spaceId });
    // ensure site/building linkage
    const sp = (await builder.fetchSpaces()).find((s) => s.id === equipment.spaceId);
    if (sp) created.buildingId = sp.buildingId;
    setRisks((prev) => [created, ...prev]);
    setRiskFormOpen(false);
    const acts = await builder.fetchActionsForRisks([created.id]);
    setActions((prev) => [...acts, ...prev]);
  };

  const handleDeleteRisk = (id: string) => {
    setToDelete({ type: "risk", id });
    setConfirmOpen(true);
  };

  const handleAddAction = (riskId?: string) => {
    setEditingAction(null);
    setActionFormOpen(true);
  };

  const handleSaveAction = async (payload: Partial<ActionItem>) => {
    const created = await builder.createAction(payload);
    setActions((prev) => [created, ...prev]);
    setActionFormOpen(false);
  };

  const handleDeleteAction = (id: string) => {
    setToDelete({ type: "action", id });
    setConfirmOpen(true);
  };

  const handleUpload = async () => {
    if (!equipment) return;
    const created = await builder.createAttachment({ fileUrl: "/placeholder.svg", fileType: "image/svg", equipmentId: equipment.id, uploadedBy: "u_local" });
    setAttachments((prev) => [created, ...prev]);
  };

  const handleDeleteAttachment = (id: string) => {
    setToDelete({ type: "attachment", id });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);
    const { type, id } = toDelete;
    if (type === "risk") {
      await builder.deleteRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      setActions((prev) => prev.filter((a) => a.riskId !== id));
    } else if (type === "attachment") {
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } else if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    }
    setToDelete(null);
    setConfirmOpen(false);
  };

  const historyEvents = useMemo(() => {
    const ev: { date: string; text: string }[] = [];
    if (equipment?.comment) ev.push({ date: new Date().toISOString(), text: `Commentaire : ${equipment.comment}` });
    attachments.forEach((a) => ev.push({ date: a.uploadedAt || new Date().toISOString(), text: `Photo ajoutée (${a.fileType}) par ${a.uploadedBy}` }));
    actions.forEach((ac) => ev.push({ date: ac.dueDate || new Date().toISOString(), text: `Action : ${ac.title} (${ac.status})` }));
    return ev.sort((a, b) => b.date.localeCompare(a.date));
  }, [equipment, attachments, actions]);

  if (!equipment) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Équipement introuvable</h1>
          <p className="text-sm text-muted mt-2">L'équipement demandé est introuvable.</p>
        </div>
      </Layout>
    );
  }

  const stateBadge = (s: Equipment["state"]) => {
    switch (s) {
      case "OK":
        return <span className="px-2 py-1 rounded bg-green-600 text-white">OK</span>;
      case "A_CONTROLER":
        return <span className="px-2 py-1 rounded bg-yellow-300 text-black">À contrôler</span>;
      case "NON_CONFORME":
        return <span className="px-2 py-1 rounded bg-red-600 text-white">Non conforme</span>;
      case "OBSOLETE":
        return <span className="px-2 py-1 rounded bg-orange-400 text-black">Obsolète</span>;
      case "ABSENT":
        return <span className="px-2 py-1 rounded bg-gray-200 text-black">Absent</span>;
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
          <div className="text-sm text-muted mt-1">{equipment.category} • Réf: {equipment.reference}</div>
          <div className="mt-2">{stateBadge(equipment.state)}</div>
          <div className="mt-2 text-sm text-muted">Retour à l'espace: {space ? <Link to={`/space/${space.id}`} className="underline">{space.name}</Link> : "-"}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditOpen(true)} className="px-3 py-2 rounded-md border border-border">Modifier</button>
          <button onClick={() => { if(!confirm('Supprimer équipement ?')) return; builder.deleteEquipment(equipment.id).then(()=> window.history.back()); }} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer</button>
          <div className="relative">
            <select onChange={(e)=>handleQuickState(e.target.value as any)} value={equipment.state} className="px-3 py-2 rounded-md border border-border bg-input">
              <option value="OK">OK</option>
              <option value="A_CONTROLER">À contrôler</option>
              <option value="NON_CONFORME">Non conforme</option>
              <option value="OBSOLETE">Obsolète</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card md:col-span-2">
          <h3 className="font-semibold mb-2">Fiche technique</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted">Catégorie</div>
              <div className="font-medium">{equipment.category}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Référence</div>
              <div className="font-medium">{equipment.reference}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Gestion</div>
              <div className="font-medium">{equipment.management || "-"}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Espace</div>
              <div className="font-medium">{space ? <Link to={`/space/${space.id}`} className="underline">{space.name} (étage {space.floor})</Link> : "-"}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted">Commentaire interne</div>
              <div className="mt-1 p-3 bg-muted/10 rounded">{equipment.comment || "-"}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">État rapide</h3>
          <div className="flex flex-col gap-2">
            <button onClick={()=>handleQuickState('OK')} className="px-3 py-2 rounded-md bg-green-600 text-white">Passer en OK</button>
            <button onClick={()=>handleQuickState('A_CONTROLER')} className="px-3 py-2 rounded-md bg-yellow-300">Déclarer à contrôler</button>
            <button onClick={()=>handleQuickState('NON_CONFORME')} className="px-3 py-2 rounded-md bg-red-600 text-white">Déclarer non conforme</button>
            <button onClick={()=>handleQuickState('OBSOLETE')} className="px-3 py-2 rounded-md bg-orange-400">Déclarer obsolète</button>
            <button onClick={()=>handleQuickState('ABSENT')} className="px-3 py-2 rounded-md bg-gray-200">Déclarer absent</button>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Risques associés</h3>
        {risks.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-sm text-muted">Aucun risque n'a été associé à cet équipement.</div>
            <div className="mt-3">
              <button onClick={handleAddRisk} className="brand-btn">Ajouter un risque</button>
            </div>
          </div>
        ) : (
          <RiskTable items={risks} onEdit={(r)=>{ setEditingAction(null); setRiskFormOpen(true); }} onDelete={(id)=>handleDeleteRisk(id)} onCreateAction={(riskId)=>{ setEditingAction(null); setActionFormOpen(true); }} />
        )}
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Actions correctives</h3>
        <div className="mb-3 flex justify-end">
          <button onClick={()=>{ setEditingAction(null); setActionFormOpen(true); }} className="brand-btn">Ajouter une action</button>
        </div>
        <ActionList items={actions} onEdit={(a)=>{ setEditingAction(a); setActionFormOpen(true); }} onDelete={(id)=>handleDeleteAction(id)} onToggleStatus={(id)=>{ builder.updateAction(id,{ status: 'EN_COURS' } as any).then(()=> setActions(prev=>prev.map(p=>p.id===id?{...p,status:'EN_COURS'}:p))); }} />
      </section>

      <section className="mb-6">
        <Gallery items={attachments} onDelete={handleDeleteAttachment} onUpload={handleUpload} />
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Historique</h3>
        {historyEvents.length === 0 ? (
          <div className="card text-center py-8">Aucun événement historique pour cet équipement.</div>
        ) : (
          <div className="card">
            <ul className="space-y-2">
              {historyEvents.map((h, idx) => (
                <li key={idx} className="text-sm"><span className="text-muted">{new Date(h.date).toLocaleString()} — </span>{h.text}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="flex gap-2">
        <Link to={space?`/space/${space.id}`:`/`} className="px-3 py-2 rounded-md border border-border">Retour à l'espace</Link>
        {building && <Link to={`/building/${building.id}`} className="px-3 py-2 rounded-md border border-border">Voir bâtiment</Link>}
        {space && <Link to={`/site/${space.buildingId}`} className="px-3 py-2 rounded-md border border-border">Voir site</Link>}
      </div>

      <EquipmentForm initial={equipment} open={editOpen} onClose={()=>setEditOpen(false)} onSave={handleSaveEquipment} />
      <ActionForm initial={editingAction} open={actionFormOpen} onClose={()=>setActionFormOpen(false)} onSave={handleSaveAction} />
      <RiskForm initial={null} open={riskFormOpen} onClose={()=>setRiskFormOpen(false)} onSave={handleSaveRisk} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer cet élément ?" onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDeletion} />
    </Layout>
  );
}
