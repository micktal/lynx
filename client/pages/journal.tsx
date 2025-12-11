import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { ActivityLog } from "@shared/api";

export default function JournalPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [operation, setOperation] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await builder.fetchActivityLogsWithFilters({ from, to, entityType, operation, userId });
    setLogs(data);
    setLoading(false);
  }

  async function handleFilterApply() {
    await load();
  }

  function exportCsv() {
    const rows = [$("timestamp,entityType,entityId,operation,userId,description")];
  }

  function downloadCsv() {
    const csvRows = ["timestamp,entityType,entityId,operation,userId,description"];
    logs.forEach((l) => {
      const row = [l.timestamp, l.entityType, l.entityId, l.operation, l.userId || "", `"${(l.description || "").replace(/"/g, '""') }"`];
      csvRows.push(row.join(","));
    });
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journal_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Journal d'activité</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={downloadCsv}>Exporter CSV</button>
        </div>
      </div>

      <div className="card mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input type="date" className="input" onChange={(e) => setFrom(e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
          <input type="date" className="input" onChange={(e) => setTo(e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
          <select className="input" onChange={(e) => setEntityType(e.target.value || undefined)}>
            <option value="">Tous</option>
            <option value="audit">Audit</option>
            <option value="risk">Risque</option>
            <option value="action">Action</option>
            <option value="equipment">Équipement</option>
            <option value="space">Espace</option>
            <option value="building">Bâtiment</option>
            <option value="site">Site</option>
          </select>
          <select className="input" onChange={(e) => setOperation(e.target.value || undefined)}>
            <option value="">Toutes opérations</option>
            <option value="created">created</option>
            <option value="updated">updated</option>
            <option value="statusChanged">statusChanged</option>
            <option value="deleted">deleted</option>
            <option value="commentAdded">commentAdded</option>
            <option value="photoAdded">photoAdded</option>
          </select>
          <input className="input" placeholder="Utilisateur" onChange={(e) => setUserId(e.target.value || undefined)} />
          <div className="flex gap-2">
            <button className="btn" onClick={handleFilterApply}>Appliquer</button>
            <button className="btn-ghost" onClick={async () => { setFrom(undefined); setTo(undefined); setEntityType(undefined); setOperation(undefined); setUserId(undefined); await load(); }}>Réinitialiser</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4">
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th>Date</th>
                  <th>Entité</th>
                  <th>Opération</th>
                  <th>Utilisateur</th>
                  <th>Description</th>
                  <th>Lien</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="py-2">{new Date(l.timestamp).toLocaleString()}</td>
                    <td>{l.entityType} / {l.entityId}</td>
                    <td>{l.operation}</td>
                    <td>{l.userId}</td>
                    <td>{l.description}</td>
                    <td>{l.entityType && l.entityId ? <a className="btn-sm" href={`/${l.entityType}/${l.entityId}`}>Ouvrir</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
