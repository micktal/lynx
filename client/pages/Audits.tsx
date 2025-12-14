import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import * as builder from "../lib/builderService";
import type { Audit } from "@shared/api";

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await builder.fetchAudits();
        if (mounted) setAudits(a);
      } catch (e) {
        console.error("Failed to load audits", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audits</h1>
            <p className="text-sm text-muted mt-1">Liste des audits disponibles</p>
          </div>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="card">Chargement...</div>
        ) : audits.length === 0 ? (
          <div className="card text-center">Aucun audit trouvé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audits.map((a) => (
              <div key={a.id} className="card card-clickable">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{a.title || `Audit ${a.id}`}</h3>
                    <div className="text-sm text-muted mt-1">Statut: {a.status}</div>
                    <div className="text-sm text-muted">Site: {a.siteId}</div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Link aria-label={`Ouvrir audit ${a.title || a.id}`} to={`/audit/${a.id}`} className="btn-primary btn-sm">Ouvrir</Link>
                    <Link aria-label={`Voir les détails de l'audit ${a.title || a.id}`} to={`/audit/${a.id}#details`} className="btn btn-sm">Détails</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
