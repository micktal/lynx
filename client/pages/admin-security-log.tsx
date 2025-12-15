import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { SecurityAuditLog } from "@shared/api";

export default function AdminSecurityLogPage() {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [action, setAction] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const l = await builder.fetchSecurityLogs({
      userId: userId || undefined,
      action: action || undefined,
    });
    setLogs(l);
    setLoading(false);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Journal de sécurité</h1>
          <div className="text-sm text-muted">
            Audit interne et tentatives d'accès
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Utilisateur ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            className="input"
            placeholder="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          />
          <button className="btn" onClick={load}>
            Filtrer
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              setUserId("");
              setAction("");
              await load();
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="card p-4">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>Date</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="py-2">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td>{l.userId}</td>
                  <td>{l.action}</td>
                  <td>
                    {l.entityType} / {l.entityId}
                  </td>
                  <td>
                    <pre className="text-xs max-w-lg overflow-auto">
                      {typeof l.details === "string"
                        ? l.details
                        : JSON.stringify(l.details, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
