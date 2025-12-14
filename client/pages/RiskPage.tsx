import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

import type {
  Risk,
  Space,
  Building,
  Equipment,
  Attachment,
  ActionItem,
  Audit,
  Site,
  ActivityLog
} from "@shared/api";

import RiskForm from "../components/RiskForm";
import ActionList from "../components/ActionList";
import ActionForm from "../components/ActionForm";
import Gallery from "../components/Gallery";
import ConfirmModal from "../components/ConfirmModal";
import PhotoUploader from "../components/PhotoUploader";
import AttachmentsGallery from "../components/AttachmentsGallery";


export default function RiskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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


  /* ---------------------------------------------------
     LOAD RISK + ALL RELATED ENTITIES
  --------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const allRisks = await builder.fetchRisks();
      const r = allRisks.find((x) => x.id === riskId) || null;
      setRisk(r);
      if (!r) return;

      // Space → Building → Site
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
            const si = sites.find((s) => s.id === b.siteId) || null;
            setSite(si);
          }
        }
      }

      // Equipment
      if (r.equipmentId) {
        const equips = await builder.fetchEquipments();
        const eq = equips.find((e) => e.id === r.equipmentId) || null;
        setEquipment(eq);
      }

      // Audit
      if (r.auditId) {
        const audits = await builder.fetchAudits();
        const a = audits.find((at) => at.id === r.auditId) || null;
        setAudit(a);
      }

      // Actions
      const acts = await builder.fetchActionsForRisks([r.id]);
      setActions(acts);

      // Attachments
      const atts = (await builder.fetchAttachments()).filter(
        (a) =>
          a.riskId === r.id ||
          a.equipmentId === r.equipmentId ||
          a.auditId === r.auditId
      );
      setAttachments(atts);

      // Logs
      const lg = await builder.fetchActivityLogsForEntity("risk", r.id);
      setLogs(lg);
    })();
  }, [riskId]);


  /* ---------------------------------------------------
     BADGE STYLE
  --------------------------------------------------- */
  const levelBadge = (l?: Risk["level"]) => {
    switch (l) {
      case "CRITIQUE":
        return <span className="px-2 py-1 rounded bg-red-600 text-white">CRITIQUE</span>;
      case "IMPORTANT":
        return <span className="px-2 py-1 rounded bg-orange-400 text-black">IMPORTANT</span>;
      case "MOYEN":
        return <span className="px-2 py-1 rounded bg-yellow-300 text-black">MOYEN</span>;
      case "FAIBLE":
        return <span className="px-2 py-1 rounded bg-green-600 text-white">FAIBLE</span>;
      default:
        return <span className="px-2 py-1 rounded bg-gray-300">N/A</span>;
    }
  };


  /* ---------------------------------------------------
     SAVE RISK
  --------------------------------------------------- */
  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (!risk) return;
    const updated = await builder.updateRisk(risk.id, payload);
    if (updated) setRisk(updated);
    setEditOpen(false);
  };


  /* ---------------------------------------------------
     DELETE RISK
  --------------------------------------------------- */
  const handleDeleteRisk = async () => {
    if (!risk) return;
    await builder.deleteRisk(risk.id);

    if (risk.auditId) return navigate(`/audit/${risk.auditId}`);
    if (site) return navigate(`/site/${site.id}`);
    return navigate("/");
  };


  /* ---------------------------------------------------
     ACTIONS
  --------------------------------------------------- */
  const handleAddAction = () => {
    setEditingAction(null);
    setActionFormOpen(true);
  };

  const handleSaveAction = async (payload: Partial<ActionItem>) => {
    const created = await builder.createAction({
      ...payload,
      riskId: risk?.id,
      spaceId: risk?.spaceId,
      equipmentId: risk?.equipmentId,
      auditId: risk?.auditId
    });
    setActions((prev) => [created, ...prev]);
    setActionFormOpen(false);
  };

  const handleDeleteAction = (id: string) => {
    setToDelete({ type: "action", id });
    setConfirmOpen(true);
  };

  const toggleActionStatus = async (id: string) => {
    const act = actions.find((a) => a.id === id);
    if (!act) return;

    const next =
      act.status === "OUVERTE"
        ? "EN_COURS"
        : act.status === "EN_COURS"
          ? "CLOTUREE"
          : "CLOTUREE";

    const updated = await builder.updateAction(id, { status: next });
    if (updated) {
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
  };


  /* ---------------------------------------------------
     ATTACHMENTS
  --------------------------------------------------- */
  const handleUpload = async () => {
    if (!risk) return;
    const created = await builder.createAttachment({
      fileUrl: "/placeholder.svg",
      fileType: "image/svg",
      riskId: risk.id,
      uploadedBy: "u_local"
    });
    setAttachments((prev) => [created, ...prev]);
  };

  const handleDeleteAttachment = (id: string) => {
    setToDelete({ type: "attachment", id });
    setConfirmOpen(true);
  };


  /* ---------------------------------------------------
     CONFIRM DELETION
  --------------------------------------------------- */
  const confirmDeletion = async () => {
    if (!toDelete) return setConfirmOpen(false);

    const { type, id } = toDelete;

    if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    }

    if (type === "attachment") {
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    }

    if (type === "risk") {
      await handleDeleteRisk();
    }

    setConfirmOpen(false);
    setToDelete(null);
  };


  /* ---------------------------------------------------
     HISTORY EVENTS (local)
  --------------------------------------------------- */
  const historyEvents = useMemo(() => {
    const ev: { date: string; text: string }[] = [];

    if (risk) ev.push({ date: new Date().toISOString(), text: "Chargement du risque" });

    attachments.forEach((a) =>
      ev.push({
        date: a.uploadedAt || new Date().toISOString(),
        text: `Pièce jointe ajoutée par ${a.uploadedBy}`
      })
    );

    actions.forEach((ac) =>
      ev.push({
        date: ac.updatedAt || new Date().toISOString(),
        text: `Action: ${ac.title} (${ac.status})`
      })
    );

    return ev.sort((a, b) => b.date.localeCompare(a.date));
  }, [risk, attachments, actions]);


  /* ---------------------------------------------------
     RENDER
  --------------------------------------------------- */
  if (!risk) {
    return (
      <Layout>
        <div className="card p-6">
          <h1 className="text-2xl font-bold">Risque introuvable</h1>
          <p className="text-muted mt-2">Ce risque n'existe plus.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">{risk.title}</h1>

          <div className="text-sm text-muted mt-1">
            {space && <Link to={`/space/${space.id}`} className="underline">{space.name}</Link>}
            {building && <> • {building.name}</>}
            {equipment && <> • {equipment.name}</>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {levelBadge(risk.level)}

          <button onClick={() => setEditOpen(true)} className="px-3 py-2 border rounded-md">
            Modifier
          </button>

          <button
            onClick={() => setToDelete({ type: "risk", id: risk.id }) || setConfirmOpen(true)}
            className="px-3 py-2 border rounded-md text-red-600 border-red-500"
          >
            Supprimer
          </button>

          <button onClick={handleAddAction} className="brand-btn">
            Créer action corrective
          </button>
        </div>

      </div>


      {/* RISK DETAILS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="card p-4">
          <h4 className="font-semibold">Niveau</h4>
          <div className="mt-2">{levelBadge(risk.level)}</div>
        </div>

        <div className="card p-4">
          <h4 className="font-semibold">Probabilité</h4>
          <div className="text-2xl font-bold mt-2">{risk.probability}</div>
        </div>

        <div className="card p-4">
          <h4 className="font-semibold">Impact</h4>
          <div className="text-2xl font-bold mt-2">{risk.impact}</div>
        </div>

      </section>


      {/* DESCRIPTION */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Description</h3>
        <div className="card p-4 text-sm text-muted">
          {risk.description || "—"}
        </div>
      </section>


      {/* RECOMMENDATION */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Recommandation</h3>
        <div className="card p-4 text-sm">
          {risk.recommendation || "—"}
        </div>
      </section>


      {/* ORIGIN */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Origine</h3>

        <div className="card p-4 text-sm">
          <div>Site : {site ? <Link to={`/site/${site.id}`} className="underline">{site.name}</Link> : "—"}</div>
          <div>Bâtiment : {building ? <Link to={`/building/${building.id}`} className="underline">{building.name}</Link> : "—"}</div>
          <div>Espace : {space ? <Link to={`/space/${space.id}`} className="underline">{space.name}</Link> : "—"}</div>
          <div>Équipement : {equipment ? <Link to={`/equipment/${equipment.id}`} className="underline">{equipment.name}</Link> : "—"}</div>
        </div>
      </section>


      {/* ACTIONS */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Actions correctives</h3>

        <div className="flex justify-end mb-3">
          <button onClick={handleAddAction} className="brand-btn">
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
          onToggleStatus={(id) => toggleActionStatus(id)}
        />
      </section>


      {/* ATTACHMENTS */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Photos & pièces jointes</h3>

        <Gallery
          items={attachments}
          onDelete={(id) => handleDeleteAttachment(id)}
          onUpload={handleUpload}
        />
      </section>


      {/* TIMELINE */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Historique</h3>

        <div className="card p-4">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-muted">
              Aucun événement pour ce risque.
            </div>
          ) : (
            <div>
              {React.createElement(
                require("../components/Timeline").default,
                { items: logs }
              )}
            </div>
          )}
        </div>
      </section>


      {/* FOOTER LINKS */}
      <div className="flex gap-2">
        {risk.auditId && (
          <Link to={`/audit/${risk.auditId}`} className="px-3 py-2 border rounded-md">
            Retour audit
          </Link>
        )}
        {space && (
          <Link to={`/space/${space.id}`} className="px-3 py-2 border rounded-md">
            Voir espace
          </Link>
        )}
        {building && (
          <Link to={`/building/${building.id}`} className="px-3 py-2 border rounded-md">
            Voir bâtiment
          </Link>
        )}
        {equipment && (
          <Link to={`/equipment/${equipment.id}`} className="px-3 py-2 border rounded-md">
            Voir équipement
          </Link>
        )}
      </div>


      {/* MODALS */}
      <RiskForm
        initial={risk}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveRisk}
      />

      <ActionForm
        initial={editingAction}
        open={actionFormOpen}
        onClose={() => setActionFormOpen(false)}
        onSave={handleSaveAction}
      />

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
