import React, { useEffect, useRef, useState, useMemo } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Site } from "@shared/api";

export default function MapFrancePage(): JSX.Element {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const heatRef = useRef<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // filters
  const [clientFilter, setClientFilter] = useState<string | "">("");
  const [showInProgress, setShowInProgress] = useState(true);
  const [showFinished, setShowFinished] = useState(true);
  const [showNotStarted, setShowNotStarted] = useState(true);
  const [onlyWithActionsLate, setOnlyWithActionsLate] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(50);
  const [heatmapOn, setHeatmapOn] = useState(false);

  useEffect(() => {
    // dynamically load leaflet and plugins
    const promises: Promise<void>[] = [];

    function loadCss(href: string, id: string) {
      if (document.getElementById(id)) return;
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.id = id;
      document.head.appendChild(l);
    }

    loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "leaflet-css");
    loadCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css", "leaflet-cluster-css");
    loadCss("https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css", "leaflet-cluster-default-css");

    function loadScript(src: string, id: string) {
      return new Promise<void>((res) => {
        if (document.getElementById(id)) return res();
        const s = document.createElement("script");
        s.src = src;
        s.id = id;
        s.onload = () => res();
        document.body.appendChild(s);
      });
    }

    promises.push(loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "leaflet-js"));
    // markercluster depends on leaflet
    promises.push(loadScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js", "leaflet-cluster-js"));
    // heat plugin
    promises.push(loadScript("https://unpkg.com/leaflet.heat/dist/leaflet-heat.js", "leaflet-heat-js"));

    Promise.all(promises).then(initMap).catch((e) => {
      console.error("Failed to load map libs", e);
    });

    async function initMap() {
      // fetch data
      const [s, c] = await Promise.all([builder.fetchSitesWithScores(), builder.fetchClients()]);
      setSites(s);
      setClients(c || []);

      // create map
      // @ts-ignore
      const L = (window as any).L;
      if (!L) return;

      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
      }

      mapRef.current = L.map("map-france-root", { preferCanvas: true }).setView([46.5, 2.5], 5);

      // Dark tile style (Carto Dark Matter as a reasonable free dark tiles)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      renderLayers(s);
    }

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // update maxScore when sites change
  useEffect(() => {
    const max = Math.max(0, ...sites.map((s) => s.scoreCriticite || 0));
    setMaxScore(Math.max(50, Math.ceil(max)));
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      if (!site.lat || !site.lng) return false;
      const score = site.scoreCriticite || 0;
      if (score < minScore) return false;
      if (clientFilter && site.clientId !== clientFilter) return false;
      if (onlyWithActionsLate) {
        if (!(site.scoreCriticite && site.scoreCriticite > 0)) return false;
      }
      if (site.status === 'IN_PROGRESS' && !showInProgress) return false;
      if (site.status === 'FINISHED' && !showFinished) return false;
      if (site.status === 'NOT_STARTED' && !showNotStarted) return false;
      return true;
    });
  }, [sites, clientFilter, showInProgress, showFinished, showNotStarted, minScore, onlyWithActionsLate]);

  useEffect(() => {
    // whenever filters or sites change, re-render layers
    if (!mapRef.current) return;
    renderLayers(sites);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSites, heatmapOn]);

  function colorForStatus(status?: string) {
    if (status === 'IN_PROGRESS') return '#FFB020';
    if (status === 'FINISHED') return '#0FBF7F';
    return '#9CA3AF';
  }

  function colorForCluster(avg = 0) {
    if (avg < 10) return '#16a34a'; // green
    if (avg < 30) return '#f59e0b'; // orange
    return '#dc2626'; // red
  }

  function renderLayers(sitesData: Site[]) {
    // @ts-ignore
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // remove existing marker cluster and heat
    try {
      if (markersRef.current) {
        markersRef.current.clearLayers();
        markersRef.current = null;
      }
    } catch (e) {}
    try {
      if (heatRef.current) {
        mapRef.current.removeLayer(heatRef.current);
        heatRef.current = null;
      }
    } catch (e) {}

    const points = filteredSites.map((s) => s);

    // create cluster group
    // @ts-ignore
    const markerCluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      iconCreateFunction: function(cluster: any) {
        const children = cluster.getAllChildMarkers();
        const count = children.length;
        const avg = Math.round((children.reduce((acc: number, m: any) => acc + (m.options._score || 0), 0) / Math.max(1, count)) * 10) / 10;
        const color = colorForCluster(avg);
        const size = Math.min(70, 30 + Math.round(Math.log(count + 1) * 8));
        const html = `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0)), ${color}; box-shadow: 0 6px 18px rgba(0,0,0,0.45); border: 2px solid rgba(255,255,255,0.06); color: white; font-weight:600;">${count}</div>`;
        return L.divIcon({ html, className: 'custom-cluster-icon', iconSize: [size, size] });
      }
    });

    // add markers
    for (const s of points) {
      const statusColor = colorForStatus(s.status);
      const score = s.scoreCriticite || 0;
      const size = 14 + Math.min(10, Math.round(Math.log(score + 1) * 4));

      const iconHtml = `
        <div style="width: ${size}px; height: ${size}px; border-radius:50%; background: ${statusColor}; box-shadow: 0 6px 14px rgba(2,6,23,0.5); border: 2px solid rgba(255,255,255,0.06); display:flex;align-items:center;justify-content:center;">
        </div>
      `;

      const icon = L.divIcon({ html: iconHtml, className: 'site-marker-div-icon', iconSize: [size, size], iconAnchor: [size/2, size/2] });

      const marker = L.marker([s.lat!, s.lng!], { icon, _score: score });

      const clientName = clients.find(c=>c.id===s.clientId)?.name || '—';
      const tooltip = `<strong>${s.name}</strong><br/>Client: ${clientName}<br/>Chantier: ${s.status}${typeof s.progressionTravaux === 'number' ? ` (${s.progressionTravaux}%)` : ''}<br/>Risques critiques: ${s['nbRisquesCritiques']||0}<br/>Actions en retard: ${s['nbActionsEnRetard']||0}`;
      marker.bindTooltip(tooltip);
      marker.on('click', () => {
        setSelectedSite(s);
      });

      markerCluster.addLayer(marker);
    }

    markersRef.current = markerCluster;
    mapRef.current.addLayer(markerCluster);

    // cluster click zoom behavior
    markerCluster.on('clusterclick', function (a: any) {
      try {
        mapRef.current.fitBounds(a.layer.getBounds().pad(0.5));
      } catch (e) {}
    });

    // heatmap
    if (heatmapOn) {
      const max = Math.max(1, ...filteredSites.map(s=> s.scoreCriticite || 0));
      const heatPoints = filteredSites.map(s => [s.lat!, s.lng!, Math.max(0.1, (s.scoreCriticite || 0) / max)]);
      try {
        heatRef.current = (L as any).heatLayer(heatPoints, { radius: 25, blur: 30, maxZoom: 13, gradient: {0.1:'#16a34a',0.3:'#facc15',0.6:'#f97316',1:'#dc2626'} });
        heatRef.current.addTo(mapRef.current);
      } catch (e) {
        console.warn('heat plugin not available', e);
      }
    }

    // fit bounds to points if any
    if (filteredSites.length) {
      const group = L.featureGroup(filteredSites.map(s => L.marker([s.lat!, s.lng!])));
      try { mapRef.current.fitBounds(group.getBounds().pad(0.4)); } catch (e) {}
    }
  }

  function openSiteRoute(site: Site, route: string) {
    const href = route.replace('{id}', site.id);
    window.location.href = href;
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Carte France — Sites & chantiers</h1>
          <div className="text-sm text-muted">Clusters, heatmap et filtres en temps réel</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={async ()=>{ const s = await builder.fetchSitesWithScores(); setSites(s); renderLayers(s); }}>Rafraîchir</button>
          <button className="btn" onClick={()=>{ if (mapRef.current) mapRef.current.setView([46.5,2.5],5); }}>Reset vue</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm text-muted block">Client</label>
            <select className="input" value={clientFilter} onChange={(e)=>setClientFilter(e.target.value)}>
              <option value="">Tous</option>
              {clients.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted block">Statut chantier</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={showInProgress} onChange={(e)=>setShowInProgress(e.target.checked)} /> En cours</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showFinished} onChange={(e)=>setShowFinished(e.target.checked)} /> Terminés</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showNotStarted} onChange={(e)=>setShowNotStarted(e.target.checked)} /> Non démarrés</label>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted block">Criticité min</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={maxScore} value={minScore} onChange={(e)=>setMinScore(Number(e.target.value))} />
              <div className="text-sm">{minScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={onlyWithActionsLate} onChange={(e)=>setOnlyWithActionsLate(e.target.checked)} />Uniquement actions en retard</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={heatmapOn} onChange={(e)=>setHeatmapOn(e.target.checked)} />Afficher heatmap</label>
          </div>
        </div>
      </div>

      <div id="map-france-root" style={{ height: 700, borderRadius: 12, overflow: 'hidden' }} />

      {/* Side panel drawer */}
      {selectedSite && (
        <div className="fixed right-6 top-20 w-96 bg-card p-4 rounded-2xl shadow-xl" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
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
            <div className="text-sm text-muted">Adresse</div>
            <div className="font-medium">{selectedSite.address || `${selectedSite.city || ''} ${selectedSite.country || ''}`}</div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">État chantier</div>
              <div className="font-medium">{selectedSite.status} {typeof selectedSite.progressionTravaux === 'number' ? ` — ${selectedSite.progressionTravaux}%` : ''}</div>
            </div>

            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">KPIs</div>
              <div className="flex gap-4 mt-2">
                <div>
                  <div className="text-xs text-muted">Risques critiques</div>
                  <div className="font-semibold">{selectedSite['nbRisquesCritiques']||0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Actions en retard</div>
                  <div className="font-semibold">{selectedSite['nbActionsEnRetard']||0}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Incidents ouverts</div>
                  <div className="font-semibold">{selectedSite['nbIncidentsOuverts']||0}</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">Score criticité</div>
              <div className="font-semibold text-xl">{selectedSite.scoreCriticite || 0}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn" onClick={()=>openSiteRoute(selectedSite, '/site/{id}')}>Voir la fiche site</button>
            <button className="btn-ghost" onClick={()=>openSiteRoute(selectedSite, '/audit/{id}')}>Voir le dernier audit</button>
            <button className="btn-ghost" onClick={()=>openSiteRoute(selectedSite, '/actions?site={id}')}>Voir les actions</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
