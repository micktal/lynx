import React from "react";
import Layout from "../components/Layout";

export default function Synthese() {
  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-bold">Synthèse</h1>
        <p className="text-sm text-muted mt-2">Tableaux de synthèse des équipements et risques. Filtres et export Excel à venir.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tableau équipements</h3>
              <button className="px-3 py-1 rounded text-sm border border-border">Exporter Excel</button>
            </div>
            <div className="mt-4 text-sm text-muted">Tableau triable des équipements par état et catégorie (placeholder)</div>
          </div>

          <div className="card">
            <h3 className="font-semibold">Tableau risques</h3>
            <div className="mt-4 text-sm text-muted">Tableau triable des risques avec filtres par espace, probabilité, impact (placeholder)</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
