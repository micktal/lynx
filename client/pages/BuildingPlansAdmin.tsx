import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { BuildingPlan } from "@shared/api";

export default function BuildingPlansAdmin() {
  const { id } = useParams();
  const buildingId = id || "";
  const [plans, setPlans] = useState<BuildingPlan[]>([]);
  const [form, setForm] = useState<Partial<BuildingPlan>>({ isDefault: false });

  useEffect(() => {
    (async () => {
      if (!buildingId) return;
      const pls = await builder.fetchBuildingPlans(buildingId);
      setPlans(pls);
    })();
  }, [buildingId]);

  async function handleCreate() {
    if (!form.name || !form.svgContent) return alert('Nom et SVG requis');
    await builder.createBuildingPlan({ ...form, buildingId });
    const pls = await builder.fetchBuildingPlans(buildingId);
    setPlans(pls);
    setForm({ isDefault: false });
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce plan ?')) return;
    await builder.deleteBuildingPlan(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des plans</h1>
          <div className="text-sm text-muted">Bâtiment: {buildingId}</div>
        </div>
        <div>
          <Link to={`/building/${buildingId}`} className="btn">Retour au bâtiment</Link>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-2">Ajouter un plan</h3>
        <div className="grid grid-cols-1 gap-2">
          <input className="input" placeholder="Nom (ex: RDC)" value={form.name || ""} onChange={(e)=>setForm({...form,name:e.target.value})} />
          <input className="input" placeholder="Étage (ex: RDC)" value={(form.floor as any) || ""} onChange={(e)=>setForm({...form,floor:e.target.value})} />
          <label className="text-sm">SVG brut</label>
          <textarea className="input h-36" value={form.svgContent || ""} onChange={(e)=>setForm({...form,svgContent:e.target.value})} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.isDefault} onChange={(e)=>setForm({...form,isDefault:e.target.checked})} /> Plan par défaut</label>
          <div className="flex justify-end">
            <button className="btn" onClick={handleCreate}>Créer le plan</button>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Plans existants</h3>
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left"><th>Nom</th><th>Étage</th><th>Par défaut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {plans.map((p)=>(
              <tr key={p.id} className="border-t">
                <td className="py-2">{p.name}</td>
                <td>{p.floor}</td>
                <td>{p.isDefault ? 'Oui' : 'Non'}</td>
                <td><div className="flex gap-2"><a className="btn-sm" href={`/building/${buildingId}?plan=${p.id}`}>Ouvrir</a><button className="btn-sm btn-danger" onClick={()=>handleDelete(p.id)}>Supprimer</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
