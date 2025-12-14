import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import SiteCard from "../components/SiteCard";
import KpiCard from "../components/KpiCard";
import FiltersBar from "../components/FiltersBar";
import SiteForm from "../components/SiteForm";
import ConfirmModal from "../components/ConfirmModal";
import { Link } from "react-router-dom";
import type { Site } from "@shared/api";
import * as builder from "../lib/builderService";

export default function Index() {
  const [sites, setSites] = useState<Site[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [buildingsMax, setBuildingsMax] = useState(10);
  const [kpis, setKpis] = useState({ sites: 0, buildings: 0, spaces: 0, equipments: 0 });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await builder.fetchSites();
      setSites(s);
      const cnt = await builder.countBySite();
      setKpis(cnt.total);
    })();
  }, []);

  const filtered = useMemo(() => {
    return sites.filter((s) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(s.name.toLowerCase().includes(q) || (s.city || "").toLowerCase().includes(q) || (s.contactName || "").toLowerCase().includes(q))) return false;
      }
      if (country && s.country !== country) return false;
      if (city && s.city !== city) return false;
      return true;
    });
  }, [sites, query, country, city]);

  // calculate per-site counts and apply buildingsMax filter
  const perSiteCounts = useMemo(async () => {
    const data = await builder.countBySite();
    return data.perSite.reduce((acc: Record<string, { buildings: number; spaces: number; equipments: number }>, cur) => {
      acc[cur.siteId] = { buildings: cur.buildings, spaces: cur.spaces, equipments: cur.equipments };
      return acc;
    }, {} as Record<string, { buildings: number; spaces: number; equipments: number }>);
  }, [sites]);

  const [countsMap, setCountsMap] = useState<Record<string, { buildings: number; spaces: number; equipments: number }>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await builder.countBySite();
      const map = data.perSite.reduce((acc: Record<string, { buildings: number; spaces: number; equipments: number }>, cur) => {
        acc[cur.siteId] = { buildings: cur.buildings, spaces: cur.spaces, equipments: cur.equipments };
        return acc;
      }, {} as Record<string, { buildings: number; spaces: number; equipments: number }>);
      if (mounted) setCountsMap(map);
    })();
    return () => {
      mounted = false;
    };
  }, [sites]);

  const visible = filtered.filter((s) => {
    const counts = countsMap[s.id] || { buildings: 0 };
    return counts.buildings <= buildingsMax;
  });

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSave = async (payload: Partial<Site>) => {
    if (editing) {
      const updated = await builder.updateSite(editing.id, payload);
      setSites((prev) => prev.map((p) => (p.id === editing.id && updated ? updated : p)));
    } else {
      const created = await builder.createSite(payload);
      setSites((prev) => [created, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    setConfirmOpen(false);
    if (!id) return;
    const ok = await builder.deleteSite(id);
    if (ok) setSites((prev) => prev.filter((s) => s.id !== id));
    setToDelete(null);
  };

  const exportCsv = () => {
    const rows = visible.map((s) => [s.id, s.name, s.city, s.country, s.address].map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(","));
    const csv = ["id,name,city,country,address", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sites.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="mb-6">
        <div className="card mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sites & Bâtiments – Gestion Sécurité</h1>
            <p className="text-sm text-muted mt-2">Accédez aux sites pour consulter bâtiments, espaces, équipements et gérer vos audits.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button type="button" aria-label="Créer un site" onClick={handleCreate} className="btn-primary px-4 py-2 rounded-md text-sm w-full sm:w-auto">Créer un site</button>
            <button type="button" aria-label="Exporter la liste de sites en CSV" onClick={exportCsv} className="btn px-3 py-2 rounded-md text-sm border border-border w-full sm:w-auto">Exporter CSV</button>
            <Link aria-label="Voir la carte France" to="/map-france" className="btn-ghost px-3 py-2 rounded-md text-sm w-full sm:w-auto">Voir la carte</Link>
          </div>
        </div>

        <FiltersBar
          sites={sites}
          country={country}
          setCountry={setCountry}
          city={city}
          setCity={setCity}
          buildingsMax={buildingsMax}
          setBuildingsMax={setBuildingsMax}
          query={query}
          setQuery={setQuery}
          onExport={exportCsv}
        />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Sites total" value={kpis.sites} icon={<span>🏢</span>} />
        <KpiCard title="Bâtiments total" value={kpis.buildings} icon={<span>🏗️</span>} />
        <KpiCard title="Espaces total" value={kpis.spaces} icon={<span>📍</span>} />
        <KpiCard title="Équipements total" value={kpis.equipments} icon={<span>🔧</span>} />
      </section>

      <section>
        {visible.length === 0 ? (
          <div className="card text-center py-10">
            <img src="/placeholder.svg" alt="empty" loading="lazy" className="mx-auto w-48 opacity-60" />
            <h3 className="text-lg font-semibold mt-4">Aucun site pour le moment</h3>
            <p className="text-sm text-muted mt-2">Vous pouvez créer votre premier site pour commencer vos audits.</p>
            <div className="mt-4">
              <button onClick={handleCreate} className="brand-btn">
                Créer un site
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((site) => (
              <div key={site.id} className="card flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{site.name}</h3>
                      <div className="text-sm text-muted">{site.city ? `${site.city}, ${site.country}` : site.country}</div>
                      <div className="mt-2 inline-block text-xs px-2 py-1 rounded-md bg-green-100 text-green-800">Actif</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted">Bâtiments</div>
                      <div className="text-xl font-bold">{countsMap[site.id]?.buildings ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-muted/30 rounded-md">
                      <div className="text-xs text-muted">Bâtiments</div>
                      <div className="font-semibold">{countsMap[site.id]?.buildings ?? 0}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <div className="text-xs text-muted">Espaces</div>
                      <div className="font-semibold">{countsMap[site.id]?.spaces ?? 0}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <div className="text-xs text-muted">Équipements</div>
                      <div className="font-semibold">{countsMap[site.id]?.equipments ?? 0}</div>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-md">
                      <div className="text-xs text-muted">Risques ouverts</div>
                      <div className="font-semibold text-destructive">{Math.floor(Math.random() * 10)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/site/${site.id}`} className="px-3 py-2 rounded-md text-sm border border-border">
                    Ouvrir le site
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(site);
                        setFormOpen(true);
                      }}
                      title="Modifier"
                      className="px-2 py-2 rounded-md border border-border text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        setToDelete(site.id);
                        setConfirmOpen(true);
                      }}
                      title="Supprimer"
                      className="px-2 py-2 rounded-md border border-border text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteForm initial={editing} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer ce site ?" onCancel={() => setConfirmOpen(false)} onConfirm={() => handleDelete(toDelete!)} />
    </Layout>
  );
}
