import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Site, Building } from "@shared/api";
import KpiCard from "../components/KpiCard";
import BuildingCard from "../components/BuildingCard";
import BuildingForm from "../components/BuildingForm";
import ConfirmModal from "../components/ConfirmModal";
import PhotoUploader from "../components/PhotoUploader";
import AttachmentsGallery from "../components/AttachmentsGallery";

/* -------------------------
   Onglet — Composant generic
--------------------------*/
function Tab({ id, tab, setTab, label }: any) {
  const active = id === tab;
  return (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2 rounded-md ${active ? "bg-primary text-white" : "bg-card text-muted"
        }`}
    >
      {label}
    </button>
  );
}

/* -------------------------
   Onglet : Vue générale
--------------------------*/
function OverviewTab({ site }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Résumé</h3>
        <p className="text-sm text-muted">
          Aperçu général des risques, actions, incidents et statut du site.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <KpiCard title="Risques critiques" value={site.nbRisquesCritiques || 0} />
          <KpiCard title="Actions en retard" value={site.nbActionsEnRetard || 0} />
          <KpiCard title="Incidents ouverts" value={site.nbIncidentsOuverts || 0} />
          <KpiCard title="Score criticité" value={site.score_criticite || 0} />
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Carte du site</h3>
        <div className="text-sm text-muted mb-2">
          Position et contexte géographique.
        </div>
        <img src="/placeholder.svg" loading="lazy" className="rounded-lg" />
      </div>
    </div>
  );
}

/* -------------------------
   Onglet : Espaces
--------------------------*/
function SpacesTab({ spaces }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-4">Espaces du site</h3>
      {spaces.length === 0 ? (
        <p className="text-muted text-sm">Aucun espace enregistré.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-b">
              <th className="py-2 text-left">Nom</th>
              <th className="text-left">Bâtiment</th>
              <th className="text-left">Équipements</th>
              <th className="text-left">Risques</th>
            </tr>
          </thead>
          <tbody>
            {spaces.map((s: any) => (
              <tr key={s.id} className="border-b">
                <td className="py-2">{s.name}</td>
                <td>{s.buildingName}</td>
                <td>{s.equipmentCount}</td>
                <td>{s.riskCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* -------------------------
   Onglet : Risques
--------------------------*/
function RisksTab({ risks }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-4">Risques</h3>
      {risks.length === 0 ? (
        <p className="text-muted text-sm">Aucun risque enregistré.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted">
              <th className="py-2 text-left">Criticité</th>
              <th className="text-left">Description</th>
              <th className="text-left">Statut</th>
              <th className="text-left">Action liée</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 font-semibold">{r.criticite}</td>
                <td>{r.description}</td>
                <td>{r.status}</td>
                <td>{r.actionName || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* -------------------------
   Onglet : Actions
--------------------------*/
function ActionsTab({ actions }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-4">Actions correctives</h3>
      {actions.length === 0 ? (
        <p className="text-muted text-sm">Aucune action enregistrée.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted">
              <th className="py-2 text-left">Action</th>
              <th className="text-left">Responsable</th>
              <th className="text-left">Échéance</th>
              <th className="text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a: any) => (
              <tr key={a.id} className="border-b">
                <td className="py-2">{a.title}</td>
                <td>{a.assignee}</td>
                <td>{a.deadline}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* -------------------------
   Onglet : Documents
--------------------------*/
function DocumentsTab({ documents }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-4">Documents</h3>
      {documents.length === 0 ? (
        <p className="text-muted text-sm">Aucun document pour ce site.</p>
      ) : (
        <ul className="list-disc ml-6 text-sm">
          {documents.map((d: any) => (
            <li key={d.id}>
              <a className="underline" href={d.url} target="_blank">
                {d.name}
              </a>{" "}
              — v{d.version}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------
   Onglet : Chantiers
--------------------------*/
function ChantiersTab({ chantiers }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-4">Chantiers</h3>
      {chantiers.length === 0 ? (
        <p className="text-muted text-sm">Aucun chantier enregistré.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted">
              <th className="py-2 text-left">Chantier</th>
              <th className="text-left">Entreprise</th>
              <th className="text-left">Début</th>
              <th className="text-left">Fin</th>
              <th className="text-left">% Avancement</th>
            </tr>
          </thead>
          <tbody>
            {chantiers.map((c: any) => (
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.title}</td>
                <td>{c.company}</td>
                <td>{c.startDate}</td>
                <td>{c.endDate}</td>
                <td>{c.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ======================================================
                     PAGE PRINCIPALE
======================================================= */
export default function SitePage() {
  const { id } = useParams();
  const siteId = id || "";

  const [site, setSite] = useState<Site | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [tab, setTab] = useState("overview");

  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<string | null>(null);

  const [kpis, setKpis] = useState({
    buildings: 0,
    spaces: 0,
    equipments: 0,
    risks: 0,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [siteConfirmOpen, setSiteConfirmOpen] = useState(false);

  const [perBuildingStats, setPerBuildingStats] = useState<
    Record<string, { spaces: number; equipments: number; risks: number; lastAudit?: any }>
  >({});

  /* -------------------------------------------------
     FETCH — Chargement site + bâtiments + stats
  -------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const sites = await builder.fetchSites();
      const found = sites.find((s) => s.id === siteId) || null;
      setSite(found);

      const allBuildings = await builder.fetchBuildings();
      setBuildings(allBuildings.filter((b) => b.siteId === siteId));

      const stats = await builder.countStatsForSite(siteId);
      setKpis(stats.total);

      const map: Record<string, any> = {};
      stats.perBuilding.forEach((p) => {
        map[p.buildingId] = {
          spaces: p.spaces,
          equipments: p.equipments,
          risks: p.risks,
          lastAudit: p.lastAudit,
        };
      });
      setPerBuildingStats(map);
    })();
  }, [siteId]);

  /* -------------------------------------------------
     FILTRES BÂTIMENTS
  -------------------------------------------------- */
  const usages = useMemo(
    () => Array.from(new Set(buildings.map((b) => b.mainUse || "Autre"))),
    [buildings]
  );

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(b.name.toLowerCase().includes(q) || (b.code || "").toLowerCase().includes(q)))
          return false;
      }
      if (usageFilter && b.mainUse !== usageFilter) return false;
      return true;
    });
  }, [buildings, query, usageFilter]);

  /* -------------------------------------------------
     ACTIONS CRUD
  -------------------------------------------------- */
  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSave = async (payload: Partial<Building>) => {
    if (editing) {
      const updated = await builder.updateBuilding(editing.id, payload);
      if (updated)
        setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } else {
      const created = await builder.createBuilding({ ...payload, siteId });
      setBuildings((prev) => [created, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = async (idToDelete?: string) => {
    setConfirmOpen(false);
    const id = idToDelete || toDelete;
    if (!id) return;
    if (await builder.deleteBuilding(id))
      setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSiteDelete = async () => {
    if (!site) return;
    if (buildings.length > 0) {
      alert("Impossible de supprimer un site avec des bâtiments.");
      setSiteConfirmOpen(false);
      return;
    }
    if (await builder.deleteSite(site.id)) window.location.href = "/";
  };

  /* -------------------------------------------------
     AFFICHAGE SI INVALIDE
  -------------------------------------------------- */
  if (!site) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Site introuvable</h1>
          <p className="text-sm text-muted mt-2">
            Le site demandé est introuvable.
          </p>
          <div className="mt-4">
            <Link to="/" className="px-3 py-2 rounded-md border border-border">
              Retour
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  /* ======================================================
                     RENDER PRINCIPAL
  ====================================================== */
  return (
    <Layout>
      {/* HEADER PREMIUM */}
      <div className="mb-6 p-4 bg-card rounded-xl shadow border border-border">
        <h1 className="text-2xl font-bold">{site.name}</h1>

        <div className="text-sm text-muted mt-1">
          {site.address} • {site.city}, {site.regionName} ({site.departmentName})
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title="Risques critiques" value={site.nbRisquesCritiques || 0} />
          <KpiCard title="Actions en retard" value={site.nbActionsEnRetard || 0} />
          <KpiCard title="Incidents ouverts" value={site.nbIncidentsOuverts || 0} />
          <KpiCard title="Score criticité" value={site.score_criticite || 0} />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            className="btn w-full sm:w-auto"
            onClick={() => window.location.href = `/map-france?site=${siteId}`}
          >
            Voir sur la carte
          </button>

          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => window.location.href = `/audit/${siteId}`}
          >
            Dernier audit
          </button>

          <button
            className="btn-secondary w-full sm:w-auto"
            onClick={() => window.location.href = `/actions?site=${siteId}`}
          >
            Actions du site
          </button>
        </div>
      </div>

      {/* ONGLET NAV */}
      <div className="tabs mb-6 flex gap-2">
        <Tab id="overview" tab={tab} setTab={setTab} label="Vue générale" />
        <Tab id="buildings" tab={tab} setTab={setTab} label="Bâtiments" />
        <Tab id="spaces" tab={tab} setTab={setTab} label="Espaces" />
        <Tab id="risks" tab={tab} setTab={setTab} label="Risques" />
        <Tab id="actions" tab={tab} setTab={setTab} label="Actions" />
        <Tab id="documents" tab={tab} setTab={setTab} label="Documents" />
        <Tab id="chantiers" tab={tab} setTab={setTab} label="Chantiers" />
      </div>

      {/* PANNEAUX */}
      {tab === "overview" && <OverviewTab site={site} />}
      {tab === "spaces" && <SpacesTab spaces={site.spaces || []} />}
      {tab === "risks" && <RisksTab risks={site.risks || []} />}
      {tab === "actions" && <ActionsTab actions={site.actions || []} />}
      {tab === "documents" && <DocumentsTab documents={site.documents || []} />}
      {tab === "chantiers" && <ChantiersTab chantiers={site.chantiers || []} />}

      {/* ONGLET BÂTIMENTS (TON CODE EXISTANT DÉPLACÉ) */}
      {tab === "buildings" && (
        <>
          <section className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un bâtiment..."
                  className="px-3 py-2 rounded-md border border-border bg-input w-64"
                />
                <select
                  value={usageFilter ?? ""}
                  onChange={(e) => setUsageFilter(e.target.value || null)}
                  className="px-3 py-2 rounded-md border border-border bg-input"
                >
                  <option value="">Tous usages</option>
                  {usages.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <button onClick={handleAdd} className="brand-btn">
                  Ajouter un bâtiment
                </button>
              </div>
            </div>
          </section>

          <section>
            {filteredBuildings.length === 0 ? (
              <div className="card text-center py-10">
                <img src="/placeholder.svg" alt="empty" className="mx-auto w-48 opacity-60" />
                <h3 className="text-lg font-semibold mt-4">
                  Aucun bâtiment encore enregistré
                </h3>
                <p className="text-sm text-muted mt-2">
                  Ajoutez votre premier bâtiment pour commencer l’analyse de ce site.
                </p>
                <div className="mt-4">
                  <button onClick={handleAdd} className="brand-btn">
                    Ajouter un bâtiment
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBuildings.map((b) => (
                  <BuildingCard
                    key={b.id}
                    building={b}
                    stats={perBuildingStats[b.id] || { spaces: 0, equipments: 0, risks: 0 }}
                    onEdit={() => {
                      setEditing(b);
                      setFormOpen(true);
                    }}
                    onDelete={() => {
                      setToDelete(b.id);
                      setConfirmOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* MODALS */}
      <BuildingForm
        initial={editing}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Confirmer la suppression"
        description="Voulez-vous supprimer ce bâtiment ?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => handleDelete()}
      />

      <ConfirmModal
        open={siteConfirmOpen}
        title="Supprimer le site"
        description="Voulez-vous supprimer ce site ? Tous les bâtiments seront supprimés."
        onCancel={() => setSiteConfirmOpen(false)}
        onConfirm={() => handleSiteDelete()}
      />
    </Layout>
  );
}
