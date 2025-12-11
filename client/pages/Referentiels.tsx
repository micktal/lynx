import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { AuditTemplate } from "@shared/api";

export default function Referentiels() {
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [name, setName] = useState('');

  useEffect(()=>{ (async ()=>{ setTemplates(await builder.fetchAuditTemplates()); })(); },[]);

  async function handleCreate() {
    if (!name) return alert('Nom requis');
    await builder.createAuditTemplate({ name, description: '' });
    setTemplates(await builder.fetchAuditTemplates());
    setName('');
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Référentiels d'audit & checklists</h1>
          <div className="text-sm text-muted">Gérer templates, catégories, questions et options de conformité</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold mb-3">Templates</h3>
          <div className="mb-3 flex gap-2">
            <input className="input" placeholder="Nouveau template" value={name} onChange={(e)=>setName(e.target.value)} />
            <button className="btn" onClick={handleCreate}>Ajouter template</button>
          </div>
          <table className="w-full table-auto">
            <thead><tr className="text-left"><th>Nom</th><th>Type</th><th>Actif</th><th>Actions</th></tr></thead>
            <tbody>
              {templates.map(t=> (
                <tr key={t.id} className="border-t"><td className="py-2">{t.name}</td><td>{t.auditType}</td><td>{t.active? 'Oui':'Non'}</td><td><a className="btn-sm" href={`/referentiels/preview/${t.id}`}>Aperçu</a></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Actions rapides</h3>
          <div className="flex flex-col gap-2">
            <a className="btn" href="/referentiels/preview/at_1">Ouvrir preview template exemple</a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
