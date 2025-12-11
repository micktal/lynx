import type { Site, Building, Space, Equipment } from "@shared/api";

// Mocked in-memory data. In production, replace with real Builder SDK calls.
const MOCK_SITES: Site[] = [
  { id: "site_1", organisationId: "org_1", name: "Siège Social - Paris", address: "12 Rue de la Paix", city: "Paris", country: "France" },
  { id: "site_2", organisationId: "org_1", name: "Entrepôt - Lyon", address: "45 Av. Industrielle", city: "Lyon", country: "France" },
  { id: "site_3", organisationId: "org_2", name: "Centre de Données - Bordeaux", address: "Parc Tech", city: "Bordeaux", country: "France" },
];

const MOCK_BUILDINGS: Building[] = [
  { id: "b_1", siteId: "site_1", name: "Bâtiment A", code: "A", description: "", mainUse: "Bureaux", floors: 5 },
  { id: "b_2", siteId: "site_1", name: "Bâtiment B", code: "B", description: "", mainUse: "Stockage", floors: 2 },
  { id: "b_3", siteId: "site_2", name: "Hangar 1", code: "H1", description: "", mainUse: "Logistique", floors: 1 },
  { id: "b_4", siteId: "site_3", name: "Salle serveurs", code: "S1", description: "", mainUse: "Data", floors: 1 },
];

const MOCK_SPACES: Space[] = [
  { id: "s_1", buildingId: "b_1", name: "Open Space 1", floor: 2, importance: 4 },
  { id: "s_2", buildingId: "b_1", name: "Salle Réunion", floor: 3, importance: 3 },
  { id: "s_3", buildingId: "b_2", name: "Stockage 1", floor: 1, importance: 2 },
  { id: "s_4", buildingId: "b_3", name: "Atelier", floor: 1, importance: 3 },
  { id: "s_5", buildingId: "b_4", name: "Salle Serveurs", floor: 1, importance: 5 },
];

const MOCK_EQUIP: Equipment[] = [
  { id: "e_1", spaceId: "s_1", category: "alarme", name: "Alarme Zone 1", state: "OK" },
  { id: "e_2", spaceId: "s_2", category: "vidéo", name: "Caméra 01", state: "A_CONTROLER" },
  { id: "e_3", spaceId: "s_5", category: "incendie", name: "Détecteur 1", state: "NON_CONFORME" },
];

export async function fetchSites(): Promise<Site[]> {
  return structuredClone(MOCK_SITES);
}

export async function fetchBuildings(): Promise<Building[]> {
  return structuredClone(MOCK_BUILDINGS);
}

export async function fetchSpaces(): Promise<Space[]> {
  return structuredClone(MOCK_SPACES);
}

export async function fetchEquipments(): Promise<Equipment[]> {
  return structuredClone(MOCK_EQUIP);
}

export async function createSite(site: Partial<Site>): Promise<Site> {
  const newSite: Site = {
    id: `site_${Date.now()}`,
    organisationId: site.organisationId || "org_1",
    name: site.name || "Nouveau site",
    address: site.address || "",
    city: site.city || "",
    country: site.country || "",
  };
  MOCK_SITES.unshift(newSite);
  return structuredClone(newSite);
}

export async function updateSite(id: string, patch: Partial<Site>): Promise<Site | null> {
  const idx = MOCK_SITES.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  MOCK_SITES[idx] = { ...MOCK_SITES[idx], ...patch };
  return structuredClone(MOCK_SITES[idx]);
}

export async function deleteSite(id: string): Promise<boolean> {
  const idx = MOCK_SITES.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  MOCK_SITES.splice(idx, 1);
  return true;
}

export async function countBySite() {
  const sites = await fetchSites();
  const buildings = await fetchBuildings();
  const spaces = await fetchSpaces();
  const equipments = await fetchEquipments();

  const total = {
    sites: sites.length,
    buildings: buildings.length,
    spaces: spaces.length,
    equipments: equipments.length,
  };

  const perSite = sites.map((site) => {
    const siteBuildings = buildings.filter((b) => b.siteId === site.id);
    const siteSpaces = spaces.filter((sp) => siteBuildings.some((b) => b.id === sp.buildingId));
    const siteEquip = equipments.filter((eq) => siteSpaces.some((sp) => sp.id === eq.spaceId));
    return {
      siteId: site.id,
      buildings: siteBuildings.length,
      spaces: siteSpaces.length,
      equipments: siteEquip.length,
    };
  });

  return { total, perSite };
}
