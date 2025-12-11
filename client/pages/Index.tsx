import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import SiteCard from "../components/SiteCard";
import type { Site } from "@shared/api";

const MOCK_SITES: Site[] = [
  {
    id: "site_1",
    organisationId: "org_1",
    name: "Siège Social - Paris",
    address: "12 Rue de la Paix",
    city: "Paris",
    country: "France",
  },
  {
    id: "site_2",
    organisationId: "org_1",
    name: "Entrepôt - Lyon",
    address: "45 Av. Industrielle",
    city: "Lyon",
    country: "France",
  },
  {
    id: "site_3",
    organisationId: "org_2",
    name: "Centre de Données - Bordeaux",
    address: "Parc Tech",
    city: "Bordeaux",
    country: "France",
  },
];

export default function Index() {
  const [query, setQuery] = useState("");
  const [sites, setSites] = useState<Site[]>(MOCK_SITES);

  const filtered = useMemo(() => {
    if (!query) return sites;
    const q = query.toLowerCase();
    return sites.filter((s) => s.name.toLowerCase().includes(q) || (s.city || "").toLowerCase().includes(q));
  }, [query, sites]);

  const handleCreate = () => {
    const name = prompt("Nom du site");
    if (!name) return;
    const newSite: Site = {
      id: `site_${Date.now()}`,
      organisationId: "org_1",
      name,
      address: "",
      city: "",
      country: "",
    };
    setSites((s) => [newSite, ...s]);
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sites</h1>
          <p className="text-sm text-muted mt-1">Gérez vos sites, bâtiments, espaces, équipements et audits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un site, ville..."
              className="px-4 py-2 rounded-md border border-border bg-input text-sm w-64"
            />
          </div>
          <button onClick={handleCreate} className="brand-btn">
            Nouveau site
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Points clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-sm text-muted">Équipements totaux</div>
            <div className="mt-2 text-2xl font-bold">1,248</div>
            <div className="text-sm text-muted mt-2">Filtrer par état et catégorie dans Synthèse</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted">Risques ouverts</div>
            <div className="mt-2 text-2xl font-bold text-destructive">32</div>
            <div className="text-sm text-muted mt-2">Priorité: Critique / Important</div>
          </div>
          <div className="card">
            <div className="text-sm text-muted">Actions en retard</div>
            <div className="mt-2 text-2xl font-bold">7</div>
            <div className="text-sm text-muted mt-2">Suivi et assignation disponibles sur chaque audit</div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
