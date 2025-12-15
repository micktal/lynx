import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function ClientPortal() {
  const [params] = useSearchParams();
  const clientId = params.get("clientId") || undefined;
  const [client, setClient] = useState<any>(null);
  const [risks, setRisks] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [showCreateAction, setShowCreateAction] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDue, setNewActionDue] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    (async () => {
      if (!clientId) return;
      const cls = await builder.fetchClients();
      setClient(cls.find((c: any) => c.id === clientId) || null);
      const allRisks = await builder.fetchRisks();
      setRisks(allRisks.filter((r) => r.clientId === clientId));
      const allActions = await builder.fetchActions();
      setActions(allActions.filter((a) => a.clientId === clientId));
      const allSites = await builder.fetchSites();
      setSites(allSites.filter((s) => s.clientId === clientId));

      // activity logs for this client (recent)
      try {
        const lg = await builder.fetchActivityLogsForEntity("client", clientId);
        setLogs(lg.slice(0, 10));
      } catch (e) {
        // ignore
      }
    })();
  }, [clientId]);

  if (!clientId)
    return (
      <Layout>
        <div className="card p-4">Client non spécifié</div>
      </Layout>
    );

  const exportCSV = (rows: any[][], filename = "export.csv") => {
    const csv = rows
      .map((r) =>
        r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRisks = () => {
    const rows = [
      [
        "id",
        "title",
        "level",
        "probability",
        "impact",
        "spaceId",
        "siteId",
        "createdAt",
      ],
      ...risks.map((r) => [
        r.id,
        r.title,
        r.level,
        r.probability || "",
        r.impact || "",
        r.spaceId || "",
        r.siteId || "",
        r.createdAt || "",
      ]),
    ];
    exportCSV(rows, `risks_client_${clientId}.csv`);
  };

  const exportActions = () => {
    const rows = [
      ["id", "title", "status", "dueDate", "ownerId", "createdAt"],
      ...actions.map((a) => [
        a.id,
        a.title,
        a.status,
        a.dueDate || "",
        a.ownerId || "",
        a.createdAt || "",
      ]),
    ];
    exportCSV(rows, `actions_client_${clientId}.csv`);
  };

  const handleCreateAction = async () => {
    if (!newActionTitle.trim()) {
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Erreur", description: "Titre requis" });
      return;
    }
    setSavingAction(true);
    try {
      const created = await builder.createAction({
        title: newActionTitle.trim(),
        dueDate: newActionDue || undefined,
      });
      setActions((s) => [created, ...s]);
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Action créée", description: created.title });
      setShowCreateAction(false);
      setNewActionTitle("");
      setNewActionDue("");
    } catch (e) {
      const { toast } = await import("@/hooks/use-toast");
      toast({ title: "Erreur", description: "Impossible de créer l'action" });
    } finally {
      setSavingAction(false);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">
              {client?.name || "Portail client"}
            </div>
            <div className="text-sm" style={{ color: "var(--text)" }}>
              Dashboard client simplifié
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="btn">
              Imprimer
            </button>
            <button className="btn">Se déconnecter</button>
          </div>
        </div>
      </div>

      <main className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div
            id="risks-card"
            className="card p-4 cursor-pointer"
            onClick={() => scrollTo("risks-list")}
          >
            <div className="text-sm" style={{ color: "var(--text)" }}>
              Risques totaux
            </div>
            <div className="text-2xl font-bold mt-1">{risks.length}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportRisks();
                }}
                className="btn btn-sm"
              >
                Exporter CSV
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateAction(true);
                }}
                className="btn btn-sm"
              >
                Créer action
              </button>
            </div>
          </div>

          <div
            id="actions-card"
            className="card p-4 cursor-pointer"
            onClick={() => scrollTo("actions-list")}
          >
            <div className="text-sm" style={{ color: "var(--text)" }}>
              Actions ouvertes
            </div>
            <div className="text-2xl font-bold mt-1">
              {actions.filter((a) => a.status !== "CLOTUREE").length}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  exportActions();
                }}
                className="btn btn-sm"
              >
                Exporter CSV
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/sites?clientId=${clientId}`;
                }}
                className="btn btn-sm"
              >
                Voir sites
              </button>
            </div>
          </div>

          <div
            id="sites-card"
            className="card p-4 cursor-pointer"
            onClick={() => scrollTo("sites-list")}
          >
            <div className="text-sm" style={{ color: "var(--text)" }}>
              Sites
            </div>
            <div className="text-2xl font-bold mt-1">{sites.length}</div>
            <div className="mt-3">
              <a
                className="text-sm underline"
                href={`/audit?clientId=${clientId}`}
              >
                Voir tous les audits
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div id="risks-list" className="card p-4 mb-4">
              <h3 className="font-semibold mb-2">Risques</h3>
              {risks.length === 0 ? (
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  Aucun risque
                </div>
              ) : (
                <ul className="space-y-2">
                  {risks.map((r) => (
                    <li
                      key={r.id}
                      className="border rounded p-2 flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text)" }}
                        >
                          Niveau: {r.level} • Espace: {r.spaceId}
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <div>
                          {r.probability || "-"} / {r.impact || "-"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div id="actions-list" className="card p-4 mb-4">
              <h3 className="font-semibold mb-2">Actions</h3>
              {actions.length === 0 ? (
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  Aucune action
                </div>
              ) : (
                <ul className="space-y-2">
                  {actions.map((a) => (
                    <li key={a.id} className="border rounded p-2">
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs" style={{ color: "var(--text)" }}>
                        Statut: {a.status} • Échéance: {a.dueDate || "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div id="sites-list" className="card p-4">
            <h3 className="font-semibold mb-2">Sites</h3>
            {sites.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--text)" }}>
                Aucun site
              </div>
            ) : (
              <ul className="space-y-2">
                {sites.map((s) => (
                  <li key={s.id} className="border rounded p-2">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs" style={{ color: "var(--text)" }}>
                      {s.city || s.address || ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Activité récente</h4>
              {logs.length === 0 ? (
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  Aucune activité récente
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {logs.map((l) => (
                    <li key={l.id} className="border rounded p-2">
                      <div className="font-medium">{l.operation}</div>
                      <div style={{ color: "var(--text)" }}>
                        {l.description}
                      </div>
                      <div className="text-xs">{l.timestamp}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Create action modal (simple) */}
        {showCreateAction && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-card rounded p-4 w-full max-w-md">
              <h3 className="font-semibold mb-2">Créer une action</h3>
              <div>
                <label className="text-sm">Titre</label>
                <input
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input mb-2"
                />
              </div>
              <div>
                <label className="text-sm">Échéance</label>
                <input
                  type="date"
                  value={newActionDue}
                  onChange={(e) => setNewActionDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input mb-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="btn"
                  onClick={() => setShowCreateAction(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={handleCreateAction}
                  disabled={savingAction}
                >
                  {savingAction ? "Création..." : "Créer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
