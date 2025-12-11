import React, { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import type { Site } from "@shared/api";

export default function MapPage() {
  const mapRef = useRef<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showFinished, setShowFinished] = useState(true);
  const [showNotStarted, setShowNotStarted] = useState(true);
  const [onlyWithActionsLate, setOnlyWithActionsLate] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  useEffect(() => {
    // load leaflet css and script dynamically
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const scriptId = 'leaflet-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    async function initMap() {
      // fetch sites with computed scores
      const s = await builder.fetchSitesWithScores();
      setSites(s);

      // create map
      // @ts-ignore
      const L = (window as any).L;
      if (!L) return;
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = L.map('map-root').setView([48.8566, 2.3522], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      renderLayers(s);
    }

    // cleanup
    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  async function refresh() {
    const s = await builder.fetchSitesWithScores();
    setSites(s);
    renderLayers(s);
  }

  function colorForStatus(status?: string) {
    if (status === 'IN_PROGRESS') return '#FFB020';
    if (status === 'FINISHED') return '#0FBF7F';
    return '#CBD5E0';
  }

  function colorForScore(score = 0) {
    if (score >= 20) return 'rgba(220,38,38,0.8)'; // red
    if (score >= 8) return 'rgba(255,160,0,0.7)'; // orange
    return 'rgba(34,197,94,0.6)'; // green
  }

  function renderLayers(sitesData: Site[]) {
    // @ts-ignore
    const L = (window as any).L;
    if (!L || !mapRef.current) return;
    // clear existing layers
    (mapRef.current as any)._layers && Object.values((mapRef.current as any)._layers).forEach((layer: any) => {
      try { if (layer && layer._latlng) mapRef.current.removeLayer(layer); } catch (e) {}
    });

    const filtered = sitesData.filter(site => {
      if (!site.lat || !site.lng) return false;
      if (site.scoreCriticite === undefined) site.scoreCriticite = 0;
      if (site.scoreCriticite < minScore) return false;
      if (onlyWithActionsLate) {
        // approximate by checking if site has a non-zero criticity score (actions late typically increase score)
        if (!(site.scoreCriticite && site.scoreCriticite > 0)) return false;
      }
      if (site.status==='IN_PROGRESS' && !showInProgress) return false;
      if (site.status==='FINISHED' && !showFinished) return false;
      if (site.status==='NOT_STARTED' && !showNotStarted) return false;
      return true;
    });

    for (const site of filtered) {
      const marker = L.circleMarker([site.lat!, site.lng!], { radius: 8, color: colorForStatus(site.status), fillColor: colorForStatus(site.status), fillOpacity: 1 }).addTo(mapRef.current);
      marker.bindTooltip(`<strong>${site.name}</strong><br/>Progression: ${site.progressionTravaux || 0}%<br/>Score: ${site.scoreCriticite || 0}`);
      marker.on('click', ()=> setSelectedSite(site));

      // circle proportional to score
      const rad = Math.min(20000, (site.scoreCriticite || 0) * 2000);
      const circle = L.circle([site.lat!, site.lng!], { radius: rad, color: colorForScore(site.scoreCriticite), fillColor: colorForScore(site.scoreCriticite), fillOpacity: 0.2 }).addTo(mapRef.current);
    }

    // fit bounds
    const group = L.featureGroup(filtered.map(s=> L.marker([s.lat!, s.lng!])));
    if (filtered.length) mapRef.current.fitBounds(group.getBounds().pad(0.5));
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Vue géographique des sites & chantiers</h1>
          <div className="text-sm text-muted">Carte interactive avec heatmap de criticité</div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={refresh}>Rafraîchir</button>
          <button className="btn">Plein écran</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-3 flex-wrap items-center">
          <label><input type="checkbox" checked={showInProgress} onChange={(e)=>setShowInProgress(e.target.checked)} /> En cours</label>
          <label><input type="checkbox" checked={showFinished} onChange={(e)=>setShowFinished(e.target.checked)} /> Terminés</label>
          <label><input type="checkbox" checked={showNotStarted} onChange={(e)=>setShowNotStarted(e.target.checked)} /> Non démarrés</label>
          <label><input type="checkbox" checked={onlyWithActionsLate} onChange={(e)=>setOnlyWithActionsLate(e.target.checked)} /> Actions en retard</label>
          <div className="flex items-center gap-2">
            <div>Criticité min:</div>
            <input type="range" min={0} max={50} value={minScore} onChange={(e)=>setMinScore(Number(e.target.value))} />
            <div className="text-sm text-muted">{minScore}</div>
          </div>
        </div>
      </div>

      <div id="map-root" style={{height: '600px', borderRadius: 12, overflow: 'hidden'}} />

      {selectedSite && (
        <div className="card mt-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{selectedSite.name}</h3>
              <div className="text-sm text-muted">{selectedSite.address}</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={()=>setSelectedSite(null)}>Fermer</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-sm text-muted">État</div>
              <div className="font-medium">{selectedSite.status}</div>
              <div className="text-sm text-muted">Progression: {selectedSite.progressionTravaux}%</div>
            </div>
            <div>
              <div className="text-sm text-muted">Score criticité</div>
              <div className="font-medium">{selectedSite.scoreCriticite}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Actions</div>
              <div className="font-medium">Voir actions & risques</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn">Voir la fiche site</button>
            <button className="btn-ghost">Voir l'audit en cours</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
