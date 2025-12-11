import type { Site, Building, Space, Equipment, Risk, Audit } from "@shared/api";

// Mocked in-memory data. In production, replace with real Builder SDK calls.
const MOCK_SITES: Site[] = [
  { id: "site_1", organisationId: "org_1", name: "Siège Social - Paris", address: "12 Rue de la Paix", city: "Paris", country: "France", contactName: "Alice Dupont", contactEmail: "alice@ex.com" },
  { id: "site_2", organisationId: "org_1", name: "Entrepôt - Lyon", address: "45 Av. Industrielle", city: "Lyon", country: "France", contactName: "Marc Legrand", contactEmail: "marc@ex.com" },
  { id: "site_3", organisationId: "org_2", name: "Centre de Données - Bordeaux", address: "Parc Tech", city: "Bordeaux", country: "France", contactName: "Sophie Martin", contactEmail: "sophie@ex.com" },
];

let MOCK_BUILDINGS: Building[] = [
  { id: "b_1", siteId: "site_1", name: "Bâtiment A", code: "A", description: "", mainUse: "Bureaux", floors: 5 },
  { id: "b_2", siteId: "site_1", name: "Bâtiment B", code: "B", description: "", mainUse: "Stockage", floors: 2 },
  { id: "b_3", siteId: "site_2", name: "Hangar 1", code: "H1", description: "", mainUse: "Logistique", floors: 1 },
  { id: "b_4", siteId: "site_3", name: "Salle serveurs", code: "S1", description: "", mainUse: "Data", floors: 1 },
];

let MOCK_SPACES: Space[] = [
  { id: "s_1", buildingId: "b_1", name: "Open Space 1", floor: 2, importance: 4 },
  { id: "s_2", buildingId: "b_1", name: "Salle Réunion", floor: 3, importance: 3 },
  { id: "s_3", buildingId: "b_2", name: "Stockage 1", floor: 1, importance: 2 },
  { id: "s_4", buildingId: "b_3", name: "Atelier", floor: 1, importance: 3 },
  { id: "s_5", buildingId: "b_4", name: "Salle Serveurs", floor: 1, importance: 5 },
];

let MOCK_EQUIP: Equipment[] = [
  { id: "e_1", spaceId: "s_1", category: "alarme", name: "Alarme Zone 1", reference: "A-01", management: "local", state: "OK", comment: "" },
  { id: "e_2", spaceId: "s_2", category: "vidéo", name: "Caméra 01", reference: "C-01", management: "cloud", state: "A_CONTROLER", comment: "" },
  { id: "e_3", spaceId: "s_5", category: "incendie", name: "Détecteur 1", reference: "D-01", management: "local", state: "NON_CONFORME", comment: "" },
];

let MOCK_RISKS: Risk[] = [
  { id: "r_1", auditId: undefined, siteId: "site_1", buildingId: "b_1", spaceId: "s_1", equipmentId: "e_1", title: "Câblage défectueux", description: "Câblage apparent", probability: 3, impact: 3, level: "MOYEN", recommendation: "Sécuriser les câbles" },
  { id: "r_2", auditId: undefined, siteId: "site_1", buildingId: "b_1", spaceId: "s_2", equipmentId: "e_2", title: "Caméra hors service", description: "Caméra non connectée", probability: 4, impact: 2, level: "IMPORTANT", recommendation: "Remplacer la caméra" },
  { id: "r_3", auditId: undefined, siteId: "site_3", buildingId: "b_4", spaceId: "s_5", equipmentId: "e_3", title: "Détecteur non conforme", description: "Mesure erronée", probability: 5, impact: 5, level: "CRITIQUE", recommendation: "Intervention immédiate" },
];

let MOCK_AUDITS: Audit[] = [
  { id: "a_1", siteId: "site_1", buildingId: "b_1", templateId: "t_1", status: "completed", title: "Audit annuel 2024", auditorId: "u_1", scheduledAt: "2024-03-01", completedAt: "2024-03-02" },
  { id: "a_2", siteId: "site_3", buildingId: "b_4", templateId: "t_2", status: "in_progress", title: "Audit sécurité infra", auditorId: "u_2", scheduledAt: "2024-10-01" },
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

export async function fetchRisks(): Promise<Risk[]> {
  return structuredClone(MOCK_RISKS);
}

export async function fetchAudits(): Promise<Audit[]> {
  return structuredClone(MOCK_AUDITS);
}

export async function createSite(site: Partial<Site>): Promise<Site> {
  const newSite: Site = {
    id: `site_${Date.now()}`,
    organisationId: site.organisationId || "org_1",
    name: site.name || "Nouveau site",
    address: site.address || "",
    city: site.city || "",
    country: site.country || "",
    contactName: site.contactName || "",
    contactEmail: site.contactEmail || "",
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

export async function createBuilding(building: Partial<Building>): Promise<Building> {
  const newBuilding: Building = {
    id: `b_${Date.now()}`,
    siteId: building.siteId || "",
    name: building.name || "Nouveau bâtiment",
    code: building.code || "",
    description: building.description || "",
    mainUse: building.mainUse || "",
    floors: building.floors || 1,
  };
  MOCK_BUILDINGS.unshift(newBuilding);
  return structuredClone(newBuilding);
}

export async function updateBuilding(id: string, patch: Partial<Building>): Promise<Building | null> {
  const idx = MOCK_BUILDINGS.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  MOCK_BUILDINGS[idx] = { ...MOCK_BUILDINGS[idx], ...patch };
  return structuredClone(MOCK_BUILDINGS[idx]);
}

export async function deleteBuilding(id: string): Promise<boolean> {
  const idx = MOCK_BUILDINGS.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  MOCK_BUILDINGS.splice(idx, 1);
  // also remove spaces and equipments related (simple cleanup)
  MOCK_SPACES = MOCK_SPACES.filter((sp) => sp.buildingId !== id);
  MOCK_EQUIP = MOCK_EQUIP.filter((eq) => eq.spaceId && MOCK_SPACES.some((sp) => sp.id === eq.spaceId));
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

export async function countStatsForSite(siteId: string) {
  const buildings = MOCK_BUILDINGS.filter((b) => b.siteId === siteId);
  const spaces = MOCK_SPACES.filter((sp) => buildings.some((b) => b.id === sp.buildingId));
  const equipments = MOCK_EQUIP.filter((eq) => spaces.some((s) => s.id === eq.spaceId));
  const risks = MOCK_RISKS.filter((r) => r.siteId === siteId);

  const total = {
    buildings: buildings.length,
    spaces: spaces.length,
    equipments: equipments.length,
    risks: risks.length,
  };

  const perBuilding = buildings.map((b) => {
    const bSpaces = MOCK_SPACES.filter((sp) => sp.buildingId === b.id);
    const bEquip = MOCK_EQUIP.filter((eq) => bSpaces.some((s) => s.id === eq.spaceId));
    const bRisks = MOCK_RISKS.filter((r) => r.buildingId === b.id);
    const audits = MOCK_AUDITS.filter((a) => a.buildingId === b.id).sort((a, b2) => {
      const da = a.completedAt || a.scheduledAt || "";
      const db = b2.completedAt || b2.scheduledAt || "";
      return db.localeCompare(da);
    });
    return {
      buildingId: b.id,
      spaces: bSpaces.length,
      equipments: bEquip.length,
      risks: bRisks.length,
      lastAudit: audits.length ? audits[0] : undefined,
    };
  });

  return { total, perBuilding };
}
