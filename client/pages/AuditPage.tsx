import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Audit, Site, Building, Risk, Equipment, Attachment, ActionItem, Space, ActivityLog } from "@shared/api";
import KpiCard from "../components/KpiCard";
import RiskTable from "../components/RiskTable";
import EquipmentTable from "../components/EquipmentTable";
import Gallery from "../components/Gallery";
import ActionList from "../components/ActionList";
import RiskForm from "../components/RiskForm";
import EquipmentForm from "../components/EquipmentForm";
import ActionForm from "../components/ActionForm";
import ConfirmModal from "../components/ConfirmModal";

export default function AuditPage() {
  const { id } = useParams();
  const auditId = id || "";

  const [audit, setAudit] = useState<Audit | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [riskFormOpen, setRiskFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [equipFormOpen, setEquipFormOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const audits = await builder.fetchAudits();
      const a = audits.find((x) => x.id === auditId) || null;
      setAudit(a);
      if (!a) return;
      const sites = await builder.fetchSites();
      const s = sites.find((st) => st.id === a.siteId) || null;
      setSite(s);
      const buildings = await builder.fetchBuildings();
      const b = buildings.find((bb) => bb.id === a.buildingId) || null;
      setBuilding(b);
      const allSpaces = await builder.fetchSpaces();
      const bSpaces = allSpaces.filter((sp) => sp.buildingId === (b?.id || ""));
      setSpaces(bSpaces);
      const allEquip = await builder.fetchEquipments();
      const equip = allEquip.filter((eq) => bSpaces.some((sp) => sp.id === eq.spaceId));
      setEquipments(equip);
      const allRisks = await builder.fetchRisks();
      const auditRisks = allRisks.filter((r) => r.auditId === a.id);
      setRisks(auditRisks);
      const atts = (await builder.fetchAttachments()).filter((at) => at.auditId === a.id);
      setAttachments(atts);
      const acts = await builder.fetchActionsForRisks(auditRisks.map((r) => r.id));
      setActions(acts);

      const logs = await builder.fetchActivityLogsForEntity('audit', a.id);
      setLogs(logs);
    })();
  }, [auditId]);

  const riskCount = risks.length;
  const equipmentCount = equipments.length;
  const actionsCount = actions.length;

  const progressPercent = useMemo(() => {
    // naive progress: based on status + counts
    if (!audit) return 0;
    if (audit.status === "completed") return 100;
    if (audit.status === "in_progress") return Math.min(90, Math.round((riskCount / Math.max(1, riskCount + equipmentCount)) * 100));
    return 10;
  }, [audit, riskCount, equipmentCount]);

  const closeAudit = async () => {
    if (!audit) return;
    await builder.updateAudit(audit.id, { status: "completed", completedAt: new Date().toISOString() } as any);
    const updated = (await builder.fetchAudits()).find((x) => x.id === audit.id) || null;
    setAudit(updated);
  };

  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (editingRisk) {
      const updated = await builder.updateRisk(editingRisk.id, payload);
      if (updated) setRisks((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      const created = await builder.createRisk({ ...payload, auditId, siteId: audit?.siteId, buildingId: audit?.buildingId });
      setRisks((prev) => [created, ...prev]);
    }
    setRiskFormOpen(false);
  };

  const handleDeleteRisk = (id: string) => {
    setToDelete({ type: "risk", id });
    setConfirmOpen(true);
  };

  const handleSaveEquipment = async (payload: Partial<Equipment>) => {
    if (editingEquip) {
      const updated = await builder.updateEquipment(editingEquip.id, payload);
      if (updated) setEquipments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const created = await builder.createEquipment({ ...payload });
      setEquipments((prev) => [created, ...prev]);
    }
    setEquipFormOpen(false);
  };

  const handleDeleteEquipment = (id: string) => {
    setToDelete({ type: "equipment", id });
    setConfirmOpen(true);
  };

  const handleSaveAction = async (payload: Partial<ActionItem>) => {
    if (editingAction) {
      const updated = await builder.updateAction(editingAction.id, payload);
      if (updated) setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await builder.createAction(payload);
      setActions((prev) => [created, ...prev]);
    }
    setActionFormOpen(false);
  };

  const handleDeleteAction = (id: string) => {
    setToDelete({ type: "action", id });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);
    const { type, id } = toDelete;
    if (type === "risk") {
      await builder.deleteRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      setActions((prev) => prev.filter((a) => a.riskId !== id));
    } else if (type === "equipment") {
      await builder.deleteEquipment(id);
      setEquipments((prev) => prev.filter((e) => e.id !== id));
    } else if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    }
    setToDelete(null);
    setConfirmOpen(false);
  };

  const uploadPhoto = async () => {
    if (!audit) return;
    const created = await builder.createAttachment({ fileUrl: "/placeholder.svg", fileType: "image/svg", auditId: audit.id, uploadedBy: "u_local" });
    setAttachments((prev) => [created, ...prev]);
  };

  const deleteAttachment = async (id: string) => {
    await builder.deleteAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  if (!audit) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Audit introuvable</h1>
          <p className="text-sm text-muted mt-2">L'audit demandé est introuvable.</p>
        </div>
      </Layout>
    );
  }

  const statusBadge = (s: Audit["status"]) => {
    switch (s) {
      case "draft":
        return <span className="px-2 py-1 rounded bg-gray-200 text-sm">Brouillon</span>;
      case "in_progress":
        return <span className="px-2 py-1 rounded bg-blue-600 text-white text-sm">En cours</span>;
      case "completed":
        return <span className="px-2 py-1 rounded bg-green-600 text-white text-sm">Terminé</span>;
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{audit.title}</h1>
          <div className="text-sm text-muted mt-1">{site ? <Link to={`/site/${site.id}`} className="underline">{site.name}</Link> : ""} {building ? `• ${building.name}` : ""}</div>
          <div className="mt-2 text-sm text-muted">Date prévue: {audit.scheduledAt || "-"} • Auditeur: {audit.auditorId || "-"}</div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(audit.status)}
          <button onClick={() => alert('Modifier audit (mock)')} className="px-3 py-2 rounded-md border border-border">Modifier</button>
          <button onClick={() => { if(!confirm('Supprimer cet audit ?')) return; alert('Suppression (mock)'); }} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer</button>
          {audit.status !== "completed" && <button onClick={closeAudit} className="brand-btn">Clôturer l'audit</button>}
        </div>
      </div>

      <section className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-muted/30 rounded overflow-hidden">
              <div style={{ width: `${progressPercent}%` }} className="h-4 bg-primary"></div>
            </div>
            <div className="text-sm text-muted mt-2">{riskCount} risques identifiés • {equipmentCount} équipements concernés • {actionsCount} actions</div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-96">
            <KpiCard title="Risques" value={riskCount} icon={<span>⚠️</span>} />
            <KpiCard title="Équipements" value={equipmentCount} icon={<span>🔧</span>} />
            <KpiCard title="Actions" value={actionsCount} icon={<span>📋</span>} />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Risques liés à l'audit</h2>
        <div className="mb-3 flex justify-end">
          <button onClick={() => { setEditingRisk(null); setRiskFormOpen(true); }} className="brand-btn">Ajouter un risque</button>
        </div>
        <RiskTable items={risks} onEdit={(r)=>{ setEditingRisk(r); setRiskFormOpen(true); }} onDelete={(id)=>handleDeleteRisk(id)} onCreateAction={(riskId)=>{ setEditingAction(null); setActionFormOpen(true); }} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Équipements concernés</h2>
        <EquipmentTable items={equipments} onEdit={(e)=>{ setEditingEquip(e); setEquipFormOpen(true); }} onDelete={(id)=>handleDeleteEquipment(id)} onAdd={()=>{ setEditingEquip(null); setEquipFormOpen(true); }} />
      </section>

      <section className="mb-6">
        <Gallery items={attachments} onDelete={deleteAttachment} onUpload={uploadPhoto} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Timeline de l'audit</h2>
        <div className="card p-4">
          {logs.length === 0 ? (
            <div className="text-center py-6">Aucun événement enregistré pour cet audit.</div>
          ) : (
            <div>{React.createElement(require('../components/Timeline').default, { items: logs })}</div>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Plan d'actions</h2>
        <div className="mb-3 flex justify-end">
          <button onClick={()=>{ setEditingAction(null); setActionFormOpen(true); }} className="brand-btn">Ajouter une action</button>
        </div>
        <ActionList items={actions} onEdit={(a)=>{ setEditingAction(a); setActionFormOpen(true); }} onDelete={(id)=>handleDeleteAction(id)} onToggleStatus={(id)=>{ /* toggle */ builder.updateAction(id, { status: 'EN_COURS' } as any).then(()=> setActions(prev=>prev.map(p=>p.id===id?{...p,status:'EN_COURS'}:p))); }} />
      </section>

      <section className="mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold">Synthèse & Export</h3>
          <div className="mt-2 text-sm text-muted">
            <div>⚠️ {risks.filter(r=>r.level==='CRITIQUE').length} risques critiques détectés</div>
            <div>🔧 {equipments.filter(e=>e.state==='NON_CONFORME').length} équipements non conformes</div>
            <div>📝 {actions.filter(a=>a.status==='OUVERTE').length} actions ouvertes</div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => { /* export summary CSV */ const rows = [["audit",audit.title],["risques_critique",risks.filter(r=>r.level==='CRITIQUE').length]]; const csv = rows.map(r=>r.join(",")).join("\n"); const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='audit_summary.csv'; a.click(); URL.revokeObjectURL(url); }} className="px-3 py-2 rounded-md border border-border">Exporter Excel</button>
            <button onClick={()=>alert('Synthèse IA (mock)')} className="px-3 py-2 rounded-md border border-border">Synthèse IA</button>
          </div>
        </div>
      </section>

      <div className="flex gap-2">
        <Link to={site?`/site/${site.id}`:`/`} className="px-3 py-2 rounded-md border border-border">Retour au site</Link>
        {building && <Link to={`/building/${building.id}`} className="px-3 py-2 rounded-md border border-border">Accéder au bâtiment</Link>}
      </div>

      <RiskForm initial={editingRisk} open={riskFormOpen} onClose={()=>setRiskFormOpen(false)} onSave={handleSaveRisk} />
      <EquipmentForm initial={editingEquip} open={equipFormOpen} onClose={()=>setEquipFormOpen(false)} onSave={handleSaveEquipment} />
      <ActionForm initial={editingAction} open={actionFormOpen} onClose={()=>setActionFormOpen(false)} onSave={handleSaveAction} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer cet élément ?" onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDeletion} />
    </Layout>
  );
}
