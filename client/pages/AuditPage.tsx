import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

import * as builder from "../lib/builderService";

import type {
  Audit,
  Site,
  Building,
  Risk,
  Equipment,
  Attachment,
  ActionItem,
  Space,
  ActivityLog,
} from "@shared/api";

import KpiCard from "../components/KpiCard";
import RiskTable from "../components/RiskTable";
import EquipmentTable from "../components/EquipmentTable";
import Gallery from "../components/Gallery";
import ActionList from "../components/ActionList";
import RiskForm from "../components/RiskForm";
import EquipmentForm from "../components/EquipmentForm";
import ActionForm from "../components/ActionForm";
import ConfirmModal from "../components/ConfirmModal";
import PhotoUploader from "../components/PhotoUploader";
import AttachmentsGallery from "../components/AttachmentsGallery";

export default function AuditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const auditId = id || "";

  // -----------------------------------------
  // STATE
  // -----------------------------------------
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

  // -----------------------------------------
  // LOAD EVERYTHING
  // -----------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const audits = await builder.fetchAudits();
        const a = audits.find((x) => x.id === auditId) || null;
        setAudit(a);
        if (!a) return;

        const sites = await builder.fetchSites();
        setSite(sites.find((s) => s.id === a.siteId) || null);

        const buildings = await builder.fetchBuildings();
        const b = buildings.find((bb) => bb.id === a.buildingId) || null;
        setBuilding(b);

        const allSpaces = await builder.fetchSpaces();
        const bSpaces = allSpaces.filter((sp) => sp.buildingId === a.buildingId);
        setSpaces(bSpaces);

        const allEquip = await builder.fetchEquipments();
        setEquipments(allEquip.filter((e) => bSpaces.some((s) => s.id === e.spaceId)));

        const allRisks = await builder.fetchRisks();
        const auditRisks = allRisks.filter((r) => r.auditId === a.id);
        setRisks(auditRisks);

        const atts = (await builder.fetchAttachments()).filter((at) => at.auditId === a.id);
        setAttachments(atts);

        const acts = await builder.fetchActionsForRisks(auditRisks.map((r) => r.id));
        setActions(acts);

        const logs = await builder.fetchActivityLogsForEntity("audit", a.id);
        setLogs(logs);
      } catch (e) {
        console.error("Erreur chargement audit page:", e);
      }
    })();
  }, [auditId]);

  // -----------------------------------------
  // KPIs
  // -----------------------------------------
  const riskCount = risks.length;
  const equipmentCount = equipments.length;
  const actionsCount = actions.length;

  const progressPercent = useMemo(() => {
    if (!audit) return 0;
    if (audit.status === "completed") return 100;
    if (audit.status === "in_progress")
      return Math.min(95, Math.round((riskCount / Math.max(1, riskCount + equipmentCount)) * 100));
    return 10;
  }, [audit, riskCount, equipmentCount]);

  // -----------------------------------------
  // CLOSE AUDIT
  // -----------------------------------------
  const closeAudit = async () => {
    if (!audit) return;
    await builder.updateAudit(audit.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
    } as any);
    const updated = (await builder.fetchAudits()).find((a) => a.id === audit.id) || null;
    setAudit(updated);
  };

  // -----------------------------------------
  // RISK HANDLERS
  // -----------------------------------------
  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (!audit) return;

    if (editingRisk) {
      const updated = await builder.updateRisk(editingRisk.id, payload);
      if (updated) setRisks((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } else {
      const created = await builder.createRisk({
        ...payload,
        auditId,
        siteId: audit.siteId,
        buildingId: audit.buildingId,
      });
      setRisks((prev) => [created, ...prev]);
    }

    setRiskFormOpen(false);
  };

  const handleDeleteRisk = (id: string) => {
    setToDelete({ type: "risk", id });
    setConfirmOpen(true);
  };

  // -----------------------------------------
  // EQUIPMENT HANDLERS
  // -----------------------------------------
  const handleSaveEquipment = async (payload: Partial<Equipment>) => {
    if (editingEquip) {
      const updated = await builder.updateEquipment(editingEquip.id, payload);
      if (updated) setEquipments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } else {
      const created = await builder.createEquipment({
        ...payload,
        auditId,
        siteId: audit?.siteId,
        buildingId: audit?.buildingId,
      });
      setEquipments((prev) => [created, ...prev]);
    }
    setEquipFormOpen(false);
  };

  const handleDeleteEquipment = (id: string) => {
    setToDelete({ type: "equipment", id });
    setConfirmOpen(true);
  };

  // -----------------------------------------
  // ACTION HANDLERS
  // -----------------------------------------
  const handleSaveAction = async (payload: Partial<ActionItem>) => {
    if (editingAction) {
      const updated = await builder.updateAction(editingAction.id, payload);
      if (updated) setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await builder.createAction({
        ...payload,
        auditId,
        siteId: audit?.siteId,
        buildingId: audit?.buildingId,
      });
      setActions((prev) => [created, ...prev]);
    }
    setActionFormOpen(false);
  };

  const handleDeleteAction = (id: string) => {
    setToDelete({ type: "action", id });
    setConfirmOpen(true);
  };

  const toggleAction = async (id: string) => {
    const act = actions.find((a) => a.id === id);
    if (!act) return;

    const next =
      act.status === "OUVERTE"
        ? "EN_COURS"
        : act.status === "EN_COURS"
          ? "CLOTUREE"
          : "CLOTUREE";

    const updated = await builder.updateAction(id, { status: next });
    if (updated) setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  // -----------------------------------------
  // CONFIRM DELETE
  // -----------------------------------------
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

    setConfirmOpen(false);
    setToDelete(null);
  };

  // -----------------------------------------
  // ATTACHMENTS
  // -----------------------------------------
  const uploadPhoto = async () => {
    if (!audit) return;
    const created = await builder.createAttachment({
      fileUrl: "/placeholder.svg",
      fileType: "image/svg",
      auditId: audit.id,
      uploadedBy: "u_local",
    });
    setAttachments((prev) => [created, ...prev]);
  };

  const deleteAttachment = async (id: string) => {
    await builder.deleteAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // -----------------------------------------
  // STATUS BADGE UI
  // -----------------------------------------
  const statusBadge = (s: Audit["status"]) => {
    switch (s) {
      case "draft":
        return <span className="px-2 py-1 rounded bg-gray-300 text-sm">Brouillon</span>;
      case "in_progress":
        return <span className="px-2 py-1 rounded bg-blue-600 text-white text-sm">En cours</span>;
      case "completed":
        return <span className="px-2 py-1 rounded bg-green-600 text-white text-sm">Terminé</span>;
    }
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  if (!audit) {
    return (
      <Layout>
        <div className="card p-6">
          <h1 className="text-2xl font-bold">Audit introuvable</h1>
          <p className="text-sm text-muted mt-2">Cet audit n'existe pas ou a été supprimé.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link to="/audit" className="btn btn-sm mb-2" aria-label="Retour aux audits">← Retour</Link>
          <h1 className="text-2xl font-bold">{audit.title}</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--text)', fontWeight: 600 }}>
            {site && <Link to={`/site/${site.id}`} className="underline" style={{ color: 'var(--text)' }}>{site.name}</Link>}
            {building && <> • {building.name}</>}
          </div>

          <div className="mt-2 text-sm" style={{ color: 'var(--text)', fontWeight: 500 }}>
            Date prévue: {audit.scheduledAt || "-"} • Auditeur: {audit.auditorId || "-"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusBadge(audit.status)}

          <button onClick={() => alert("Modifier audit (TODO)")} className="px-3 py-2 rounded-md border">
            Modifier
          </button>

          <button
            onClick={() => {
              if (confirm("Supprimer cet audit ?")) alert("Suppression (TODO)");
            }}
            className="px-3 py-2 rounded-md border border-red-500 text-red-600"
          >
            Supprimer
          </button>

          {audit.status !== "completed" && (
            <button onClick={closeAudit} className="brand-btn">
              Clôturer l'audit
            </button>
          )}
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <AttachmentsGallery entityType="audit" entityId={auditId} />
            </div>
            <div>
              <PhotoUploader entityType="audit" entityId={Number(auditId)} onUploaded={(att)=>console.log('uploaded',att)} />
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS + KPIS */}
      <section className="mb-6">
        <div>
          {/* PROGRESS BAR */}
          <div className="">
            <div className="h-4 bg-gray-200 rounded overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-4 bg-primary transition-all"
              ></div>
            </div>
            <div className="text-sm mt-2" style={{ color: 'var(--text)', fontWeight: 600 }}>
              {riskCount} risques • {equipmentCount} équipements • {actionsCount} actions
            </div>
          </div>

          {/* KPI CARDS - placed below the progress bar to avoid overflow on the right */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <KpiCard title="Risques" value={riskCount} icon={<span>⚠️</span>} />
            <KpiCard title="Équipements" value={equipmentCount} icon={<span>🔧</span>} />
            <KpiCard title="Actions" value={actionsCount} icon={<span>📋</span>} />
          </div>
        </div>
      </section>

      {/* RISKS */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Risques liés à l'audit</h2>

        <div className="mb-3 flex justify-end">
          <button
            onClick={() => {
              setEditingRisk(null);
              setRiskFormOpen(true);
            }}
            className="brand-btn"
          >
            Ajouter un risque
          </button>
        </div>

        <RiskTable
          items={risks}
          onEdit={(r) => {
            setEditingRisk(r);
            setRiskFormOpen(true);
          }}
          onDelete={(id) => handleDeleteRisk(id)}
          onCreateAction={(riskId) => {
            setEditingAction(null);
            setActionFormOpen(true);
          }}
        />
      </section>

      {/* EQUIPMENTS */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Équipements concernés</h2>

        <EquipmentTable
          items={equipments}
          onEdit={(e) => {
            setEditingEquip(e);
            setEquipFormOpen(true);
          }}
          onDelete={(id) => handleDeleteEquipment(id)}
          onAdd={() => {
            setEditingEquip(null);
            setEquipFormOpen(true);
          }}
        />
      </section>

      {/* ATTACHMENTS */}
      <section className="mb-6">
        <Gallery items={attachments} onDelete={deleteAttachment} onUpload={uploadPhoto} />
      </section>

      {/* TIMELINE */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Timeline de l'audit</h2>

        <div className="card p-4">
          {logs.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--text)', fontWeight: 600 }}>Aucun événement enregistré.</div>
          ) : (
            <div>
              {React.createElement(require("../components/Timeline").default, { items: logs })}
            </div>
          )}
        </div>
      </section>

      {/* ACTION PLAN */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Plan d'actions</h2>

        <div className="mb-3 flex justify-end">
          <button
            onClick={() => {
              setEditingAction(null);
              setActionFormOpen(true);
            }}
            className="brand-btn"
          >
            Ajouter une action
          </button>
        </div>

        <ActionList
          items={actions}
          onEdit={(a) => {
            setEditingAction(a);
            setActionFormOpen(true);
          }}
          onDelete={(id) => handleDeleteAction(id)}
          onToggleStatus={(id) => toggleAction(id)}
        />
      </section>

      {/* SYNTHESIS */}
      <section className="mb-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold">Synthèse & Export</h3>

          <div className="mt-2 text-sm" style={{ color: 'var(--text)', fontWeight: 600 }}>
            <div>⚠️ {risks.filter(r => r.level === "CRITIQUE").length} risques critiques</div>
            <div>🔧 {equipments.filter(e => e.state === "NON_CONFORME").length} équipements non conformes</div>
            <div>📝 {actions.filter(a => a.status === "OUVERTE").length} actions ouvertes</div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                const rows = [
                  ["audit", audit.title],
                  ["risques_critique", risks.filter(r => r.level === "CRITIQUE").length.toString()],
                  ["equipements_nc", equipments.filter(e => e.state === "NON_CONFORME").length.toString()],
                ];
                const csv = rows.map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "audit_summary.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-md border"
            >
              Exporter Excel
            </button>

            <button
              onClick={() => alert("Synthèse IA (à implémenter)")}
              className="px-3 py-2 rounded-md border"
            >
              Synthèse IA
            </button>
          </div>
        </div>
      </section>

      {/* FOOT LINKS */}
      <div className="flex gap-2 mb-10">
        {site && (
          <Link to={`/site/${site.id}`} className="px-3 py-2 rounded-md border">
            Retour au site
          </Link>
        )}

        {building && (
          <Link to={`/building/${building.id}`} className="px-3 py-2 rounded-md border">
            Accéder au bâtiment
          </Link>
        )}
      </div>

      {/* FORMS MODALS */}
      <RiskForm initial={editingRisk} open={riskFormOpen} onClose={() => setRiskFormOpen(false)} onSave={handleSaveRisk} />
      <EquipmentForm initial={editingEquip} open={equipFormOpen} onClose={() => setEquipFormOpen(false)} onSave={handleSaveEquipment} />
      <ActionForm initial={editingAction} open={actionFormOpen} onClose={() => setActionFormOpen(false)} onSave={handleSaveAction} />

      <ConfirmModal
        open={confirmOpen}
        title="Confirmer la suppression"
        description="Voulez-vous supprimer cet élément ?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
      />
    </Layout>
  );
}
