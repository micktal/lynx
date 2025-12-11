import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import type { WorkflowRule } from "@shared/api";
import * as builder from "../lib/builderService";

export default function WorkflowPage() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<WorkflowRule>>({ trigger: "onActionCreated", active: true });

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    setLoading(true);
    const r = await builder.fetchWorkflowRules();
    setRules(r);
    setLoading(false);
  }

  async function handleCreate() {
    if (!form.ruleName || !form.trigger) return;
    setLoading(true);
    await builder.createWorkflowRule(form);
    await loadRules();
    setForm({ trigger: "onActionCreated", active: true });
    setLoading(false);
  }

  async function handleToggleActive(rule: WorkflowRule) {
    await builder.updateWorkflowRule(rule.id, { active: !rule.active });
    loadRules();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer la règle ?")) return;
    await builder.deleteWorkflowRule(id);
    loadRules();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configuration Workflow</h1>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <input className="input" placeholder="Nom de la règle" value={form.ruleName || ""} onChange={(e) => setForm({ ...form, ruleName: e.target.value })} />

          <select className="input" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value as any })}>
            <option value="onRiskCreated">onRiskCreated</option>
            <option value="onRiskUpdated">onRiskUpdated</option>
            <option value="onActionCreated">onActionCreated</option>
            <option value="onActionUpdated">onActionUpdated</option>
            <option value="beforeDueDate">beforeDueDate</option>
            <option value="overdue">overdue</option>
          </select>

          <input className="input" placeholder="Assignation (userId:..., role:..., team:...)" value={form.assignmentTarget || ""} onChange={(e) => setForm({ ...form, assignmentTarget: e.target.value })} />

          <textarea className="input col-span-1 md:col-span-3" placeholder={'Condition (ex: level == "CRITIQUE")'} value={form.condition || ""} onChange={(e) => setForm({ ...form, condition: e.target.value })} />

          <textarea className="input col-span-1 md:col-span-3" placeholder="Template de notification" value={form.notificationTemplate || ""} onChange={(e) => setForm({ ...form, notificationTemplate: e.target.value })} />

          <input className="input" placeholder="Escalade cible (role:...)" value={form.escalationTarget || ""} onChange={(e) => setForm({ ...form, escalationTarget: e.target.value })} />

          <input type="number" className="input" placeholder="Délai avant escalation (heures)" value={form.delayBeforeEscalation || ""} onChange={(e) => setForm({ ...form, delayBeforeEscalation: Number(e.target.value) })} />

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted">Active</label>
            <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          </div>

          <div className="md:col-span-3 flex gap-2 justify-end">
            <button className="btn" onClick={handleCreate} disabled={loading}>Créer la règle</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">Règles existantes</h2>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th>Nom</th>
                  <th>Trigger</th>
                  <th>Condition</th>
                  <th>Assignation</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.ruleName}</td>
                    <td>{r.trigger}</td>
                    <td>{r.condition}</td>
                    <td>{r.assignmentTarget}</td>
                    <td>{r.active ? "Oui" : "Non"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-sm" onClick={() => handleToggleActive(r)}>{r.active ? "Désactiver" : "Activer"}</button>
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Supprimer</button>
                      </div>
                    </td>
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
