import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import KpiCard from "../components/KpiCard";
import MapOverview from "../components/MapOverview";
import SiteRanking from "../components/SiteRanking";
import * as builder from "../lib/builderService";

import type {
  Site,
  Building,
  Space,
  Equipment,
  Risk,
  ActionItem,
} from "@shared/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState<"heat" | "list">("heat");

  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);

  /* ---------------------------------------------
     LOAD EVERYTHING
  --------------------------------------------- */
  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, b, sp, eq, r, a] = await Promise.all([
        builder.fetchSites(),
        builder.fetchBuildings(),
        builder.fetchSpaces(),
        builder.fetchEquipments(),
        builder.fetchRisks(),
        builder.fetchActions(),
      ]);
      setSites(s);
      setBuildings(b);
      setSpaces(sp);
      setEquipments(eq);
      setRisks(r);
      setActions(a);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ---------------------------------------------
     GLOBAL KPIs
  --------------------------------------------- */
  const totals = useMemo(
    () => ({
      sites: sites.length,
      buildings: buildings.length,
      spaces: spaces.length,
      equipments: equipments.length,
      nonConform: equipments.filter((e) => e.state === "NON_CONFORME").length,
      criticalRisks: risks.filter((r) => r.level === "CRITIQUE").length,
    }),
    [sites, buildings, spaces, equipments, risks],
  );

  /* ---------------------------------------------
     SITE SCORE RANKING (multi-criteria)
  --------------------------------------------- */
  const siteStats = useMemo(() => {
    return sites
      .map((s) => {
        const blds = buildings.filter((b) => b.siteId === s.id);
        const sp = spaces.filter((sp) =>
          blds.some((b) => b.id === sp.buildingId),
        );
        const eq = equipments.filter((e) =>
          sp.some((ss) => ss.id === e.spaceId),
        );

        const rs = risks.filter((r) => r.siteId === s.id);
        const nonConform = eq.filter((e) => e.state === "NON_CONFORME").length;
        const criticalRisks = rs.filter((r) => r.level === "CRITIQUE").length;

        const actionsOpen = actions.filter(
          (a) => a.status === "OUVERTE" && rs.some((r) => r.id === a.riskId),
        ).length;

        // Score composite
        const score = Math.max(
          0,
          Math.round(
            100 - (nonConform * 2 + criticalRisks * 5 + actionsOpen * 1),
          ),
        );

        return { site: s, nonConform, criticalRisks, actionsOpen, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [sites, buildings, spaces, equipments, risks, actions]);

  const rankingList = [
    ...siteStats.slice(0, 5),
    ...siteStats.slice(-5).reverse(),
  ];

  /* ---------------------------------------------
     EXPORT CSV — REAL IMPLEMENTATION
  --------------------------------------------- */
  const exportCSV = () => {
    const rows = [
      ["site", "score", "non_conform", "critical_risks", "actions_open"],
      ...siteStats.map((s) => [
        s.site.name,
        s.score,
        s.nonConform,
        s.criticalRisks,
        s.actionsOpen,
      ]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSite = (id: string) => {
    window.location.href = `/site/${id}`;
  };

  /* ---------------------------------------------
     UI RENDER
  --------------------------------------------- */
  if (loading) {
    return (
      <Layout>
        <div className="card p-8 text-center text-muted">
          Chargement du dashboard…
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Global Sécurité</h1>
          <p className="text-sm text-muted mt-1">
            Vue consolidée sur tous les sites, bâtiments, équipements et
            risques.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="px-3 py-2 rounded-md border border-border"
          >
            🔄 Rafraîchir
          </button>
          <button onClick={exportCSV} className="brand-btn">
            Exporter la synthèse
          </button>

          <div className="ml-4 inline-flex items-center gap-2">
            <button
              onClick={() => setMapView("heat")}
              className={`px-2 py-1 rounded ${mapView === "heat" ? "bg-primary text-white" : "bg-transparent border border-border"}`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setMapView("list")}
              className={`px-2 py-1 rounded ${mapView === "list" ? "bg-primary text-white" : "bg-transparent border border-border"}`}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard title="Sites" value={totals.sites} icon={<span>🌍</span>} />
        <KpiCard
          title="Bâtiments"
          value={totals.buildings}
          icon={<span>🏢</span>}
        />
        <KpiCard title="Espaces" value={totals.spaces} icon={<span>🗂️</span>} />
        <KpiCard
          title="Équipements"
          value={totals.equipments}
          icon={<span>🔧</span>}
        />
        <KpiCard
          title="Non conformes"
          value={totals.nonConform}
          icon={<span>❌</span>}
        />
        <KpiCard
          title="Risques critiques"
          value={totals.criticalRisks}
          icon={<span>🔥</span>}
        />
      </section>

      {/* MAP + RANKING */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <MapOverview
            sites={sites}
            onOpen={handleOpenSite}
            stats={siteStats}
            mode={mapView}
          />
        </div>
        <div className="lg:col-span-1">
          <SiteRanking items={rankingList} onOpen={handleOpenSite} />
        </div>
      </section>

      {/* ANALYTICS PLACEHOLDERS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-3">
            Répartition des risques par niveau
          </h3>
          <div className="text-sm" style={{ color: "#000", fontWeight: 700 }}>
            Bar chart placeholder (data-ready)
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Tendance mensuelle des risques</h3>
          <div className="text-sm" style={{ color: "#000", fontWeight: 700 }}>
            Line chart placeholder (data-ready)
          </div>
        </div>
      </section>

      {/* EQUIPMENTS + ACTIONS GLOBAL */}
      <section className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-3">État global des équipements</h3>
          <div className="text-sm" style={{ color: "#000", fontWeight: 700 }}>
            Donut chart placeholder
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Actions correctives globales</h3>
          <div className="text-sm" style={{ color: "#000", fontWeight: 700 }}>
            Tableau synthétique placeholder
          </div>
        </div>
      </section>

      {/* ALERTS */}
      <section className="mb-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Alertes Immédiates</h3>
          <div className="text-sm" style={{ color: "#000", fontWeight: 700 }}>
            {totals.criticalRisks > 0 || totals.nonConform > 0 ? (
              <>
                {totals.criticalRisks > 0 && (
                  <div className="mb-2">
                    🔥 {totals.criticalRisks} risques critiques actifs
                  </div>
                )}
                {totals.nonConform > 0 && (
                  <div>⚠️ {totals.nonConform} équipements non conformes</div>
                )}
              </>
            ) : (
              <div>Pas d’alerte critique</div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
