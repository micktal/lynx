import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(()=>{ (async ()=>{ setClients(await builder.fetchClients()); })(); },[]);

  async function handleCreate() {
    if (!name) return alert('Nom requis');
    await builder.createClient({ name });
    setClients(await builder.fetchClients());
    setName('');
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des clients</h1>
          <div className="text-sm text-muted">Créer et gérer les portails clients</div>
        </div>
        <div>
          <button className="btn">+ Ajouter un client</button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex gap-2">
          <input className="input" placeholder="Nom client" value={name} onChange={(e)=>setName(e.target.value)} />
          <button className="btn" onClick={handleCreate}>Créer</button>
        </div>
      </div>

      <div className="card p-4">
        <table className="w-full table-auto">
          <thead><tr className="text-left"><th>Logo</th><th>Nom</th><th>Secteur</th><th>Sites</th><th>Utilisateurs</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {clients.map(c=> (
              <tr key={c.id} className="border-t">
                <td className="py-2"><img src={c.logoUrl||'/placeholder.svg'} alt="logo" style={{width:40}}/></td>
                <td>{c.name}</td>
                <td>{c.industry||'-'}</td>
                <td>-</td>
                <td>-</td>
                <td>{c.active? 'Actif':'Archivé'}</td>
                <td><a className="btn-sm" href={`/clients/${c.id}`}>Ouvrir</a> <a className="btn-sm" href={`/client-portal?clientId=${c.id}`}>Portail</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
