import React, { useEffect, useRef, useState, useMemo } from "react";
import Layout from "../components/Layout";
import * as builder from "../lib/builderService";
import {
  fetchRegionsGeoJSON,
  fetchDepartmentsGeoJSON,
} from "../lib/geojsonLoader";
import { supabaseGet } from "../lib/supabaseService";
import type { Site } from "@shared/api";

function generateMockSites() {
  return [
    {
      id: "site-1",
      name: "Site Paris Nord",
      lat: 48.9,
      lng: 2.3,
      region_name: "Île-de-France",
      department_name: "Paris",
      score_criticite: 45,
    },
    {
      id: "site-2",
      name: "Site Lyon Centre",
      lat: 45.76,
      lng: 4.84,
      region_name: "Auvergne-Rhône-Alpes",
      department_name: "Rhône",
      score_criticite: 65,
    },
    {
      id: "site-3",
      name: "Site Marseille Port",
      lat: 43.3,
      lng: 5.37,
      region_name: "Provence-Alpes-Côte d'Azur",
      department_name: "Bouches-du-Rhône",
      score_criticite: 85,
    },
    {
      id: "site-4",
      name: "Site Toulouse",
      lat: 43.6,
      lng: 1.44,
      region_name: "Occitanie",
      department_name: "Haute-Garonne",
      score_criticite: 30,
    },
    {
      id: "site-5",
      name: "Site Bordeaux",
      lat: 44.84,
      lng: -0.57,
      region_name: "Nouvelle-Aquitaine",
      department_name: "Gironde",
      score_criticite: 50,
    },
    {
      id: "site-6",
      name: "Site Lille Nord",
      lat: 50.63,
      lng: 3.06,
      region_name: "Hauts-de-France",
      department_name: "Nord",
      score_criticite: 72,
    },
  ];
}

export default function MapFrancePage(
  props: { sitesData?: any[] } = {},
): JSX.Element {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const heatRef = useRef<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const regionLayerRef = useRef<any>(null);

  // Supabase fetched sites (sitesData variable requested)
  const [sitesData, setSitesData] = useState<any[]>([]);
  const [sitesDataLoading, setSitesDataLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // drilldown mode & current selection
  const [mode, setMode] = useState<"country" | "region" | "department">(
    "country",
  );
  const [currentRegion, setCurrentRegion] = useState<string | null>(null);
  const [currentDepartment, setCurrentDepartment] = useState<string | null>(
    null,
  );

  // filters
  const [clientFilter, setClientFilter] = useState<string | "">("");
  const [showInProgress, setShowInProgress] = useState(true);
  const [showFinished, setShowFinished] = useState(true);
  const [showNotStarted, setShowNotStarted] = useState(true);
  const [onlyWithActionsLate, setOnlyWithActionsLate] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(50);
  const [heatmapOn, setHeatmapOn] = useState(false);

  function getColorFromCriticite(score: number | undefined | null) {
    const s = typeof score === "number" ? score : Number(score || 0);
    if (s >= 80) return "#E02424";
    if (s >= 50) return "#FFB020";
    if (s >= 20) return "#0A84FF";
    return "#10B981";
  }

  const mapInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (mapInitializedRef.current) return;
    mapInitializedRef.current = true;

    // dynamically load leaflet and plugins and initialize map
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
    loadCss(
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
      "leaflet-cluster-css",
    );
    loadCss(
      "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
      "leaflet-cluster-default-css",
    );

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

    promises.push(
      loadScript(
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        "leaflet-js",
      ),
    );
    promises.push(
      loadScript(
        "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
        "leaflet-cluster-js",
      ),
    );
    promises.push(
      loadScript(
        "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js",
        "leaflet-heat-js",
      ),
    );

    const initPromise = Promise.all(promises)
      .then(() => {
        // Wait for DOM to be ready
        const checkDOM = () => {
          const container = document.getElementById("map-france-root");
          if (container && !mapRef.current) {
            initMap();
          } else if (!container) {
            setTimeout(checkDOM, 100);
          }
        };
        checkDOM();
      })
      .catch((e) => {
        console.error("Failed to load map libs", e);
      });

    async function initMap() {
      // Ensure no previous map exists
      const container = document.getElementById("map-france-root");
      if (!container) return;

      // Clear any existing Leaflet instance from the container
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      try {
        // fetch data + geojson boundaries
        const [s, c, r, d, regionsGeo, departmentsGeo] = await Promise.all([
          builder.fetchSitesWithScores(),
          builder.fetchClients(),
          builder.fetchRegions(),
          builder.fetchDepartments(),
          fetchRegionsGeoJSON().catch(() => null),
          fetchDepartmentsGeoJSON().catch(() => null),
        ]);

        setSites(s);
        setClients(c || []);
        setRegions(r || []);
        setDepartments(d || []);

        // store geojson on ref for renderLayers
        (mapRef as any).regionsGeo = regionsGeo;
        (mapRef as any).departmentsGeo = departmentsGeo;

        // create map
        // @ts-ignore
        const L = (window as any).L;
        if (!L) return;

        // Create map instance
        mapRef.current = L.map("map-france-root", { preferCanvas: true, maxZoom: 19 }).setView(
          [46.5, 2.5],
          6,
        );

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://carto.com/">CARTO</a> contributors',
            maxZoom: 19,
          },
        ).addTo(mapRef.current);

        // re-render when zoom changes so we can switch between regional and site views
        mapRef.current.on("zoomend", () => {
          const z = mapRef.current.getZoom();
          if (z <= 6) {
            setMode("country");
            setCurrentRegion(null);
            setCurrentDepartment(null);
          }
          renderLayers();
        });

        // Set initial mock data so regions show with content
        setSitesData(generateMockSites());

        // initial render
        renderLayers();

        // fetch supabase sites initially only when Builder did not provide sitesData
        if (!props.sitesData) {
          console.log("Loading Supabase sites...");
          await loadSupabaseSites();

          // setup auto-refresh
          if (autoRefresh) {
            const t = setInterval(() => {
              loadSupabaseSites();
            }, 60_000);
            (mapRef as any)._supabaseRefreshTimer = t;
          }
        } else {
          console.log("Using sitesData from props:", props.sitesData);
        }
      } catch (e) {
        console.error("Failed to initialize map:", e);
      }
    }

    async function loadSupabaseSites() {
      setSitesDataLoading(true);
      try {
        console.log("Fetching from Supabase...");
        const data = await supabaseGet<any[]>(
          "sites?select=id,name,lat,lng,region_name,department_name,score_criticite",
        );
        console.log("Supabase response:", data);
        if (data && Array.isArray(data)) {
          console.log(`Setting ${data.length} sites from Supabase`);
          setSitesData(data);
        } else {
          console.warn("Unexpected Supabase response format:", data);
        }
      } catch (e) {
        console.error("Failed to fetch Supabase sites, keeping mock data:", e);
      } finally {
        setSitesDataLoading(false);
        // trigger map re-render
        setTimeout(() => renderLayers(), 50);
      }
    }

    return () => {
      if (mapRef.current) {
        try {
          const t = (mapRef as any)._supabaseRefreshTimer;
          if (t) clearInterval(t);
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.warn("Error during cleanup:", e);
        }
      }
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
      if (site.status === "IN_PROGRESS" && !showInProgress) return false;
      if (site.status === "FINISHED" && !showFinished) return false;
      if (site.status === "NOT_STARTED" && !showNotStarted) return false;
      return true;
    });
  }, [
    sites,
    clientFilter,
    showInProgress,
    showFinished,
    showNotStarted,
    minScore,
    onlyWithActionsLate,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    console.log("Rendering layers. Sites data:", sitesData?.length || 0, "Filtered sites:", filteredSites.length);
    renderLayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredSites,
    heatmapOn,
    mode,
    currentRegion,
    currentDepartment,
    sitesData,
  ]);

  function colorForStatus(status?: string) {
    if (status === "IN_PROGRESS") return "#FFB020";
    if (status === "FINISHED") return "#0FBF7F";
    return "#9CA3AF";
  }

  function colorForCluster(avg = 0) {
    if (avg < 10) return "#16a34a";
    if (avg < 30) return "#f59e0b";
    return "#dc2626";
  }

  function renderLayers() {
    // @ts-ignore
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // clear layers
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
    try {
      if (regionLayerRef.current) {
        mapRef.current.removeLayer(regionLayerRef.current);
        regionLayerRef.current = null;
      }
    } catch (e) {}

    const zoom = mapRef.current.getZoom();
    const regionsGeo = (mapRef as any).regionsGeo;
    const departmentsGeo = (mapRef as any).departmentsGeo;

    console.log("renderLayers - zoom:", zoom, "regions geo:", !!regionsGeo, "departments geo:", !!departmentsGeo);

    // prepare unified site dataset (Supabase or fallback mocks)
    const inputSites =
      props.sitesData && props.sitesData.length ? props.sitesData : sitesData;
    const supaSites =
      inputSites && inputSites.length
        ? inputSites.map((s: any) => ({
            id: s.id,
            name: s.name,
            lat: Number(s.lat),
            lng: Number(s.lng),
            scoreCriticite: Number(s.score_criticite ?? s.scoreCriticite ?? 0),
            region_name: s.region_name,
            department_name: s.department_name,
          }))
        : [];

    const fallbackSites = filteredSites.map((s: any) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      scoreCriticite: s.scoreCriticite || 0,
      region_name: (s as any).region_name || s.regionCode || undefined,
      department_name:
        (s as any).department_name || s.departmentCode || undefined,
      status: s.status,
      progressionTravaux: s.progressionTravaux,
      nbRisquesCritiques: s.nbRisquesCritiques,
      nbActionsEnRetard: s.nbActionsEnRetard,
      nbIncidentsOuverts: s.nbIncidentsOuverts,
    }));

    const allSites = supaSites.length ? supaSites : fallbackSites;

    // Show region polygons when zoomed out
    if (
      zoom <= 6 &&
      regionsGeo &&
      regionsGeo.features &&
      regionsGeo.features.length
    ) {
      console.log("Rendering regions. Total allSites:", allSites.length);
      const rg = L.geoJSON(regionsGeo, {
        style: function (feature: any) {
          const code =
            feature.properties?.code ||
            feature.properties?.insee ||
            feature.properties?.CODREG ||
            feature.properties?.region_code ||
            feature.properties?.nom;
          const sitesInRegion = allSites.filter(
            (p) =>
              (p.region_name && String(p.region_name) === String(code)) ||
              (p.region_name &&
                String(p.region_name)
                  .toLowerCase()
                  .indexOf(
                    String(feature.properties?.nom || "")
                      .toLowerCase()
                      .split(" ")[0],
                  ) !== -1),
          );
          if (feature.properties?.nom === "Île-de-France" || sitesInRegion.length > 0) {
            console.log(`Region: ${feature.properties?.nom}, sites: ${sitesInRegion.length}`);
          }
          const count = sitesInRegion.length;
          const avg = count
            ? Math.round(
                (sitesInRegion.reduce(
                  (acc, x) => acc + (x.scoreCriticite || 0),
                  0,
                ) /
                  count) *
                  10,
              ) / 10
            : 0;
          const fill = count ? colorForCluster(avg) : "rgba(255,255,255,0.02)";
          return {
            color: "rgba(255,255,255,0.12)",
            weight: 1,
            fillColor: fill,
            fillOpacity: count ? 0.85 : 0.02,
          } as any;
        },
        onEachFeature: function (feature: any, layer: any) {
          const name =
            feature.properties?.nom ||
            feature.properties?.name ||
            feature.properties?.REGION ||
            "Région";
          layer.bindTooltip(`<strong>${name}</strong>`);
          layer.on("click", () => {
            try {
              mapRef.current.fitBounds(layer.getBounds().pad(0.2));
            } catch (e) {
              try {
                mapRef.current.setView(
                  [
                    feature.properties?.lat || 46.5,
                    feature.properties?.lng || 2.5,
                  ],
                  7,
                );
              } catch (e) {}
            }
            // set drilldown
            setMode("region");
            setCurrentRegion(name);
            setCurrentDepartment(null);
          });
        },
      });
      regionLayerRef.current = rg;
      mapRef.current.addLayer(regionLayerRef.current as any);
      return;
    }

    // Department polygons when zoomed to region level
    if (
      zoom > 6 &&
      zoom <= 9 &&
      departmentsGeo &&
      departmentsGeo.features &&
      departmentsGeo.features.length
    ) {
      const dg = L.geoJSON(departmentsGeo, {
        style: function (feature: any) {
          const code =
            feature.properties?.code ||
            feature.properties?.insee ||
            feature.properties?.code_dept ||
            feature.properties?.nom;
          const sitesInDept = allSites.filter(
            (p) =>
              (p.department_name &&
                String(p.department_name) === String(code)) ||
              (p.department_name &&
                String(p.department_name)
                  .toLowerCase()
                  .indexOf(
                    String(feature.properties?.nom || "")
                      .toLowerCase()
                      .split(" ")[0],
                  ) !== -1),
          );
          const count = sitesInDept.length;
          const avg = count
            ? Math.round(
                (sitesInDept.reduce(
                  (acc, x) => acc + (x.scoreCriticite || 0),
                  0,
                ) /
                  count) *
                  10,
              ) / 10
            : 0;
          const fill = count ? colorForCluster(avg) : "rgba(255,255,255,0.02)";
          return {
            color: "rgba(255,255,255,0.08)",
            weight: 0.8,
            fillColor: fill,
            fillOpacity: count ? 0.9 : 0.02,
          } as any;
        },
        onEachFeature: function (feature: any, layer: any) {
          const name =
            feature.properties?.nom ||
            feature.properties?.name ||
            "Département";
          layer.bindTooltip(`<strong>${name}</strong>`);
          layer.on("click", () => {
            try {
              mapRef.current.fitBounds(layer.getBounds().pad(0.1));
            } catch (e) {}
            setMode("department");
            setCurrentDepartment(name);
          });
        },
      });
      regionLayerRef.current = dg;
      mapRef.current.addLayer(regionLayerRef.current as any);
    }

    // create cluster group
    // @ts-ignore
    if (!L.markerClusterGroup) {
      console.warn("Marker cluster plugin not loaded, using regular markers");
      markersRef.current = L.featureGroup();
      mapRef.current.addLayer(markersRef.current as any);
    } else {
      const markerCluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        iconCreateFunction: function (cluster: any) {
          const children = cluster.getAllChildMarkers();
          const count = children.length;
          const avg =
            Math.round(
              (children.reduce(
                (acc: number, m: any) => acc + (m.options._score || 0),
                0,
              ) /
                Math.max(1, count)) *
                10,
            ) / 10;
          const color = colorForCluster(avg);
          const size = Math.min(70, 30 + Math.round(Math.log(count + 1) * 8));
          const html = `<div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12), rgba(0,0,0,0)), ${color}; box-shadow: 0 6px 18px rgba(0,0,0,0.45); border: 2px solid rgba(255,255,255,0.06); color: white; font-weight:600;">${count}</div>`;
          return L.divIcon({
            html,
            className: "custom-cluster-icon",
            iconSize: [size, size],
          });
        },
      });

      markersRef.current = markerCluster;
      mapRef.current.addLayer(markerCluster);

      // cluster click zoom behavior
      markerCluster.on("clusterclick", function (a: any) {
        try {
          mapRef.current.fitBounds(a.layer.getBounds().pad(0.5));
        } catch (e) {}
      });
    }

    // determine which sites to show based on drilldown mode
    let sitesToShow = allSites;
    if (mode === "region" && currentRegion) {
      sitesToShow = allSites.filter(
        (s) =>
          String(s.region_name) === String(currentRegion) ||
          (s.region_name &&
            String(s.region_name)
              .toLowerCase()
              .indexOf(String(currentRegion).toLowerCase().split(" ")[0]) !==
              -1),
      );
    } else if (mode === "department" && currentDepartment) {
      sitesToShow = allSites.filter(
        (s) =>
          String(s.department_name) === String(currentDepartment) ||
          (s.department_name &&
            String(s.department_name)
              .toLowerCase()
              .indexOf(
                String(currentDepartment).toLowerCase().split(" ")[0],
              ) !== -1),
      );
    }

    // add markers
    for (const s of sitesToShow) {
      const score = Number(s.scoreCriticite || 0);
      const color = getColorFromCriticite(score);
      const size =
        12 + Math.min(12, Math.round(Math.log(Math.max(1, score) + 1) * 4));

      const iconHtml = `<div style="width: ${size}px; height: ${size}px; border-radius:50%; background: ${color}; box-shadow: 0 6px 14px rgba(2,6,23,0.5); border: 2px solid rgba(255,255,255,0.06); display:flex;align-items:center;justify-content:center;"></div>`;

      const icon = L.divIcon({
        html: iconHtml,
        className: "site-marker-div-icon",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([s.lat, s.lng], { icon, _score: score });

      const tooltip = `<strong>${s.name}</strong><br/>Criticité: ${score}`;
      marker.bindTooltip(tooltip);
      marker.on("click", () => {
        try {
          window.location.href = `/site/${s.id}`;
        } catch (e) {}
      });

      if (markersRef.current && markersRef.current.addLayer) {
        markersRef.current.addLayer(marker);
      }
    }

    // heatmap
    if (heatmapOn) {
      const max = Math.max(1, ...allSites.map((s) => s.scoreCriticite || 0));
      const heatPoints = allSites.map((s) => [
        s.lat,
        s.lng,
        Math.max(0.1, (s.scoreCriticite || 0) / max),
      ]);
      try {
        heatRef.current = (L as any).heatLayer(heatPoints, {
          radius: 25,
          blur: 30,
          maxZoom: 13,
          gradient: {
            0.1: "#16a34a",
            0.3: "#facc15",
            0.6: "#f97316",
            1: "#dc2626",
          },
        });
        heatRef.current.addTo(mapRef.current);
      } catch (e) {
        console.warn("heat plugin not available", e);
      }
    }

    // fit bounds to points if any
    if (allSites.length) {
      const group = L.featureGroup(
        allSites.map((s) => L.marker([s.lat, s.lng])),
      );
      try {
        mapRef.current.fitBounds(group.getBounds().pad(0.4));
      } catch (e) {}
    }
  }

  function openSiteRoute(site: Site, route: string) {
    const href = route.replace("{id}", site.id);
    window.location.href = href;
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            Carte France — Sites & chantiers
          </h1>
          <div className="text-sm text-muted">
            Clusters, heatmap et filtres en temps réel
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn"
            onClick={async () => {
              const s = await builder.fetchSitesWithScores();
              setSites(s);
              renderLayers();
            }}
          >
            Rafraîchir
          </button>
          <button
            className="btn"
            onClick={() => {
              if (mapRef.current) mapRef.current.setView([46.5, 2.5], 5);
            }}
          >
            Reset vue
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm text-muted block">Client</label>
            <select
              className="input"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="">Tous</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted block">Statut chantier</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInProgress}
                  onChange={(e) => setShowInProgress(e.target.checked)}
                />{" "}
                En cours
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFinished}
                  onChange={(e) => setShowFinished(e.target.checked)}
                />{" "}
                Terminés
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNotStarted}
                  onChange={(e) => setShowNotStarted(e.target.checked)}
                />{" "}
                Non démarrés
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted block">Criticité min</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={maxScore}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
              <div className="text-sm">{minScore}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyWithActionsLate}
                onChange={(e) => setOnlyWithActionsLate(e.target.checked)}
              />
              Uniquement actions en retard
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={heatmapOn}
                onChange={(e) => setHeatmapOn(e.target.checked)}
              />
              Afficher heatmap
            </label>
          </div>
        </div>
      </div>

      <div
        id="map-france-root"
        style={{ height: 700, borderRadius: 12, overflow: "hidden" }}
      />

      {/* Side panel drawer */}
      {selectedSite && (
        <div
          className="fixed right-6 top-20 w-96 bg-card p-4 rounded-2xl shadow-xl"
          style={{ maxHeight: "75vh", overflowY: "auto" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{selectedSite.name}</h3>
              <div className="text-sm text-location">
                {clients.find((c) => c.id === selectedSite.clientId)?.name ||
                  "—"}
              </div>
            </div>
            <div>
              <button
                className="btn-ghost"
                onClick={() => setSelectedSite(null)}
              >
                Fermer
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted">Adresse</div>
            <div className="font-medium">
              {selectedSite.address ||
                `${selectedSite.city || ""} ${selectedSite.country || ""}`}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">État chantier</div>
              <div className="font-medium">
                {selectedSite.status}{" "}
                {typeof selectedSite.progressionTravaux === "number"
                  ? ` — ${selectedSite.progressionTravaux}%`
                  : ""}
              </div>
            </div>

            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">KPIs</div>
              <div className="flex gap-4 mt-2">
                <div>
                  <div className="text-xs text-muted">Risques critiques</div>
                  <div className="font-semibold">
                    {selectedSite["nbRisquesCritiques"] || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">Actions en retard</div>
                  <div className="font-semibold">
                    {selectedSite["nbActionsEnRetard"] || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">Incidents ouverts</div>
                  <div className="font-semibold">
                    {selectedSite["nbIncidentsOuverts"] || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-card-2 rounded-lg">
              <div className="text-sm text-muted">Score criticité</div>
              <div className="font-semibold text-xl">
                {selectedSite.scoreCriticite || 0}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="btn"
              onClick={() => openSiteRoute(selectedSite, "/site/{id}")}
            >
              Voir la fiche site
            </button>
            <button
              className="btn-ghost"
              onClick={() => openSiteRoute(selectedSite, "/audit/{id}")}
            >
              Voir le dernier audit
            </button>
            <button
              className="btn-ghost"
              onClick={() => openSiteRoute(selectedSite, "/actions?site={id}")}
            >
              Voir les actions
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
