import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function ClientDetail() {
  const { id } = useParams();
  const clientId = id || '';
  const [client, setClient] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      if (!clientId) return;
      const cls = await builder.fetchClients();
      setClient(cls.find((c:any)=>c.id===clientId) || null);
      const s = (await builder.fetchSites()).filter((st)=>st.clientId===clientId);
      setSites(s);
      const us = await builder.fetchClientUsers(clientId);
      setUsers(us);
    })();
  },[clientId]);

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client: {client?.name}</h1>
          <div className="text-sm text-muted">Contact: {client?.contactName} • {client?.contactEmail}</div>
        </div>
        <div>
          <Link to="/clients" className="btn">Retour</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card p-4 md:col-span-2">
          <h3 className="font-semibold mb-2">Sites associés</h3>
          <table className="w-full table-auto">
            <thead><tr className="text-left"><th>Nom</th><th>Adresse</th><th>Bâtiments</th><th>Actions</th></tr></thead>
            <tbody>
              {sites.map(s=> (
                <tr key={s.id} className="border-t"><td className="py-2">{s.name}</td><td>{s.address}</td><td>-</td><td><a className="btn-sm" href={`/site/${s.id}`}>Ouvrir</a></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-2">Utilisateurs client</h3>
          <table className="w-full table-auto">
            <thead><tr className="text-left"><th>Nom</th><th>Rôle</th><th>Dernière connexion</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u=> (
                <tr key={u.id} className="border-t"><td className="py-2">{u.userId}</td><td>{u.role}</td><td>-</td><td><button className="btn-sm">Modifier</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Audits récents</h3>
        <div className="text-sm text-muted">Liste des derniers audits pour ce client (mock)</div>
      </div>
    </Layout>
  );
}
