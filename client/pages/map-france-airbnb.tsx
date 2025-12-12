import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import * as builder from '../lib/builderService';
import type { Site } from '@shared/api';

export default function MapFranceAirbnb(): JSX.Element {
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const heatRef = useRef<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [heatOn, setHeatOn] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const l = document.createElement('link');
      l.id = cssId;
      l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }

    const promises: Promise<void>[] = [];
    function loadScript(src: string, id: string) {
      return new Promise<void>((res) => {
        if (document.getElementById(id)) return res();
        const s = document.createElement('script');
        s.src = src;
        s.id = id;
        s.onload = () => res();
        document.body.appendChild(s);
      });
    }

    promises.push(loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', 'leaflet-js'));
    promises.push(loadScript('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js', 'leaflet-cluster-js'));
    promises.push(loadScript('https://unpkg.com/leaflet.heat/dist/leaflet-heat.js', 'leaflet-heat-js'));

    Promise.all(promises).then(init).catch(console.error);

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };

    async function init() {
      const [s, c] = await Promise.all([builder.fetchSitesWithScores(), builder.fetchClients()]);
      setSites(s || []);
      setClients(c || []);

      // @ts-ignore
      const L = (window as any).L;
      if (!L) return;

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
      }

      mapRef.current = L.map('map-airbnb-root', { preferCanvas: true }).setView([46.5, 2.5], 5);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { attribution: '&copy; CARTO', maxZoom: 19 }).addTo(mapRef.current);

      render();

      mapRef.current.on('zoomend', () => {
        render();
      });
    }

    function render() {
      // @ts-ignore
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // clear previous
      try {
        if (clusterRef.current) { clusterRef.current.clearLayers(); clusterRef.current = null; }
      } catch (e) {}
      try { if (heatRef.current) { mapRef.current.removeLayer(heatRef.current); heatRef.current = null; } } catch (e) {}

      const zoom = mapRef.current.getZoom();
      const filtered = (sites || []).filter(s => s.lat && s.lng && (s.scoreCriticite || 0) >= minScore);

      // choose granularity by zoom
      // zoom < 6: regions (we fall back to markercluster grouping)
      // 6-8: departments
      // 8-11: cities
      // >11: sites

      // marker cluster group with custom icon
      // @ts-ignore
      const mcg = (L as any).markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false,
        iconCreateFunction: function(cluster: any) {
          const count = cluster.getChildCount();
          const avg = Math.round((cluster.getAllChildMarkers().reduce((a: number, m: any) => a + (m.options._score || 0), 0) / Math.max(1, count)) * 10) / 10;
          const color = avg < 10 ? '#16a34a' : (avg < 30 ? '#f59e0b' : '#dc2626');
          // size rule
          const size = count >= 200 ? 70 : count >= 50 ? 56 : count >= 10 ? 44 : 32;
          const classNames = ['airbnb-cluster', `airbnb-cluster-${size}`];
          if (avg > 30) classNames.push('airbnb-cluster-pulse');

          const html = `<div class="${classNames.join(' ')}" style="background: linear-gradient(135deg, rgba(255,255,255,0.06), ${color}); width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow: 0 10px 24px rgba(2,6,23,0.45);border: 2px solid rgba(255,255,255,0.06); font-weight:700; color:white;">${count}</div>`;
          return L.divIcon({ html, className: 'airbnb-cluster-wrap', iconSize: [size, size] });
        }
      });

      // create site markers
      for (const s of filtered) {
        const score = s.scoreCriticite || 0;
        const statusColor = s.status === 'FINISHED' ? '#0FBF7F' : s.status === 'IN_PROGRESS' ? '#FFB020' : '#9CA3AF';
        const size = 18 + Math.min(10, Math.round(Math.log(score + 1) * 4));
        const html = `<div class="airbnb-marker" style="width:${size}px;height:${size}px;border-radius:50%;background:${statusColor};box-shadow:0 8px 20px rgba(2,6,23,0.48);border:2px solid rgba(0,0,0,0.18)"></div>`;
        // @ts-ignore
        const icon = L.divIcon({ html, className: 'airbnb-marker-wrap', iconSize: [size, size], iconAnchor: [size/2, size/2] });
        const marker = L.marker([s.lat!, s.lng!], { icon, _score: score });
        const clientName = clients.find((c: any) => c.id === s.clientId)?.name || '—';
        marker.bindTooltip(`<strong>${s.name}</strong><br/>Client: ${clientName}<br/>Progression: ${s.progressionTravaux || 0}%<br/>Risques critiques: ${s.nbRisquesCritiques||0}<br/>Actions en retard: ${s.nbActionsEnRetard||0}`);
        marker.on('click', () => setSelectedSite(s));
        mcg.addLayer(marker);
      }

      clusterRef.current = mcg;
      mapRef.current.addLayer(mcg);

      mcg.on('clusterclick', (ev: any) => {
        try {
          const count = ev.layer.getChildCount();
          const targetZoom = count >= 200 ? Math.min(mapRef.current.getMaxZoom(), mapRef.current.getZoom() + 4)
            : count >= 50 ? Math.min(mapRef.current.getMaxZoom(), mapRef.current.getZoom() + 3)
            : count >= 10 ? Math.min(mapRef.current.getMaxZoom(), mapRef.current.getZoom() + 2)
            : Math.min(mapRef.current.getMaxZoom(), mapRef.current.getZoom() + 1);
          // animate zoom
          mapRef.current.flyToBounds(ev.layer.getBounds().pad(0.4), { duration: 0.6, easeLinearity: 0.25 });
        } catch (e) {}
      });

      // heat
      if (heatOn) {
        const max = Math.max(1, ...filtered.map(s => s.scoreCriticite || 0));
        const heatPoints = filtered.map(s => [s.lat!, s.lng!, Math.max(0.05, (s.scoreCriticite || 0) / max)]);
        try {
          // @ts-ignore
          heatRef.current = (window as any).L.heatLayer(heatPoints, { radius: 30, blur: 30, maxZoom: 13, gradient: {0.1:'#16a34a',0.3:'#facc15',0.6:'#f97316',1:'#dc2626'} });
          heatRef.current.addTo(mapRef.current);
          // add breathing effect by toggling canvas opacity via CSS class
          setTimeout(() => {
            const canv = mapRef.current.getContainer().querySelector('.leaflet-heatmap-layer, canvas');
            if (canv && (canv as HTMLElement).style) (canv as HTMLElement).classList.add('heat-breathe');
          }, 50);
        } catch (e) { console.warn(e); }
      }
    }

  }, [sites, heatOn, minScore]);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Carte France — Clusters animés (Airbnb-like)</h1>
          <div className="text-sm text-muted">Navigation multi-niveaux, clusters animés, heatmap</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={async ()=>{ const s = await builder.fetchSitesWithScores(); setSites(s); }}>Rafraîchir</button>
          <button className="btn" onClick={()=>{ if (mapRef.current) mapRef.current.setView([46.5,2.5],5); }}>Reset</button>
        </div>
      </div>

      <div className="card mb-4 flex items-center gap-4">
        <div>
          <label className="text-sm text-muted">Filtrer criticité min</label>
          <input type="range" min={0} max={100} value={minScore} onChange={(e)=>setMinScore(Number(e.target.value))} />
        </div>
        <div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={heatOn} onChange={(e)=>setHeatOn(e.target.checked)} /> Afficher heatmap</label>
        </div>
      </div>

      <div id="map-airbnb-root" style={{ height: 760, borderRadius: 16, overflow: 'hidden' }} />

      {selectedSite && (
        <div className="fixed right-6 top-20 w-96 bg-card p-6 rounded-3xl shadow-xl airbnb-drawer" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{selectedSite.name}</h3>
              <div className="text-sm text-muted">{clients.find(c=>c.id===selectedSite.clientId)?.name || '—'}</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={()=>setSelectedSite(null)}>Fermer</button>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted">État chantier</div>
            <div className="font-medium">{selectedSite.status} {selectedSite.progressionTravaux ? `— ${selectedSite.progressionTravaux}%` : ''}</div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">KPIs</div>
              <div className="flex gap-4 mt-2">
                <div>
                  <div className="text-xs text-muted">Risques critiques</div>
                  <div className="font-semibold">{selectedSite.nbRisquesCritiques||0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Actions en retard</div>
                  <div className="font-semibold">{selectedSite.nbActionsEnRetard||0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Incidents ouverts</div>
                  <div className="font-semibold">{selectedSite.nbIncidentsOuverts||0}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">Score criticité</div>
              <div className="font-semibold text-xl">{selectedSite.scoreCriticite || 0}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <a className="btn-premium" href={`/site/${selectedSite.id}`}>Voir la fiche site</a>
            <a className="btn-ghost" href={`/audit/${selectedSite.id}`}>Voir audit</a>
            <a className="btn-ghost" href={`/actions?site=${selectedSite.id}`}>Voir actions</a>
          </div>
        </div>
      )}

    </Layout>
  );
}
