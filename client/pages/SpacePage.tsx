import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Space, Building, Equipment, Risk, Attachment, ActionItem, ActivityLog } from "@shared/api";
import KpiCard from "../components/KpiCard";
import EquipmentTable from "../components/EquipmentTable";
import RiskTable from "../components/RiskTable";
import Gallery from "../components/Gallery";
import ActionList from "../components/ActionList";
import EquipmentForm from "../components/EquipmentForm";
import RiskForm from "../components/RiskForm";
import ActionForm from "../components/ActionForm";
import ConfirmModal from "../components/ConfirmModal";

export default function SpacePage() {
  const { id } = useParams();
  const spaceId = id || "";
  const [space, setSpace] = useState<Space | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [stats, setStats] = useState({ equipments: 0, risks: 0, actionsOpen: 0 });

  // forms state
  const [equipFormOpen, setEquipFormOpen] = useState(false);
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [riskFormOpen, setRiskFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: "equip" | "risk" | "action"; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const spaces = await builder.fetchSpaces();
      const sp = spaces.find((s) => s.id === spaceId) || null;
      setSpace(sp);
      if (sp) {
        const buildings = await builder.fetchBuildings();
        const b = buildings.find((bb) => bb.id === sp.buildingId) || null;
        setBuilding(b);
        const eq = await builder.fetchEquipmentsForSpace(spaceId);
        setEquipments(eq);
        const rk = await builder.fetchRisksForSpace(spaceId);
        setRisks(rk);
        const at = await builder.fetchAttachmentsForSpace(spaceId);
        setAttachments(at);
        const actionsForRisks = await builder.fetchActionsForRisks(rk.map((r) => r.id));
        setActions(actionsForRisks);
        const c = await builder.countStatsForSpace(spaceId);
        setStats(c.total);
      }
    })();
  }, [spaceId]);

  const handleAddEquipment = () => {
    setEditingEquip(null);
    setEquipFormOpen(true);
  };

  const handleSaveEquipment = async (payload: Partial<Equipment>) => {
    if (editingEquip) {
      const updated = await builder.updateEquipment(editingEquip.id, payload);
      if (updated) setEquipments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await builder.createEquipment({ ...payload, spaceId });
      setEquipments((prev) => [created, ...prev]);
    }
    const c = await builder.countStatsForSpace(spaceId);
    setStats(c.total);
    setEquipFormOpen(false);
  };

  const handleDeleteEquipment = async (id: string) => {
    setToDelete({ type: "equip", id });
    setConfirmOpen(true);
  };

  const handleAddRisk = () => {
    setEditingRisk(null);
    setRiskFormOpen(true);
  };

  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (editingRisk) {
      const updated = await builder.updateRisk(editingRisk.id, payload);
      if (updated) setRisks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await builder.createRisk({ ...payload, spaceId, buildingId: space?.buildingId, siteId: undefined });
      // ensure siteId filled
      const sp = space;
      if (sp) created.siteId = (await builder.fetchBuildings()).find((b) => b.id === sp.buildingId)?.siteId;
      setRisks((prev) => [created, ...prev]);
    }
    const c = await builder.countStatsForSpace(spaceId);
    setStats(c.total);
    setRiskFormOpen(false);
  };

  const handleDeleteRisk = async (id: string) => {
    setToDelete({ type: "risk", id });
    setConfirmOpen(true);
  };

  const handleAddAction = (riskId?: string) => {
    setEditingAction(null);
    setActionFormOpen(true);
  };

  const handleSaveAction = async (payload: Partial<ActionItem>) => {
    if (editingAction) {
      const updated = await builder.updateAction(editingAction.id, payload);
      if (updated) setActions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await builder.createAction(payload);
      setActions((prev) => [created, ...prev]);
    }
    const c = await builder.countStatsForSpace(spaceId);
    setStats(c.total);
    setActionFormOpen(false);
  };

  const handleDeleteAction = async (id: string) => {
    setToDelete({ type: "action", id });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);
    const { type, id } = toDelete;
    if (type === "equip") {
      await builder.deleteEquipment(id);
      setEquipments((prev) => prev.filter((p) => p.id !== id));
    } else if (type === "risk") {
      await builder.deleteRisk(id);
      setRisks((prev) => prev.filter((p) => p.id !== id));
      setActions((prev) => prev.filter((a) => a.riskId !== id));
    } else if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((p) => p.id !== id));
    }
    const c = await builder.countStatsForSpace(spaceId);
    setStats(c.total);
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleToggleActionStatus = async (id: string) => {
    const act = actions.find((a) => a.id === id);
    if (!act) return;
    const next = act.status === "OUVERTE" ? "EN_COURS" : act.status === "EN_COURS" ? "CLOTUREE" : "CLOTUREE";
    const updated = await builder.updateAction(id, { status: next });
    if (updated) setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    const c = await builder.countStatsForSpace(spaceId);
    setStats(c.total);
  };

  const uploadPhoto = async () => {
    // mock upload
    const created = await builder.createAttachment({ fileUrl: "/placeholder.svg", fileType: "image/svg", spaceId, uploadedBy: "u_local" });
    setAttachments((prev) => [created, ...prev]);
  };

  const deleteAttachment = async (id: string) => {
    await builder.deleteAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  if (!space) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Espace introuvable</h1>
          <p className="text-sm text-muted mt-2">L'espace demandé est introuvable.</p>
        </div>
      </Layout>
    );
  }

  const importanceBadge = (v?: number) => {
    if (!v) return <span className="px-2 py-1 rounded text-xs bg-gray-200">N/A</span>;
    const color = v <= 2 ? "bg-green-100 text-green-800" : v === 3 ? "bg-yellow-100 text-yellow-800" : v === 4 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800";
    return <span className={`px-2 py-1 rounded text-xs ${color}`}>Importance {v}</span>;
  };

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{space.name}</h1>
          <div className="text-sm text-muted mt-1">Code: {space.code} • Étage: {space.floor}</div>
          <div className="text-sm text-muted mt-1">Bâtiment: {building ? <Link to={`/building/${building.id}`} className="underline">{building.name}</Link> : "-"}</div>
          <div className="mt-2 flex items-center gap-2">{importanceBadge(space.importance)} <div className="text-sm text-muted">Accès: {space.accessLevel}</div></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert('Modifier espace (modal) à implémenter')} className="px-3 py-2 rounded-md border border-border">Modifier l'espace</button>
          <button onClick={() => { if ((equipments.length + risks.length) > 0) { if(!confirm('Supprimer malgré tout ?')) return;} alert('Suppression espace (mock)'); }} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer l'espace</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Équipements" value={stats.equipments} icon={<span>🔧</span>} />
        <KpiCard title="Risques" value={stats.risks} icon={<span>⚠️</span>} />
        <KpiCard title="Actions ouvertes" value={stats.actionsOpen} icon={<span>📋</span>} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Équipements</h2>
        <EquipmentTable
          items={equipments}
          onEdit={(e) => { setEditingEquip(e); setEquipFormOpen(true); }}
          onDelete={(id) => handleDeleteEquipment(id)}
          onAdd={handleAddEquipment}
        />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Risques</h2>
        <RiskTable items={risks} onEdit={(r) => { setEditingRisk(r); setRiskFormOpen(true); }} onDelete={(id) => handleDeleteRisk(id)} onCreateAction={(riskId) => { setEditingAction(null); setActionFormOpen(true); }} />
      </section>

      <section className="mb-6">
        <Gallery items={attachments} onDelete={deleteAttachment} onUpload={uploadPhoto} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Plan d'action</h2>
        <div className="mb-3 flex justify-end">
          <button onClick={() => { setEditingAction(null); setActionFormOpen(true); }} className="brand-btn">Ajouter une action</button>
        </div>
        <ActionList items={actions} onEdit={(a) => { setEditingAction(a); setActionFormOpen(true); }} onDelete={(id) => handleDeleteAction(id)} onToggleStatus={(id) => handleToggleActionStatus(id)} />
      </section>

      <EquipmentForm initial={editingEquip} open={equipFormOpen} onClose={() => setEquipFormOpen(false)} onSave={handleSaveEquipment} />
      <RiskForm initial={editingRisk} open={riskFormOpen} onClose={() => setRiskFormOpen(false)} onSave={handleSaveRisk} />
      <ActionForm initial={editingAction} open={actionFormOpen} onClose={() => setActionFormOpen(false)} onSave={handleSaveAction} />

      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Êtes-vous sûr de vouloir supprimer ?" onCancel={() => setConfirmOpen(false)} onConfirm={confirmDeletion} />
    </Layout>
  );
}
