import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function SitePage() {
  const { id } = useParams();
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold">Site</h1>
        <p className="text-sm text-muted mt-2">Détail du site {id} — pages détails, bâtiments et statistiques à implémenter.</p>
        <div className="mt-4">
          <Link to="/" className="px-3 py-2 rounded-md border border-border">Retour aux sites</Link>
        </div>
      </div>
    </Layout>
  );
}
