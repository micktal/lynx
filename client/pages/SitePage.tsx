import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Site, Building } from "@shared/api";
import KpiCard from "../components/KpiCard";
import BuildingCard from "../components/BuildingCard";
import BuildingForm from "../components/BuildingForm";
import ConfirmModal from "../components/ConfirmModal";

export default function SitePage() {
  const { id } = useParams();
  const siteId = id || "";
  const [site, setSite] = useState<Site | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<string | null>(null);
  const [kpis, setKpis] = useState({ buildings: 0, spaces: 0, equipments: 0, risks: 0 });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Building | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [siteConfirmOpen, setSiteConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const sites = await builder.fetchSites();
      const found = sites.find((s) => s.id === siteId) || null;
      setSite(found);
      const allBuildings = await builder.fetchBuildings();
      const myB = allBuildings.filter((b) => b.siteId === siteId);
      setBuildings(myB);
      const stats = await builder.countStatsForSite(siteId);
      setKpis(stats.total);
    })();
  }, [siteId]);

  const usages = useMemo(() => Array.from(new Set(buildings.map((b) => b.mainUse || "Autre"))), [buildings]);

  const filtered = useMemo(() => {
    return buildings.filter((b) => {
      if (query) {
        const q = query.toLowerCase();
        if (!(b.name.toLowerCase().includes(q) || (b.code || "").toLowerCase().includes(q))) return false;
      }
      if (usageFilter && b.mainUse !== usageFilter) return false;
      return true;
    });
  }, [buildings, query, usageFilter]);

  const [perBuildingStats, setPerBuildingStats] = useState<Record<string, { spaces: number; equipments: number; risks: number; lastAudit?: any }>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stats = await builder.countStatsForSite(siteId);
      const map: Record<string, any> = {};
      stats.perBuilding.forEach((p) => {
        map[p.buildingId] = { spaces: p.spaces, equipments: p.equipments, risks: p.risks, lastAudit: p.lastAudit };
      });
      if (mounted) setPerBuildingStats(map);
    })();
    return () => {
      mounted = false;
    };
  }, [buildings, siteId]);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleSave = async (payload: Partial<Building>) => {
    if (editing) {
      const updated = await builder.updateBuilding(editing.id, payload);
      if (updated) setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } else {
      const created = await builder.createBuilding({ ...payload, siteId });
      setBuildings((prev) => [created, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = async (idToDelete?: string) => {
    setConfirmOpen(false);
    const id = idToDelete || toDelete;
    if (!id) return;
    const ok = await builder.deleteBuilding(id);
    if (ok) setBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSiteDelete = async () => {
    if (!site) return;
    // only allow delete if no buildings
    if (buildings.length > 0) {
      alert("Impossible de supprimer un site avec des bâtiments. Supprimez les bâtiments d'abord.");
      setSiteConfirmOpen(false);
      return;
    }
    const ok = await builder.deleteSite(site.id);
    if (ok) {
      // redirect to home
      window.location.href = "/";
    }
  };

  if (!site) {
    return (
      <Layout>
        <div className="card">
          <h1 className="text-2xl font-bold">Site introuvable</h1>
          <p className="text-sm text-muted mt-2">Le site demandé est introuvable.</p>
          <div className="mt-4">
            <Link to="/" className="px-3 py-2 rounded-md border border-border">Retour</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <div className="text-sm text-muted mt-1">{site.address} • {site.city}, {site.country}</div>
          <div className="text-sm text-muted mt-1">Contact: <a className="text-primary-foreground underline" href={`mailto:${site.contactEmail}`}>{site.contactName} ({site.contactEmail})</a></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { /* open site edit modal - reuse SiteForm */ alert('Modifier le site via le modal (à implémenter)'); }} className="px-3 py-2 rounded-md border border-border">Modifier le site</button>
          <button onClick={() => setSiteConfirmOpen(true)} className="px-3 py-2 rounded-md border border-border text-destructive">Supprimer le site</button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Bâtiments" value={kpis.buildings} icon={<span>🏗️</span>} />
        <KpiCard title="Espaces" value={kpis.spaces} icon={<span>📍</span>} />
        <KpiCard title="Équipements" value={kpis.equipments} icon={<span>🔧</span>} />
        <KpiCard title="Risques" value={kpis.risks} icon={<span>⚠️</span>} />
      </section>

      <section className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un bâtiment..." className="px-3 py-2 rounded-md border border-border bg-input w-64" />
            <select value={usageFilter ?? ""} onChange={(e) => setUsageFilter(e.target.value || null)} className="px-3 py-2 rounded-md border border-border bg-input">
              <option value="">Tous usages</option>
              {usages.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div>
            <button onClick={handleAdd} className="brand-btn">Ajouter un bâtiment</button>
          </div>
        </div>
      </section>

      <section>
        {filtered.length === 0 ? (
          <div className="card text-center py-10">
            <img src="/placeholder.svg" alt="empty" className="mx-auto w-48 opacity-60" />
            <h3 className="text-lg font-semibold mt-4">Aucun bâtiment encore enregistré</h3>
            <p className="text-sm text-muted mt-2">Ajoutez votre premier bâtiment pour commencer l’analyse de ce site.</p>
            <div className="mt-4">
              <button onClick={handleAdd} className="brand-btn">Ajouter un bâtiment</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <BuildingCard
                key={b.id}
                building={b}
                stats={perBuildingStats[b.id] || { spaces: 0, equipments: 0, risks: 0 }}
                onEdit={() => { setEditing(b); setFormOpen(true); }}
                onDelete={() => { setToDelete(b.id); setConfirmOpen(true); }}
              />
            ))}
          </div>
        )}
      </section>

      <BuildingForm initial={editing} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
      <ConfirmModal open={confirmOpen} title="Confirmer la suppression" description="Voulez-vous supprimer ce bâtiment ?" onCancel={() => setConfirmOpen(false)} onConfirm={() => handleDelete()} />
      <ConfirmModal open={siteConfirmOpen} title="Supprimer le site" description="Voulez-vous supprimer ce site ? Tous les bâtiments seront supprimés." onCancel={() => setSiteConfirmOpen(false)} onConfirm={() => handleSiteDelete()} />
    </Layout>
  );
}
