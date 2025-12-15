import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import * as builder from "../lib/builderService";
import type { Audit } from "@shared/api";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statusBadge = (s: string | undefined) => {
    const status = (s || "").toLowerCase();
    switch (status) {
      case "completed":
      case "done":
        return (
          <span
            className="px-2 py-1 rounded text-white text-xs"
            style={{ background: "#16a34a" }}
          >
            ✓ {s}
          </span>
        );
      case "in_progress":
      case "in-progress":
      case "ongoing":
        return (
          <span
            className="px-2 py-1 rounded text-white text-xs"
            style={{ background: "#f59e0b" }}
          >
            ● {s}
          </span>
        );
      case "planned":
      case "draft":
        return (
          <span
            className="px-2 py-1 rounded text-black text-xs"
            style={{ background: "#93c5fd" }}
          >
            {s}
          </span>
        );
      case "cancelled":
      case "canceled":
        return (
          <span
            className="px-2 py-1 rounded text-white text-xs"
            style={{ background: "#ef4444" }}
          >
            {s}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded text-sm border border-border text-sm">
            {s || "—"}
          </span>
        );
    }
  };

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
            <p className="text-sm" style={{ color: "var(--text)" }}>
              Liste des audits disponibles
            </p>
          </div>
        </div>
      </div>

      <section>
        {loading ? (
          <div className="card">
            <div className="text-sm" style={{ color: "var(--text)" }}>
              Chargement...
            </div>
            <div className="mt-3">
              <LoadingSkeleton lines={4} />
            </div>
          </div>
        ) : audits.length === 0 ? (
          <div className="card text-center" style={{ color: "var(--text)" }}>
            <div className="text-lg font-semibold">Aucun audit trouvé</div>
            <div className="text-sm mt-2 mb-4">
              Il n'y a pas d'audits disponibles pour le moment.
            </div>
            <div>
              <button
                onClick={() => navigate("/audit/new")}
                className="btn-primary btn-sm"
              >
                Créer un audit
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audits.map((a) => (
              <div
                key={a.id}
                className="card card-clickable cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/audit/${a.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    navigate(`/audit/${a.id}`);
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {a.title || `Audit ${a.id}`}
                    </h3>
                    <div
                      className="text-sm mt-1"
                      style={{ color: "var(--text)" }}
                    >
                      Statut:{" "}
                      <span style={{ marginLeft: 6 }}>
                        {statusBadge(a.status)}
                      </span>
                    </div>
                    <div className="text-sm" style={{ color: "var(--text)" }}>
                      Site: {a.siteId}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Link
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Ouvrir audit ${a.title || a.id}`}
                      to={`/audit/${a.id}`}
                      className="btn-primary btn-sm"
                    >
                      Ouvrir
                    </Link>
                    <Link
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Voir les détails de l'audit ${a.title || a.id}`}
                      to={`/audit/${a.id}#details`}
                      className="btn btn-sm"
                    >
                      Détails
                    </Link>
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
