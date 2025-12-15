import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { ActionItem, Risk, Space, Building, Attachment, ActivityLog } from "@shared/api";
import ActionForm from "../components/ActionForm";
import Gallery from "../components/Gallery";
import ConfirmModal from "../components/ConfirmModal";

export default function ActionPage() {
  const { id } = useParams();
  const actionId = id || "";

  const [action, setAction] = useState<ActionItem | null>(null);
  const [risk, setRisk] = useState<Risk | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: "attachment" | "action"; id: string } | null>(null);

  useEffect(() => {
    (async () => {
      const acts = await builder.fetchActions();
      const a = acts.find((x) => x.id === actionId) || null;
      setAction(a);
      if (!a) return;
      if (a.riskId) {
        const risks = await builder.fetchRisks();
        const r = risks.find((x) => x.id === a.riskId) || null;
        setRisk(r);
        if (r && r.spaceId) {
          const spaces = await builder.fetchSpaces();
          const sp = spaces.find((s) => s.id === r.spaceId) || null;
          setSpace(sp);
          if (sp) {
            const buildings = await builder.fetchBuildings();
            const b = buildings.find((bb) => bb.id === sp.buildingId) || null;
            setBuilding(b);
          }
        }
      }

      // attachments possibly linked by actionId, riskId or auditId
      const atts = (await builder.fetchAttachments()).filter((att) => att.auditId === a.riskId || att.riskId === a.riskId || (att.uploadedBy && att.uploadedBy === a.id) || (att as any).actionId === a.id);
      setAttachments(atts);

      // fetch activity logs for this action
      const logs = await builder.fetchActivityLogsForEntity('action', a.id);
      setLogs(logs);
    })();
  }, [actionId]);


  const statusBadge = (s?: ActionItem["status"]) => {
    switch (s) {
      case "OUVERTE":
        return <span className="px-2 py-1 rounded bg-red-600 text-white">OUVERTE</span>;
      case "EN_COURS":
        return <span className="px-2 py-1 rounded bg-orange-400">EN_COURS</span>;
      case "CLOTUREE":
        return <span className="px-2 py-1 rounded bg-green-600 text-white">CLOTUREE</span>;
      default:
        return <span className="px-2 py-1 rounded bg-gray-200">N/A</span>;
    }
  };

  const handleSave = async (payload: Partial<ActionItem>) => {
    if (!action) return;
    const updated = await builder.updateAction(action.id, payload);
    if (updated) setAction(updated);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!action) return;
    await builder.deleteAction(action.id);
    // redirect back to risk or audit
    if (risk && (risk.auditId)) window.location.href = `/audit/${risk.auditId}`;
    else if (risk && risk.spaceId) window.location.href = `/space/${risk.spaceId}`;
    else window.location.href = "/";
  };

  const handleToggleStatus = async (newStatus: ActionItem["status"]) => {
    if (!action) return;
    const updated = await builder.updateAction(action.id, { status: newStatus });
    if (updated) setAction(updated);
  };

  const handleUpload = async () => {
    if (!action) return;
    const created = await builder.createAttachment({ fileUrl: "/placeholder.svg", fileType: "image/svg", uploadedBy: "u_local" });
    setAttachments((prev) => [created, ...prev]);
  };

  const handleDeleteAttachment = (id: string) => {
    setToDelete({ type: "attachment", id });
    setConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);
    const { type, id } = toDelete;
    if (type === "attachment") {
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } else if (type === "action") {
      await handleDelete();
    }
    setToDelete(null);
    setConfirmOpen(false);
  };

  if (!action) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Action introuvable</h1>
          <p className="text-sm text-muted mt-2">L'action demandée est introuvable.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{action.title}</h1>
          <div className="text-sm text-muted mt-1">Risque: {risk ? <Link to={`/risk/${risk.id}`} className="underline">{risk.title}</Link> : '-'} • Espace: {space ? <Link to={`/space/${space.id}`} className="underline">{space.name}</Link> : '-'}</div>
          <div className="text-sm text-muted mt-1">Responsable: {action.ownerId || '-' } • Échéance: {action.dueDate || '-'}</div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(action.status)}
          <button onClick={() => setEditOpen(true)} className="px-3 py-2 rounded-md border border-border">Modifier</button>
          <button onClick={() => { setToDelete({ type: 'action', id: action.id }); setConfirmOpen(true); }} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer</button>
          <div className="flex items-center gap-2">
            <button onClick={() => handleToggleStatus('EN_COURS')} className="px-3 py-2 rounded-md border border-border">Marquer en cours</button>
            <button onClick={() => handleToggleStatus('CLOTUREE')} className="px-3 py-2 rounded-md brand-btn">Clôturer</button>
          </div>
        </div>
      </div>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Description</h3>
        <div className="card">
          <div className="text-sm">{action.description || '—'}</div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <h4 className="font-semibold">Détails de suivi</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted">Responsable</div>
              <div className="font-medium">{action.ownerId || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Échéance</div>
              <div className="font-medium">{action.dueDate || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Statut</div>
              <div className="font-medium">{action.status}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="font-semibold">Risque d'origine</h4>
          <div className="mt-2">
            {risk ? (
              <div>
                <div className="font-medium">{risk.title}</div>
                <div className="text-sm text-muted">Niveau: {risk.level}</div>
                <div className="text-sm mt-2">{risk.description}</div>
                <div className="mt-2"><Link to={`/risk/${risk.id}`} className="px-3 py-2 rounded-md border border-border">Voir risque complet</Link></div>
              </div>
            ) : (
              <div className="text-sm text-muted">—</div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Photos & Pièces jointes</h3>
        <Gallery items={attachments} onDelete={(id)=>handleDeleteAttachment(id)} onUpload={handleUpload} />
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Historique</h3>
        <div className="card p-4">
          {/* Timeline component */}
          {/* import Timeline dynamically to avoid circular issues */}
          {logs.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--text)', fontWeight: 600 }}>Aucun événement enregistré pour cette action.</div>
          ) : (
            <div>
              {/* render timeline */}
              {/* Timeline component */}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              {React.createElement(require('../components/Timeline').default, { items: logs })}
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-2">
        {risk && <Link to={`/risk/${risk.id}`} className="px-3 py-2 rounded-md border border-border">Retour au risque</Link>}
        {space && <Link to={`/space/${space.id}`} className="px-3 py-2 rounded-md border border-border">Voir espace</Link>}
        {building && <Link to={`/building/${building.id}`} className="px-3 py-2 rounded-md border border-border">Voir bâtiment</Link>}
        {risk && risk.auditId && <Link to={`/audit/${risk.auditId}`} className="px-3 py-2 rounded-md border border-border">Retour audit</Link>}
      </div>

      <ActionForm initial={action} open={editOpen} onClose={()=>setEditOpen(false)} onSave={handleSave} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer cet élément ?" onCancel={()=>setConfirmOpen(false)} onConfirm={confirmDeletion} />
    </Layout>
  );
}
