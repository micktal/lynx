import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

import type {
  Equipment,
  Space,
  Building,
  Risk,
  Attachment,
  ActionItem,
  ActivityLog,
} from "@shared/api";

import EquipmentForm from "../components/EquipmentForm";
import RiskForm from "../components/RiskForm";
import RiskTable from "../components/RiskTable";
import ActionList from "../components/ActionList";
import Gallery from "../components/Gallery";
import ActionForm from "../components/ActionForm";
import ConfirmModal from "../components/ConfirmModal";
import Timeline from "../components/Timeline";
import PhotoUploader from "../components/PhotoUploader";
import AttachmentsGallery from "../components/AttachmentsGallery";

export default function EquipmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [toDelete, setToDelete] = useState<{
    type: "risk" | "attachment" | "action";
    id: string;
  } | null>(null);

  /* -------------------------------------
      LOAD EQUIPMENT + RELATED DATA
  ------------------------------------- */
  useEffect(() => {
    (async () => {
      const allEquip = await builder.fetchEquipments();
      const eq = allEquip.find((e) => e.id === equipId) || null;
      setEquipment(eq);
      if (!eq) return;

      const spaces = await builder.fetchSpaces();
      const sp = spaces.find((s) => s.id === eq.spaceId) || null;
      setSpace(sp);

      // attachments
      setAttachments((await builder.fetchAttachments()).filter((a) => a.equipmentId === eq.id));

      if (sp) {
        const buildings = await builder.fetchBuildings();
        const b = buildings.find((bb) => bb.id === sp.buildingId) || null;
        setBuilding(b);
      }

      const allRisks = await builder.fetchRisks();
      const myRisks = allRisks.filter((r) => r.equipmentId === eq.id);
      setRisks(myRisks);

      const atts = (await builder.fetchAttachments()).filter(
        (a) => a.equipmentId === eq.id
      );
      setAttachments(atts);

      const acts = await builder.fetchActionsForRisks(
        myRisks.map((r) => r.id)
      );
      setActions(acts);

      const lg = await builder.fetchActivityLogsForEntity(
        "equipment",
        eq.id
      );
      setLogs(lg);
    })();
  }, [equipId]);

  /* -------------------------------------
      EQUIPMENT UPDATE
  ------------------------------------- */
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

  /* -------------------------------------
      RISK CRUD
  ------------------------------------- */
  const handleAddRisk = () => {
    setRiskFormOpen(true);
  };

  const handleSaveRisk = async (payload: Partial<Risk>) => {
    if (!equipment) return;

    const sp = space;
    const created = await builder.createRisk({
      ...payload,
      equipmentId: equipment.id,
      spaceId: equipment.spaceId,
      buildingId: sp?.buildingId,
      siteId: building?.siteId,
    });

    setRisks((prev) => [created, ...prev]);

    // load actions for this single risk
    const riskActs = await builder.fetchActionsForRisks([created.id]);
    setActions((prev) => [...riskActs, ...prev]);

    setRiskFormOpen(false);
  };

  const handleDeleteRisk = (id: string) => {
    setToDelete({ type: "risk", id });
    setConfirmOpen(true);
  };

  /* -------------------------------------
      ACTION CRUD
  ------------------------------------- */
  const handleAddAction = () => {
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

  const handleToggleActionStatus = async (id: string) => {
    const act = actions.find((a) => a.id === id);
    if (!act) return;

    const next =
      act.status === "OUVERTE"
        ? "EN_COURS"
        : act.status === "EN_COURS"
          ? "CLOTUREE"
          : "CLOTUREE";

    const updated = await builder.updateAction(id, { status: next });
    if (updated)
      setActions((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  /* -------------------------------------
      ATTACHMENTS
  ------------------------------------- */
  const handleUpload = async () => {
    if (!equipment) return;

    const created = await builder.createAttachment({
      fileUrl: "/placeholder.svg",
      fileType: "image/svg",
      uploadedBy: "u_local",
      equipmentId: equipment.id,
    });

    setAttachments((prev) => [created, ...prev]);
  };

  const handleDeleteAttachment = (id: string) => {
    setToDelete({ type: "attachment", id });
    setConfirmOpen(true);
  };

  /* -------------------------------------
      CONFIRM DELETE
  ------------------------------------- */
  const confirmDeletion = async () => {
    if (!toDelete) return;

    const { type, id } = toDelete;

    if (type === "risk") {
      await builder.deleteRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      setActions((prev) => prev.filter((a) => a.riskId !== id));
    }

    if (type === "attachment") {
      await builder.deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    }

    if (type === "action") {
      await builder.deleteAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    }

    setToDelete(null);
    setConfirmOpen(false);
  };

  /* -------------------------------------
      HISTORY (memo)
  ------------------------------------- */
  const historyEvents = useMemo(() => {
    const ev: { date: string; text: string }[] = [];

    if (equipment?.comment)
      ev.push({
        date: new Date().toISOString(),
        text: `Commentaire : ${equipment.comment}`,
      });

    attachments.forEach((a) =>
      ev.push({
        date: a.uploadedAt || new Date().toISOString(),
        text: `Photo ajoutée (${a.fileType})`,
      })
    );

    actions.forEach((ac) =>
      ev.push({
        date: ac.dueDate || new Date().toISOString(),
        text: `Action ${ac.title} (${ac.status})`,
      })
    );

    return ev.sort((a, b) => b.date.localeCompare(a.date));
  }, [equipment, attachments, actions]);

  /* -------------------------------------
      NO EQUIPMENT
  ------------------------------------- */
  if (!equipment) {
    return (
      <Layout>
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold">Équipement introuvable</h1>
          <p className="text-muted mt-1">
            L’équipement demandé n’existe pas.
          </p>
        </div>
      </Layout>
    );
  }

  /* -------------------------------------
      BADGE ÉTAT
  ------------------------------------- */
  const stateBadge = (s: Equipment["state"]) => {
    const map: Record<string, string> = {
      OK: "bg-green-600 text-white",
      A_CONTROLER: "bg-yellow-300 text-black",
      NON_CONFORME: "bg-red-600 text-white",
      OBSOLETE: "bg-orange-400 text-black",
      ABSENT: "bg-gray-300 text-black",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${map[s] || ""}`}>{s}</span>
    );
  };

  /* -------------------------------------
      RENDER PAGE
  ------------------------------------- */
  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
          <div className="text-sm text-muted mt-1">
            {equipment.category} • Réf: {equipment.reference}
          </div>
          <div className="mt-2">{stateBadge(equipment.state)}</div>
          <div className="mt-2 text-sm text-muted">
            Espace :{" "}
            {space ? (
              <Link to={`/space/${space.id}`} className="underline">
                {space.name}
              </Link>
            ) : (
              "-"
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="px-3 py-2 rounded-md border border-border"
          >
            Modifier
          </button>

          <button
            onClick={() => {
              if (!confirm("Supprimer cet équipement ?")) return;
              builder.deleteEquipment(equipment.id).then(() =>
                navigate(-1)
              );
            }}
            className="px-3 py-2 rounded-md border border-border text-destructive"
          >
            Supprimer
          </button>

          <select
            onChange={(e) =>
              handleQuickState(e.target.value as Equipment["state"])
            }
            value={equipment.state}
            className="px-3 py-2 rounded-md border border-border bg-input"
          >
            <option value="OK">OK</option>
            <option value="A_CONTROLER">À contrôler</option>
            <option value="NON_CONFORME">Non conforme</option>
            <option value="OBSOLETE">Obsolète</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {/* FICHE TECHNIQUE */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <div className="font-medium">
                {space ? (
                  <Link to={`/space/${space.id}`} className="underline">
                    {space.name}
                  </Link>
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-sm text-muted">Commentaire interne</div>
              <div className="mt-1 p-3 bg-muted/10 rounded">
                {equipment.comment || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* ÉTATS RAPIDES */}
        <div className="card">
          <h3 className="font-semibold mb-2">État rapide</h3>

          <div className="flex flex-col gap-2">
            <button
              className="btn bg-green-600 text-white"
              onClick={() => handleQuickState("OK")}
            >
              Passer en OK
            </button>

            <button
              className="btn bg-yellow-300"
              onClick={() => handleQuickState("A_CONTROLER")}
            >
              À contrôler
            </button>

            <button
              className="btn bg-red-600 text-white"
              onClick={() => handleQuickState("NON_CONFORME")}
            >
              Non conforme
            </button>

            <button
              className="btn bg-orange-400"
              onClick={() => handleQuickState("OBSOLETE")}
            >
              Obsolète
            </button>

            <button
              className="btn bg-gray-300"
              onClick={() => handleQuickState("ABSENT")}
            >
              Absent
            </button>
          </div>
        </div>
      </section>

      {/* RISQUES */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Risques associés</h3>

        {risks.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-sm text-muted">
              Aucun risque défini pour cet équipement.
            </div>

            <button onClick={handleAddRisk} className="brand-btn mt-3">
              Ajouter un risque
            </button>
          </div>
        ) : (
          <RiskTable
            items={risks}
            onEdit={() => setRiskFormOpen(true)}
            onDelete={handleDeleteRisk}
            onCreateAction={() => setActionFormOpen(true)}
          />
        )}
      </section>

      {/* ACTIONS */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Actions correctives</h3>

        <div className="flex justify-end mb-3">
          <button className="brand-btn" onClick={handleAddAction}>
            Ajouter une action
          </button>
        </div>

        <ActionList
          items={actions}
          onEdit={(a) => {
            setEditingAction(a);
            setActionFormOpen(true);
          }}
          onDelete={handleDeleteAction}
          onToggleStatus={handleToggleActionStatus}
        />
      </section>

      {/* PHOTOS */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <AttachmentsGallery entityType="equipment" entityId={equipId} />
          </div>
          <div>
            <PhotoUploader entityType="equipment" entityId={Number(equipId)} onUploaded={(att)=>setAttachments((prev)=>[att, ...prev])} />
          </div>
        </div>
      </section>

      {/* HISTORIQUE */}
      <section className="mb-8">
        <h3 className="font-semibold mb-3">Historique</h3>

        <div className="card p-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted py-6">
              Aucun événement enregistré.
            </div>
          ) : (
            <Timeline items={logs} />
          )}
        </div>
      </section>

      {/* NAVIGATION */}
      <div className="flex gap-2 mb-10">
        {space && (
          <Link
            to={`/space/${space.id}`}
            className="px-3 py-2 border border-border rounded-md"
          >
            Retour à l’espace
          </Link>
        )}

        {building && (
          <Link
            to={`/building/${building.id}`}
            className="px-3 py-2 border border-border rounded-md"
          >
            Voir bâtiment
          </Link>
        )}

        {building?.siteId && (
          <Link
            to={`/site/${building.siteId}`}
            className="px-3 py-2 border border-border rounded-md"
          >
            Voir site
          </Link>
        )}
      </div>

      {/* FORMS */}
      <EquipmentForm
        initial={equipment}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEquipment}
      />

      <RiskForm
        initial={null}
        open={riskFormOpen}
        onClose={() => setRiskFormOpen(false)}
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
