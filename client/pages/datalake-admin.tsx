import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";

export default function DataLakeAdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [purgeMonths, setPurgeMonths] = useState<number>(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    const s = await builder.fetchDataLakeStats();
    setStats(s);
  }

  async function handlePurge() {
    if (!confirm(`Confirmer la purge des enregistrements antérieurs à ${purgeMonths} mois ? Cette action est irréversible.`)) return;
    setLoading(true);
    const res = await builder.purgeDataLakeOlderThan(purgeMonths);
    setLoading(false);
    alert(`Purge terminée, enregistrements supprimés: ${res.deleted}`);
    await loadStats();
  }

  async function handleExport() {
    const blob = await builder.exportDataLakeAsCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datalake_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Lake & Historisation</h1>
          <div className="text-sm" style={{ color: 'var(--text)' }}>Supervision et administration du Data Lake</div>
          <div className="text-sm mt-2" style={{ color: 'var(--text)' }}>
            Le Data Lake centralise les événements et historiques (logs, mesures, uploads) destinés à l'analyse et au reporting. Cette page permet d'inspecter les volumes, d'exporter des dumps et de purger des données anciennes. En production, la purge doit être lancée via des jobs serveur planifiés et audités.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm" style={{ color: 'var(--text)' }}>Volume total</div>
          <div className="text-2xl font-bold">{stats ? stats.totalRecords : '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm" style={{ color: 'var(--text)' }}>Points time-series</div>
          <div className="text-2xl font-bold">{stats ? stats.timeSeriesPoints : '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm" style={{ color: 'var(--text)' }}>Vues matérialisées</div>
          <div className="text-2xl font-bold">{stats ? stats.materializedViews : '—'}</div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Archivage / Purge</h3>
        <div className="flex gap-2 items-center">
          <select className="input" value={purgeMonths} onChange={(e)=>setPurgeMonths(Number(e.target.value))}>
            <option value={12}>12 mois</option>
            <option value={24}>24 mois</option>
            <option value={36}>36 mois</option>
            <option value={60}>60 mois</option>
          </select>
          <button className="btn" onClick={handlePurge} disabled={loading}>{loading ? 'Purge en cours...' : 'Purger maintenant'}</button>
          <button className="btn-ghost" onClick={async ()=>{await loadStats();}}>Rafraîchir</button>
        </div>
        <div className="text-sm mt-3" style={{ color: 'var(--text)' }}>Note: cette interface simule la purge. En production, mettre en place jobs serveur sécurisés.</div>
      </div>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Exports massifs</h3>
        <div className="flex gap-2">
          <button className="btn" onClick={handleExport}>Exporter Data Lake (CSV)</button>
        </div>
      </div>

    </Layout>
  );
}
