import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import * as builder from "../lib/builderService";

export default function WorkflowDashboard() {
  const [actions, setActions] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const acts = await builder.fetchActions();
    const rks = await builder.fetchRisks();
    setActions(acts);
    setRisks(rks);

    const now = new Date();
    const overdue = acts.filter((a) => a.dueDate && new Date(a.dueDate) < now && a.status !== "CLOTUREE").length;
    const upcoming = acts.filter((a) => a.dueDate && new Date(a.dueDate) > now && (new Date(a.dueDate).getTime() - now.getTime()) < 7 * 24 * 3600 * 1000).length;
    setOverdueCount(overdue);
    setUpcomingCount(upcoming);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard Workflow Global</h1>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard title="Actions en retard" value={overdueCount} icon={<span>🔴</span>} />
        <KpiCard title="Actions à échéance proche" value={upcomingCount} icon={<span>🟠</span>} />
        <KpiCard title="Actions totales" value={actions.length} icon={<span>🟢</span>} />
        <KpiCard title="Risques totaux" value={risks.length} icon={<span>⚠️</span>} />
        <KpiCard title="Risques critiques" value={risks.filter((r) => r.level === "CRITIQUE").length} icon={<span>🔥</span>} />
        <KpiCard title="Actions clôturées (semaine)" value={actions.filter((a) => a.status === "CLOTUREE").length} icon={<span>✅</span>} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Actions en retard (extrait)</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th>Action</th>
                <th>Échéance</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {actions.filter((a) => a.dueDate && new Date(a.dueDate) < new Date() && a.status !== "CLOTUREE").slice(0, 10).map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="py-2">{a.title}</td>
                  <td>{a.dueDate}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Risques critiques en attente</h2>
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left">
                <th>Risque</th>
                <th>Site</th>
                <th>Niveau</th>
              </tr>
            </thead>
            <tbody>
              {risks.filter((r) => r.level === "CRITIQUE").slice(0, 10).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{r.title}</td>
                  <td>{r.siteId}</td>
                  <td className="text-red-600">{r.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
