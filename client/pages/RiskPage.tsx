import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Risk, Space, Building, Equipment, Attachment, ActionItem, Audit, Site, ActivityLog } from "@shared/api";
import RiskForm from "../components/RiskForm";
import ActionList from "../components/ActionList";
import ActionForm from "../components/ActionForm";
import Gallery from "../components/Gallery";
import ConfirmModal from "../components/ConfirmModal";

export default function RiskPage() {
  const { id } = useParams();
  const riskId = id || "";

  const [risk, setRisk] = useState<Risk | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [site, setSite] = useState<Site | null>(null);

  const [actions, setActions] = useState<ActionItem[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: "risk" | "attachment" | "action"; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const allRisks = await builder.fetchRisks();
      const r = allRisks.find((x) => x.id === riskId) || null;
      setRisk(r);
      if (!r) return;
      if (r.spaceId) {
        const spaces = await builder.fetchSpaces();
        const sp = spaces.find((s) => s.id === r.spaceId) || null;
        setSpace(sp);
        if (sp) {
          const buildings = await builder.fetchBuildings();
          const b = buildings.find((bb) => bb.id === sp.buildingId) || null;
          setBuilding(b);
          if (b) {
            const sites = await builder.fetchSites();
            const s = sites.find((ss) => ss.id === b.siteId) || null;
            setSite(s);
          }
        }
      }
      if (r.equipmentId) {
        const equips = await builder.fetchEquipments();
        const eq = equips.find((e) => e.id === r.equipmentId) || null;
        setEquipment(eq);
      }
      if (r.auditId) {
        const audits = await builder.fetchAudits();
        const a = audits.find((at) => at.id === r.auditId) || null;
        setAudit(a);
      }

      const acts = await builder.fetchActionsForRisks([riskId]);
      setActions(acts);
      const atts = (await builder.fetchAttachments()).filter((a) => a.auditId === r.auditId || a.riskId === r.id || a.equipmentId === r.equipmentId);
      setAttachments(atts);

      const logs = await builder.fetchActivityLogsForEntity('risk', r.id);
      setLogs(logs);
    })();
  }, [riskId]);

  const levelBadge = (l?: Risk["level"]) => {
    switch (l) {
      case "CRITIQUE":
        return <span className="px-2 py-1 rounded bg-red-600 text-white">CRITIQUE</span>;
      case "IMPORTANT":
        return <span className="px-2 py-1 rounded bg-orange-400">IMPORTANT</span>;
      case "MOYEN":
        return <span className="px-2 py-1 rounded bg-yellow-300">MOYEN</span>;
      case "FAIBLE":
        return <span className="px-2 py-1 rounded bg-green-600 text-white">FAIBLE</span>;
      default:
        return <span className="px-2 py-1 rounded bg-gray-200">N/A</span>;
    }
  };

  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (!risk) return;
    const updated = await builder.updateRisk(risk.id, payload);
    if (updated) setRisk(updated);
    setEditOpen(false);
  };

  const handleDeleteRisk = async () => {
    if (!risk) return;
    await builder.deleteRisk(risk.id);
    // redirect back to audit or site
    if (risk.auditId) window.location.href = `/audit/${risk.auditId}`;
    else if (risk.siteId) window.location.href = `/site/${risk.siteId}`;
    else window.location.href = "/";
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
    if (!risk) return;
    const created = await builder.createAttachment({ fileUrl: "/placeholder.svg", fileType: "image/svg", riskId: risk.id, uploadedBy: "u_local" });
    setAttachments((prev) => [created, ...prev]);
  };

  const handleDeleteAttachment = (id: string) => {
    setToDelete({ type: "attachment", id });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);
    const { type, id } = toDelete;
    if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    } else if (type === "attachment") {
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } else if (type === "risk") {
      await handleDeleteRisk();
    }
    setToDelete(null);
    setConfirmOpen(false);
  };

  const historyEvents = useMemo(() => {
    const ev: { date: string; text: string }[] = [];
    if (risk) ev.push({ date: new Date().toISOString(), text: `Risque chargé: ${risk.title}` });
    attachments.forEach((a) => ev.push({ date: a.uploadedAt || new Date().toISOString(), text: `Photo ajoutée (${a.fileType}) par ${a.uploadedBy}` }));
    actions.forEach((ac) => ev.push({ date: ac.dueDate || new Date().toISOString(), text: `Action : ${ac.title} (${ac.status})` }));
    return ev.sort((a, b) => b.date.localeCompare(a.date));
  }, [risk, attachments, actions]);

  if (!risk) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Risque introuvable</h1>
          <p className="text-sm text-muted mt-2">Le risque demandé est introuvable.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{risk.title}</h1>
          <div className="text-sm text-muted mt-1">{space ? <Link to={`/space/${space.id}`} className="underline">{space.name}</Link> : ""} {building ? `• ${building.name}` : ""} {equipment ? `• ${equipment.name}` : ""}</div>
        </div>
        <div className="flex items-center gap-3">
          {levelBadge(risk.level)}
          <button onClick={() => setEditOpen(true)} className="px-3 py-2 rounded-md border border-border">Modifier</button>
          <button onClick={() => { setToDelete({ type: "risk", id: risk.id }); setConfirmOpen(true); }} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer</button>
          <button onClick={() => handleAddAction(risk.id)} className="brand-btn">Créer action corrective</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h4 className="font-semibold">Niveau</h4>
          <div className="mt-2">{levelBadge(risk.level)}</div>
          <p className="text-sm text-muted mt-2">{risk.level === 'CRITIQUE' ? 'Niveau critique : nécessite une action immédiate' : risk.level === 'IMPORTANT' ? 'Niveau important : action recommandée' : risk.level === 'MOYEN' ? 'Niveau moyen' : 'Niveau faible'}</p>
        </div>
        <div className="card">
          <h4 className="font-semibold">Probabilité</h4>
          <div className="mt-2 text-2xl font-bold">{risk.probability}</div>
          <p className="text-sm text-muted mt-2">{risk.probability <= 2 ? 'Peu probable' : risk.probability === 3 ? 'Possible' : 'Probable'}</p>
        </div>
        <div className="card">
          <h4 className="font-semibold">Impact</h4>
          <div className="mt-2 text-2xl font-bold">{risk.impact}</div>
          <p className="text-sm text-muted mt-2">{risk.impact <= 2 ? 'Impact faible' : risk.impact === 3 ? 'Impact moyen' : 'Impact élevé'}</p>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Description complète</h3>
        <div className="card">
          <div className="text-sm text-muted">{risk.description || '—'}</div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Préconisation / Recommandation</h3>
        <div className="card">
          <div className="text-sm">{risk.recommendation || '—'}</div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Origine</h3>
        <div className="card">
          <div className="text-sm">
            <div>Site: {site ? <Link to={`/site/${site.id}`} className="underline">{site.name}</Link> : '—'}</div>
            <div>Bâtiment: {building ? <Link to={`/building/${building.id}`} className="underline">{building.name}</Link> : '—'}</div>
            <div>Espace: {space ? <Link to={`/space/${space.id}`} className="underline">{space.name}</Link> : '—'}</div>
            <div>Équipement: {equipment ? <Link to={`/equipment/${equipment.id}`} className="underline">{equipment.name}</Link> : '—'}</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Actions correctives</h3>
        <div className="mb-3 flex justify-end">
          <button onClick={()=>{ setEditingAction(null); setActionFormOpen(true); }} className="brand-btn">Ajouter une action</button>
        </div>
        <ActionList items={actions} onEdit={(a)=>{ setEditingAction(a); setActionFormOpen(true); }} onDelete={(id)=>handleDeleteAction(id)} onToggleStatus={(id)=>{ builder.updateAction(id,{ status: 'EN_COURS' } as any).then(()=> setActions(prev=>prev.map(p=>p.id===id?{...p,status:'EN_COURS'}:p))); }} />
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Photos & Pièces jointes</h3>
        <Gallery items={attachments} onDelete={(id)=>handleDeleteAttachment(id)} onUpload={handleUpload} />
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Historique</h3>
        {historyEvents.length === 0 ? (
          <div className="card text-center py-8">Aucun événement enregistré pour ce risque.</div>
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
        {risk.auditId && <Link to={`/audit/${risk.auditId}`} className="px-3 py-2 rounded-md border border-border">Retour audit</Link>}
        {space && <Link to={`/space/${space.id}`} className="px-3 py-2 rounded-md border border-border">Voir espace</Link>}
        {building && <Link to={`/building/${building.id}`} className="px-3 py-2 rounded-md border border-border">Voir bâtiment</Link>}
        {equipment && <Link to={`/equipment/${equipment.id}`} className="px-3 py-2 rounded-md border border-border">Voir équipement</Link>}
      </div>

      <RiskForm initial={risk} open={editOpen} onClose={()=>setEditOpen(false)} onSave={handleSaveRisk} />
      <ActionForm initial={editingAction} open={actionFormOpen} onClose={()=>setActionFormOpen(false)} onSave={handleSaveAction} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer cet élément ?" onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDeletion} />
    </Layout>
  );
}
