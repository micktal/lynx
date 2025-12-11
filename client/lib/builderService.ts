import type { Site, Building, Space, Equipment, Risk, Audit, Attachment, ActionItem, WorkflowRule, Notification, ActivityLog, DataLakeRecord, TimeSeriesMetric, MaterializedView } from "@shared/api";

// Mocked in-memory data. In production, replace with real Builder SDK calls.
let MOCK_CLIENTS: any[] = [
  { id: 'client_1', name: 'Client Demo Retail', logoUrl: '', industry: 'Retail', contactName: 'Paul Client', contactEmail: 'paul@client.com', active: true },
];

const MOCK_SITES: Site[] = [
  { id: "site_1", organisationId: "org_1", clientId: 'client_1', name: "Siège Social - Paris", address: "12 Rue de la Paix", city: "Paris", country: "France", contactName: "Alice Dupont", contactEmail: "alice@ex.com" },
  { id: "site_2", organisationId: "org_1", clientId: undefined, name: "Entrepôt - Lyon", address: "45 Av. Industrielle", city: "Lyon", country: "France", contactName: "Marc Legrand", contactEmail: "marc@ex.com" },
  { id: "site_3", organisationId: "org_2", clientId: 'client_1', name: "Centre de Données - Bordeaux", address: "Parc Tech", city: "Bordeaux", country: "France", contactName: "Sophie Martin", contactEmail: "sophie@ex.com" },
];

let MOCK_BUILDINGS: Building[] = [
  { id: "b_1", siteId: "site_1", name: "Bâtiment A", code: "A", description: "", mainUse: "Bureaux", floors: 5 },
  { id: "b_2", siteId: "site_1", name: "Bâtiment B", code: "B", description: "", mainUse: "Stockage", floors: 2 },
  { id: "b_3", siteId: "site_2", name: "Hangar 1", code: "H1", description: "", mainUse: "Logistique", floors: 1 },
  { id: "b_4", siteId: "site_3", name: "Salle serveurs", code: "S1", description: "", mainUse: "Data", floors: 1 },
];

let MOCK_SPACES: Space[] = [
  { id: "s_1", buildingId: "b_1", name: "Open Space 1", code: "OS1", description: "Espace principal", floor: 2, importance: 4, accessLevel: "Public" },
  { id: "s_2", buildingId: "b_1", name: "Salle Réunion", code: "SR1", description: "Salle visio", floor: 3, importance: 3, accessLevel: "Restreint" },
  { id: "s_3", buildingId: "b_2", name: "Stockage 1", code: "ST1", description: "Stock pièces", floor: 1, importance: 2, accessLevel: "Restreint" },
  { id: "s_4", buildingId: "b_3", name: "Atelier", code: "AT1", description: "Atelier technique", floor: 1, importance: 3, accessLevel: "Restreint" },
  { id: "s_5", buildingId: "b_4", name: "Salle Serveurs", code: "SS1", description: "Salle serveurs critique", floor: 1, importance: 5, accessLevel: "Très restreint" },
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

let MOCK_ATTACHMENTS: Attachment[] = [
  { id: "att_1", fileUrl: "/placeholder.svg", fileType: "image/svg", auditId: undefined, siteId: "site_1", buildingId: "b_1", spaceId: "s_1", equipmentId: undefined, uploadedBy: "u_1", uploadedAt: new Date().toISOString() },
];

let MOCK_ACTIONS: ActionItem[] = [
  { id: "act_1", riskId: "r_1", title: "Protéger câbles", description: "Passer sous goulotte", ownerId: "u_2", dueDate: "2024-12-01", status: "OUVERTE" },
  { id: "act_2", riskId: "r_2", title: "Remplacer caméra", description: "Commander et remplacer", ownerId: "u_3", dueDate: "2024-08-15", status: "EN_COURS" },
];

// Client APIs
export async function fetchClients(): Promise<any[]> { return structuredClone(MOCK_CLIENTS); }
export async function createClient(c: Partial<any>): Promise<any> { const newC = { id: `client_${Date.now()}`, name: c.name || 'Nouveau client', logoUrl: c.logoUrl, industry: c.industry, contactName: c.contactName, contactEmail: c.contactEmail, contactPhone: c.contactPhone, active: typeof c.active === 'boolean' ? c.active : true, notes: c.notes }; MOCK_CLIENTS.unshift(newC); return structuredClone(newC); }
export async function updateClient(id: string, patch: Partial<any>): Promise<any | null> { const idx = MOCK_CLIENTS.findIndex(x=>x.id===id); if (idx===-1) return null; MOCK_CLIENTS[idx] = { ...MOCK_CLIENTS[idx], ...patch }; return structuredClone(MOCK_CLIENTS[idx]); }
export async function deleteClient(id: string): Promise<boolean> { const idx = MOCK_CLIENTS.findIndex(x=>x.id===id); if (idx===-1) return false; MOCK_CLIENTS.splice(idx,1); // optionally cleanup related sites
  return true; }

let MOCK_CLIENT_USERS: any[] = [ { id: 'cu_1', userId: 'u_client_1', clientId: 'client_1', role: 'CLIENT_ADMIN', permissions: '{}', active: true } ];
export async function fetchClientUsers(clientId?: string): Promise<any[]> { return structuredClone(clientId ? MOCK_CLIENT_USERS.filter(u=>u.clientId===clientId) : MOCK_CLIENT_USERS); }
export async function createClientUser(u: Partial<any>): Promise<any> { const newU = { id: `cu_${Date.now()}`, userId: u.userId||`u_client_${Date.now()}`, clientId: u.clientId||'', role: u.role||'CLIENT_VIEW', permissions: u.permissions||'{}', active: typeof u.active==='boolean'?u.active:true }; MOCK_CLIENT_USERS.unshift(newU); return structuredClone(newU); }
export async function updateClientUser(id: string, patch: Partial<any>): Promise<any | null> { const idx = MOCK_CLIENT_USERS.findIndex(x=>x.id===id); if (idx===-1) return null; MOCK_CLIENT_USERS[idx] = { ...MOCK_CLIENT_USERS[idx], ...patch }; return structuredClone(MOCK_CLIENT_USERS[idx]); }
export async function deleteClientUser(id: string): Promise<boolean> { const idx = MOCK_CLIENT_USERS.findIndex(x=>x.id===id); if (idx===-1) return false; MOCK_CLIENT_USERS.splice(idx,1); return true; }

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

export async function updateAudit(id: string, patch: Partial<Audit>): Promise<Audit | null> {
  const idx = MOCK_AUDITS.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const old = MOCK_AUDITS[idx];
  const updated = { ...old, ...patch };
  MOCK_AUDITS[idx] = updated;
  if (patch.status && patch.status !== old.status) {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "audit",
      entityId: id,
      operation: "statusChanged",
      userId: "u_system",
      description: `Audit déplacé en: ${patch.status}`,
      oldValue: old.status,
      newValue: patch.status as any,
    });
  } else {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "audit",
      entityId: id,
      operation: "updated",
      userId: "u_system",
      description: `Audit mis à jour: ${updated.title}`,
      metadata: JSON.stringify({ patch }),
    });
  }
  return structuredClone(MOCK_AUDITS[idx]);
}

export async function fetchAttachments(): Promise<Attachment[]> {
  return structuredClone(MOCK_ATTACHMENTS);
}

export async function fetchActions(): Promise<ActionItem[]> {
  return structuredClone(MOCK_ACTIONS);
}

// WorkflowRule & Notification mocks and simple APIs
let MOCK_WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: "wr_1",
    ruleName: "Risque critique -> assignation chef de site",
    trigger: "onRiskCreated",
    condition: "level == \"CRITIQUE\"",
    assignmentTarget: "role:site_lead",
    notificationTemplate: "Risque critique détecté : {{risk.title}} - assigné au chef de site",
    escalationTarget: "role:security_region",
    delayBeforeEscalation: 48,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "wr_2",
    ruleName: "Action créée - assignation par catégorie incendie",
    trigger: "onActionCreated",
    condition: "equipment.category == \"incendie\"",
    assignmentTarget: "team:ssi",
    notificationTemplate: "Une action liée à un équipement incendie vous a été assignée : {{action.title}}",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

let MOCK_NOTIFICATIONS: Notification[] = [];

// Activity logs
let MOCK_ACTIVITY_LOGS: ActivityLog[] = [];

export async function createActivityLog(log: Partial<ActivityLog>): Promise<ActivityLog> {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}`,
    timestamp: log.timestamp || new Date().toISOString(),
    entityType: log.entityType || "system",
    entityId: log.entityId || "",
    operation: (log.operation as any) || "updated",
    userId: log.userId,
    description: log.description,
    oldValue: log.oldValue,
    newValue: log.newValue,
    metadata: log.metadata,
  };
  MOCK_ACTIVITY_LOGS.unshift(newLog);
  return structuredClone(newLog);
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  return structuredClone(MOCK_ACTIVITY_LOGS.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
}

export async function fetchActivityLogsForEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
  return structuredClone(MOCK_ACTIVITY_LOGS.filter((l) => l.entityType === entityType && l.entityId === entityId).sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
}

export async function fetchActivityLogsWithFilters(filters: { from?: string; to?: string; entityType?: string; operation?: string; userId?: string }): Promise<ActivityLog[]> {
  return structuredClone(
    MOCK_ACTIVITY_LOGS.filter((l) => {
      if (filters.entityType && l.entityType !== filters.entityType) return false;
      if (filters.operation && l.operation !== (filters.operation as any)) return false;
      if (filters.userId && l.userId !== filters.userId) return false;
      if (filters.from && l.timestamp < filters.from) return false;
      if (filters.to && l.timestamp > filters.to) return false;
      return true;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  );
}

// Building plans / areas / markers
let MOCK_BUILDING_PLANS: BuildingPlan[] = [
  {
    id: "bp_1",
    buildingId: "b_1",
    name: "RDC",
    floor: "RDC",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#f8fafc"/><text x="20" y="40" font-size="20">Plan RDC - Bâtiment A</text></svg>`,
    width: 800,
    height: 600,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

let MOCK_PLAN_AREAS: PlanArea[] = [
  {
    id: "pa_1",
    buildingPlanId: "bp_1",
    spaceId: "s_1",
    label: "Open Space 1",
    shapeType: "polygon",
    shapeData: JSON.stringify([{ x: 50, y: 80 }, { x: 300, y: 80 }, { x: 300, y: 200 }, { x: 50, y: 200 }]),
    fillColor: "#dbeafe",
    strokeColor: "#60a5fa",
    opacity: 0.5,
  },
];

let MOCK_PLAN_MARKERS: PlanMarker[] = [
  {
    id: "pm_1",
    buildingPlanId: "bp_1",
    spaceId: "s_1",
    equipmentId: "e_1",
    type: "equipment",
    x: 120,
    y: 140,
    iconType: "alarm",
    color: "#16a34a",
    tooltip: "Alarme Zone 1",
  },
  {
    id: "pm_2",
    buildingPlanId: "bp_1",
    spaceId: "s_5",
    riskId: "r_3",
    type: "risk",
    x: 600,
    y: 120,
    iconType: "fire",
    color: "#dc2626",
    tooltip: "Risque critique détecté",
  },
];

export async function fetchBuildingPlans(buildingId?: string): Promise<BuildingPlan[]> {
  if (buildingId) return structuredClone(MOCK_BUILDING_PLANS.filter((p) => p.buildingId === buildingId));
  return structuredClone(MOCK_BUILDING_PLANS);
}

export async function createBuildingPlan(p: Partial<BuildingPlan>): Promise<BuildingPlan> {
  const newP: BuildingPlan = {
    id: `bp_${Date.now()}`,
    buildingId: p.buildingId || "",
    name: p.name || "Nouveau plan",
    floor: p.floor,
    svgContent: p.svgContent || "",
    width: p.width,
    height: p.height,
    isDefault: !!p.isDefault,
    createdAt: new Date().toISOString(),
  };
  MOCK_BUILDING_PLANS.unshift(newP);
  return structuredClone(newP);
}

export async function updateBuildingPlan(id: string, patch: Partial<BuildingPlan>): Promise<BuildingPlan | null> {
  const idx = MOCK_BUILDING_PLANS.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  MOCK_BUILDING_PLANS[idx] = { ...MOCK_BUILDING_PLANS[idx], ...patch };
  return structuredClone(MOCK_BUILDING_PLANS[idx]);
}

export async function deleteBuildingPlan(id: string): Promise<boolean> {
  const idx = MOCK_BUILDING_PLANS.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  MOCK_BUILDING_PLANS.splice(idx, 1);
  // cleanup areas and markers
  MOCK_PLAN_AREAS = MOCK_PLAN_AREAS.filter((a) => a.buildingPlanId !== id);
  MOCK_PLAN_MARKERS = MOCK_PLAN_MARKERS.filter((m) => m.buildingPlanId !== id);
  return true;
}

export async function fetchPlanAreas(buildingPlanId: string): Promise<PlanArea[]> {
  return structuredClone(MOCK_PLAN_AREAS.filter((a) => a.buildingPlanId === buildingPlanId));
}

export async function createPlanArea(a: Partial<PlanArea>): Promise<PlanArea> {
  const newA: PlanArea = {
    id: `pa_${Date.now()}`,
    buildingPlanId: a.buildingPlanId || "",
    spaceId: a.spaceId || "",
    label: a.label,
    shapeType: (a.shapeType as any) || "polygon",
    shapeData: a.shapeData || "",
    fillColor: a.fillColor || "#dbeafe",
    strokeColor: a.strokeColor || "#60a5fa",
    opacity: typeof a.opacity === 'number' ? a.opacity : 0.5,
  };
  MOCK_PLAN_AREAS.unshift(newA);
  return structuredClone(newA);
}

export async function updatePlanArea(id: string, patch: Partial<PlanArea>): Promise<PlanArea | null> {
  const idx = MOCK_PLAN_AREAS.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  MOCK_PLAN_AREAS[idx] = { ...MOCK_PLAN_AREAS[idx], ...patch };
  return structuredClone(MOCK_PLAN_AREAS[idx]);
}

export async function deletePlanArea(id: string): Promise<boolean> {
  const idx = MOCK_PLAN_AREAS.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  MOCK_PLAN_AREAS.splice(idx, 1);
  return true;
}

export async function fetchPlanMarkers(buildingPlanId: string): Promise<PlanMarker[]> {
  return structuredClone(MOCK_PLAN_MARKERS.filter((m) => m.buildingPlanId === buildingPlanId));
}

export async function createPlanMarker(m: Partial<PlanMarker>): Promise<PlanMarker> {
  const newM: PlanMarker = {
    id: `pm_${Date.now()}`,
    buildingPlanId: m.buildingPlanId || "",
    spaceId: m.spaceId,
    equipmentId: m.equipmentId,
    riskId: m.riskId,
    type: (m.type as any) || "equipment",
    x: m.x || 0,
    y: m.y || 0,
    iconType: m.iconType,
    color: m.color || "#000000",
    tooltip: m.tooltip,
  };
  MOCK_PLAN_MARKERS.unshift(newM);
  return structuredClone(newM);
}

export async function updatePlanMarker(id: string, patch: Partial<PlanMarker>): Promise<PlanMarker | null> {
  const idx = MOCK_PLAN_MARKERS.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  MOCK_PLAN_MARKERS[idx] = { ...MOCK_PLAN_MARKERS[idx], ...patch };
  return structuredClone(MOCK_PLAN_MARKERS[idx]);
}

export async function deletePlanMarker(id: string): Promise<boolean> {
  const idx = MOCK_PLAN_MARKERS.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  MOCK_PLAN_MARKERS.splice(idx, 1);
  return true;
}

export async function fetchWorkflowRules(): Promise<WorkflowRule[]> {
  return structuredClone(MOCK_WORKFLOW_RULES);
}

// Supervision mocks
let MOCK_INCIDENTS: Incident[] = [
  { id: 'inc_1', type: 'incendie', status: 'OPEN', priority: 'CRITICAL', siteId: 'site_1', buildingId: 'b_4', spaceId: 's_5', description: 'Fumée détectée salle serveurs', reportedBy: 'u_2', createdAt: new Date().toISOString() }
];
let MOCK_AGENTS: Agent[] = [
  { id: 'ag_1', name: 'Dupont', role: 'agent', status: 'ON_PATROL', lastKnownPosition: { lat: 48.8566, lng: 2.3522 }, lastCheckIn: new Date().toISOString(), siteId: 'site_1', battery: 82 },
  { id: 'ag_2', name: 'Karim', role: 'agent', status: 'AVAILABLE', lastKnownPosition: { lat: 44.8378, lng: -0.5792 }, lastCheckIn: new Date().toISOString(), siteId: 'site_3', battery: 56 },
];
let MOCK_AGENT_EVENTS: AgentEvent[] = [];
let MOCK_LOCATION_PINGS: LocationPing[] = [];
let MOCK_SUPERVISION_EVENTS: SupervisionEvent[] = [];

export async function fetchIncidents(): Promise<Incident[]> { return structuredClone(MOCK_INCIDENTS); }
export async function fetchIncidentsForSite(siteId: string): Promise<Incident[]> { return structuredClone(MOCK_INCIDENTS.filter(i=>i.siteId===siteId)); }
export async function createIncident(i: Partial<Incident>): Promise<Incident> { const newI: Incident = { id: `inc_${Date.now()}`, type: (i.type as any) || 'autre', status: i.status || 'OPEN', priority: i.priority || 'MEDIUM', siteId: i.siteId, buildingId: i.buildingId, spaceId: i.spaceId, description: i.description, reportedBy: i.reportedBy, assignedTo: i.assignedTo, createdAt: new Date().toISOString() }; MOCK_INCIDENTS.unshift(newI); await createSupervisionEvent({ eventType: 'ALERT', entityType: 'incident', entityId: newI.id, description: `Incident ${newI.type} créé`, timestamp: new Date().toISOString() }); return structuredClone(newI); }
export async function updateIncident(id:string, patch: Partial<Incident>): Promise<Incident | null> { const idx = MOCK_INCIDENTS.findIndex(x=>x.id===id); if (idx===-1) return null; MOCK_INCIDENTS[idx] = { ...MOCK_INCIDENTS[idx], ...patch, updatedAt: new Date().toISOString() }; return structuredClone(MOCK_INCIDENTS[idx]); }

export async function fetchAgents(): Promise<Agent[]> { return structuredClone(MOCK_AGENTS); }
export async function updateAgent(id:string, patch: Partial<Agent>): Promise<Agent | null> { const idx = MOCK_AGENTS.findIndex(x=>x.id===id); if (idx===-1) return null; MOCK_AGENTS[idx] = { ...MOCK_AGENTS[idx], ...patch }; return structuredClone(MOCK_AGENTS[idx]); }
export async function createAgentEvent(e: Partial<AgentEvent>): Promise<AgentEvent> { const newE: AgentEvent = { id: `ae_${Date.now()}`, agentId: e.agentId||'', eventType: (e.eventType as any) || 'CHECK_IN', timestamp: e.timestamp || new Date().toISOString(), data: e.data }; MOCK_AGENT_EVENTS.unshift(newE); await createSupervisionEvent({ eventType: 'INFO', entityType: 'agent', entityId: newE.agentId, description: `Agent event ${newE.eventType}`, timestamp: newE.timestamp }); return structuredClone(newE); }
export async function fetchAgentEvents(agentId?: string): Promise<AgentEvent[]> { return structuredClone(agentId ? MOCK_AGENT_EVENTS.filter(a=>a.agentId===agentId) : MOCK_AGENT_EVENTS); }

export async function addLocationPing(p: Partial<LocationPing>): Promise<LocationPing> { const newP: LocationPing = { id: `lp_${Date.now()}`, agentId: p.agentId||'', lat: p.lat||0, lng: p.lng||0, timestamp: p.timestamp||new Date().toISOString() }; MOCK_LOCATION_PINGS.unshift(newP); // update agent position
const agentIdx = MOCK_AGENTS.findIndex(a=>a.id===newP.agentId); if (agentIdx!==-1) { MOCK_AGENTS[agentIdx].lastKnownPosition = { lat: newP.lat, lng: newP.lng }; MOCK_AGENTS[agentIdx].lastCheckIn = newP.timestamp; }
return structuredClone(newP); }
export async function fetchLocationPings(agentId?: string): Promise<LocationPing[]> { return structuredClone(agentId ? MOCK_LOCATION_PINGS.filter(p=>p.agentId===agentId) : MOCK_LOCATION_PINGS); }

export async function createSupervisionEvent(ev: Partial<SupervisionEvent>): Promise<SupervisionEvent> { const newEv: SupervisionEvent = { id: `sev_${Date.now()}`, eventType: (ev.eventType as any) || 'SYSTEM', entityType: ev.entityType, entityId: ev.entityId, description: ev.description, status: ev.status, timestamp: ev.timestamp || new Date().toISOString() }; MOCK_SUPERVISION_EVENTS.unshift(newEv); return structuredClone(newEv); }
export async function fetchSupervisionEvents(): Promise<SupervisionEvent[]> { return structuredClone(MOCK_SUPERVISION_EVENTS); }


// Audit templates & checklist mocks
let MOCK_AUDIT_TEMPLATES: AuditTemplate[] = [
  { id: 'at_1', name: 'Template Sécurité Incendie', description: 'Checklist incendie standard', auditType: 'incendie', active: true, createdAt: new Date().toISOString() }
];
let MOCK_AUDIT_CATEGORIES: AuditCategory[] = [
  { id: 'ac_1', templateId: 'at_1', name: 'Extincteurs', order: 1 },
  { id: 'ac_2', templateId: 'at_1', name: 'Alarme & Détection', order: 2 },
];
let MOCK_AUDIT_SUBCATS: AuditSubcategory[] = [
  { id: 'asc_1', categoryId: 'ac_1', name: 'Extincteurs portatifs', order: 1 },
  { id: 'asc_2', categoryId: 'ac_2', name: 'Détecteurs', order: 1 },
];
let MOCK_AUDIT_QUESTIONS: AuditQuestion[] = [
  { id: 'q_1', subcategoryId: 'asc_1', label: 'Extincteurs accessibles ?', helpText: 'Vérifier que l\'extincteur est accessible et visible.', type: 'yesno', critical: true, defaultRiskLevel: 'IMPORTANT', defaultActionRequired: true, order: 1 },
  { id: 'q_2', subcategoryId: 'asc_2', label: 'Détecteur opérationnel ?', helpText: 'Vérifier le témoin et les tests.', type: 'yesno', critical: true, defaultRiskLevel: 'CRITIQUE', defaultActionRequired: true, order: 1 },
];
let MOCK_COMPLIANCE_OPTIONS: ComplianceOption[] = [
  { id: 'co_1', questionId: 'q_1', label: 'OK', riskLevel: 'FAIBLE', createsAction: false, createsRisk: false },
  { id: 'co_2', questionId: 'q_1', label: 'NON CONFORME', riskLevel: 'IMPORTANT', createsAction: true, createsRisk: true },
  { id: 'co_3', questionId: 'q_2', label: 'OK', riskLevel: 'FAIBLE', createsAction: false, createsRisk: false },
  { id: 'co_4', questionId: 'q_2', label: 'NON CONFORME', riskLevel: 'CRITIQUE', createsAction: true, createsRisk: true },
];

let MOCK_GENERATED_QUESTIONS: GeneratedAuditQuestion[] = [];

export async function fetchAuditTemplates(): Promise<AuditTemplate[]> { return structuredClone(MOCK_AUDIT_TEMPLATES); }
export async function createAuditTemplate(t: Partial<AuditTemplate>): Promise<AuditTemplate> { const newT: AuditTemplate = { id: `at_${Date.now()}`, name: t.name || 'Nouveau template', description: t.description, auditType: t.auditType, active: typeof t.active === 'boolean' ? t.active : true, createdAt: new Date().toISOString() }; MOCK_AUDIT_TEMPLATES.unshift(newT); return structuredClone(newT); }
export async function updateAuditTemplate(id: string, patch: Partial<AuditTemplate>): Promise<AuditTemplate | null> { const idx = MOCK_AUDIT_TEMPLATES.findIndex(x=>x.id===id); if (idx===-1) return null; MOCK_AUDIT_TEMPLATES[idx] = {...MOCK_AUDIT_TEMPLATES[idx], ...patch}; return structuredClone(MOCK_AUDIT_TEMPLATES[idx]); }
export async function deleteAuditTemplate(id: string): Promise<boolean> { const idx = MOCK_AUDIT_TEMPLATES.findIndex(x=>x.id===id); if (idx===-1) return false; MOCK_AUDIT_TEMPLATES.splice(idx,1); return true; }

export async function fetchCategoriesForTemplate(templateId: string): Promise<AuditCategory[]> { return structuredClone(MOCK_AUDIT_CATEGORIES.filter(c=>c.templateId===templateId)); }
export async function createCategory(c: Partial<AuditCategory>): Promise<AuditCategory> { const newC: AuditCategory = { id: `ac_${Date.now()}`, templateId: c.templateId||'', name: c.name||'Nouvelle catégorie', order: c.order }; MOCK_AUDIT_CATEGORIES.unshift(newC); return structuredClone(newC); }
export async function fetchSubcategoriesForCategory(categoryId: string): Promise<AuditSubcategory[]> { return structuredClone(MOCK_AUDIT_SUBCATS.filter(s=>s.categoryId===categoryId)); }
export async function createSubcategory(s: Partial<AuditSubcategory>): Promise<AuditSubcategory> { const newS: AuditSubcategory = { id: `asc_${Date.now()}`, categoryId: s.categoryId||'', name: s.name||'Nouvelle sous-catégorie', order: s.order }; MOCK_AUDIT_SUBCATS.unshift(newS); return structuredClone(newS); }

export async function fetchQuestionsForSubcategory(subcategoryId: string): Promise<AuditQuestion[]> { return structuredClone(MOCK_AUDIT_QUESTIONS.filter(q=>q.subcategoryId===subcategoryId)); }
export async function createQuestion(q: Partial<AuditQuestion>): Promise<AuditQuestion> { const newQ: AuditQuestion = { id: `q_${Date.now()}`, subcategoryId: q.subcategoryId||'', label: q.label||'Nouvelle question', helpText: q.helpText, type: (q.type as any) || 'text', critical: !!q.critical, defaultRiskLevel: q.defaultRiskLevel, defaultActionRequired: !!q.defaultActionRequired, order: q.order }; MOCK_AUDIT_QUESTIONS.unshift(newQ); return structuredClone(newQ); }

export async function fetchComplianceOptionsForQuestion(questionId: string): Promise<ComplianceOption[]> { return structuredClone(MOCK_COMPLIANCE_OPTIONS.filter(o=>o.questionId===questionId)); }
export async function createComplianceOption(o: Partial<ComplianceOption>): Promise<ComplianceOption> { const newO: ComplianceOption = { id: `co_${Date.now()}`, questionId: o.questionId||'', label: o.label||'Option', riskLevel: o.riskLevel, createsAction: !!o.createsAction, createsRisk: !!o.createsRisk }; MOCK_COMPLIANCE_OPTIONS.unshift(newO); return structuredClone(newO); }

export async function fetchGeneratedQuestionsForAudit(auditId: string): Promise<GeneratedAuditQuestion[]> { return structuredClone(MOCK_GENERATED_QUESTIONS.filter(g=>g.auditId===auditId)); }

// createAudit: generates audit and creates generated questions per space based on template
export async function createAudit(a: Partial<Audit> & { templateId?: string; spaces?: string[] }): Promise<Audit> {
  const newA: Audit = { id: `a_${Date.now()}`, siteId: a.siteId||'', buildingId: a.buildingId, templateId: a.templateId, status: 'in_progress', title: a.title||'Nouvel audit', auditorId: a.auditorId, scheduledAt: a.scheduledAt } as any;
  MOCK_AUDITS.unshift(newA);
  // generate questions
  if (a.templateId && a.spaces && a.spaces.length>0) {
    // gather questions for template
    const cats = MOCK_AUDIT_CATEGORIES.filter(c=>c.templateId===a.templateId).map(c=>c.id);
    const subcats = MOCK_AUDIT_SUBCATS.filter(s=>cats.includes(s.categoryId)).map(s=>s.id);
    const qs = MOCK_AUDIT_QUESTIONS.filter(q=>subcats.includes(q.subcategoryId));
    for (const spaceId of a.spaces) {
      for (const q of qs) {
        const gq: GeneratedAuditQuestion = { id: `gq_${Date.now()}_${Math.random().toString(36).substring(2,7)}`, auditId: newA.id, questionId: q.id, spaceId, value: undefined };
        MOCK_GENERATED_QUESTIONS.unshift(gq);
      }
    }
  }
  return structuredClone(newA);
}

export async function answerGeneratedQuestion(gqId: string, payload: Partial<GeneratedAuditQuestion>): Promise<GeneratedAuditQuestion | null> {
  const idx = MOCK_GENERATED_QUESTIONS.findIndex(g=>g.id===gqId);
  if (idx===-1) return null;
  MOCK_GENERATED_QUESTIONS[idx] = { ...MOCK_GENERATED_QUESTIONS[idx], ...payload };
  // if value corresponds to a compliance option that creates risk/action, create them automatically
  const gq = MOCK_GENERATED_QUESTIONS[idx];
  const q = MOCK_AUDIT_QUESTIONS.find(qq=>qq.id===gq.questionId);
  // find option matching label
  const opt = MOCK_COMPLIANCE_OPTIONS.find(o=>o.questionId===gq.questionId && o.label===payload.value);
  if (opt) {
    if (opt.createsRisk) {
      const risk = await createRisk({ title: q?.label || 'Auto risk', description: q?.helpText, level: opt.riskLevel || 'MOYEN', siteId: undefined, buildingId: undefined, spaceId: gq.spaceId });
      MOCK_GENERATED_QUESTIONS[idx].autoRiskId = risk.id;
    }
    if (opt.createsAction) {
      const action = await createAction({ riskId: MOCK_GENERATED_QUESTIONS[idx].autoRiskId || '', title: `Action auto: ${q?.label || ''}`, status: 'OUVERTE' });
      MOCK_GENERATED_QUESTIONS[idx].autoActionId = action.id;
    }
  }
  return structuredClone(MOCK_GENERATED_QUESTIONS[idx]);
}

export async function createWorkflowRule(rule: Partial<WorkflowRule>): Promise<WorkflowRule> {
  const newRule: WorkflowRule = {
    id: `wr_${Date.now()}`,
    ruleName: rule.ruleName || "Nouvelle règle",
    trigger: rule.trigger || "onActionCreated",
    condition: rule.condition,
    assignmentTarget: rule.assignmentTarget,
    notificationTemplate: rule.notificationTemplate,
    escalationTarget: rule.escalationTarget,
    delayBeforeEscalation: rule.delayBeforeEscalation,
    active: typeof rule.active === "boolean" ? rule.active : true,
    createdAt: new Date().toISOString(),
  };
  MOCK_WORKFLOW_RULES.unshift(newRule);
  return structuredClone(newRule);
}

export async function updateWorkflowRule(id: string, patch: Partial<WorkflowRule>): Promise<WorkflowRule | null> {
  const idx = MOCK_WORKFLOW_RULES.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  MOCK_WORKFLOW_RULES[idx] = { ...MOCK_WORKFLOW_RULES[idx], ...patch, updatedAt: new Date().toISOString() };
  return structuredClone(MOCK_WORKFLOW_RULES[idx]);
}

export async function deleteWorkflowRule(id: string): Promise<boolean> {
  const idx = MOCK_WORKFLOW_RULES.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  MOCK_WORKFLOW_RULES.splice(idx, 1);
  return true;
}

export async function fetchNotificationsForUser(userId: string): Promise<Notification[]> {
  return structuredClone(MOCK_NOTIFICATIONS.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function createNotification(n: Partial<Notification>): Promise<Notification> {
  const newN: Notification = {
    id: `not_${Date.now()}`,
    userId: n.userId || "u_1",
    title: n.title || "Notification",
    body: n.body || "",
    link: n.link,
    read: false,
    createdAt: new Date().toISOString(),
  };
  MOCK_NOTIFICATIONS.unshift(newN);
  return structuredClone(newN);
}

export async function markNotificationAsRead(id: string): Promise<Notification | null> {
  const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  MOCK_NOTIFICATIONS[idx].read = true;
  return structuredClone(MOCK_NOTIFICATIONS[idx]);
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  let count = 0;
  for (const n of MOCK_NOTIFICATIONS) {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  }
  return count;
}

// Site CRUD
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

// Building CRUD
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
  MOCK_EQUIP = MOCK_EQUIP.filter((eq) => MOCK_SPACES.some((sp) => sp.id === eq.spaceId));
  return true;
}

// Equipment CRUD
export async function createEquipment(e: Partial<Equipment>): Promise<Equipment> {
  const newE: Equipment = {
    id: `e_${Date.now()}`,
    spaceId: e.spaceId || "",
    category: e.category || "autre",
    name: e.name || "Nouvel équipement",
    reference: e.reference || "",
    management: e.management || "",
    state: e.state || "OK",
    comment: e.comment || "",
  };
  MOCK_EQUIP.unshift(newE);
  return structuredClone(newE);
}

export async function updateEquipment(id: string, patch: Partial<Equipment>): Promise<Equipment | null> {
  const idx = MOCK_EQUIP.findIndex((eq) => eq.id === id);
  if (idx === -1) return null;
  const old = MOCK_EQUIP[idx];
  const updated = { ...old, ...patch };
  MOCK_EQUIP[idx] = updated;
  if (patch.state && patch.state !== old.state) {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "equipment",
      entityId: id,
      operation: "statusChanged",
      userId: "u_system",
      description: `État modifié : ${old.state} → ${patch.state}`,
      oldValue: old.state,
      newValue: patch.state,
    });
  } else {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "equipment",
      entityId: id,
      operation: "updated",
      userId: "u_system",
      description: `Équipement mis à jour: ${updated.name}`,
      metadata: JSON.stringify({ patch }),
    });
  }
  return structuredClone(MOCK_EQUIP[idx]);
}

export async function deleteEquipment(id: string): Promise<boolean> {
  const idx = MOCK_EQUIP.findIndex((eq) => eq.id === id);
  if (idx === -1) return false;
  MOCK_EQUIP.splice(idx, 1);
  return true;
}

// Risk CRUD
export async function createRisk(r: Partial<Risk>): Promise<Risk> {
  const newR: Risk = {
    id: `r_${Date.now()}`,
    auditId: r.auditId,
    siteId: r.siteId,
    buildingId: r.buildingId,
    spaceId: r.spaceId,
    equipmentId: r.equipmentId,
    title: r.title || "Nouveau risque",
    description: r.description || "",
    probability: (r.probability as any) || 1,
    impact: (r.impact as any) || 1,
    level: r.level || "FAIBLE",
    recommendation: r.recommendation || "",
  };
  MOCK_RISKS.unshift(newR);
  // create activity log
  await createActivityLog({
    timestamp: new Date().toISOString(),
    entityType: "risk",
    entityId: newR.id,
    operation: "created",
    userId: r?.auditId || "u_system",
    description: `Risque créé: ${newR.title}`,
    metadata: JSON.stringify({ risk: newR }),
  });
  return structuredClone(newR);
}

export async function updateRisk(id: string, patch: Partial<Risk>): Promise<Risk | null> {
  const idx = MOCK_RISKS.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const old = MOCK_RISKS[idx];
  const updated = { ...old, ...patch };
  MOCK_RISKS[idx] = updated;
  // log level change specially
  if (patch.level && patch.level !== old.level) {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "risk",
      entityId: id,
      operation: "statusChanged",
      userId: "u_system",
      description: `Niveau du risque modifié : ${old.level} → ${patch.level}`,
      oldValue: old.level,
      newValue: patch.level,
    });
  } else {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "risk",
      entityId: id,
      operation: "updated",
      userId: "u_system",
      description: `Risque mis à jour: ${updated.title}`,
      metadata: JSON.stringify({ patch }),
    });
  }
  return structuredClone(updated);
}

export async function deleteRisk(id: string): Promise<boolean> {
  const idx = MOCK_RISKS.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  const old = MOCK_RISKS[idx];
  MOCK_RISKS.splice(idx, 1);
  // also remove actions linked
  for (let i = MOCK_ACTIONS.length - 1; i >= 0; i--) {
    if (MOCK_ACTIONS[i].riskId === id) MOCK_ACTIONS.splice(i, 1);
  }
  await createActivityLog({
    timestamp: new Date().toISOString(),
    entityType: "risk",
    entityId: id,
    operation: "deleted",
    userId: "u_system",
    description: `Risque supprimé: ${old.title}`,
  });
  return true;
}


// Attachment CRUD
export async function createAttachment(a: Partial<Attachment>): Promise<Attachment> {
  const newA: Attachment = {
    id: `att_${Date.now()}`,
    fileUrl: a.fileUrl || "/placeholder.svg",
    fileType: a.fileType || "image/png",
    auditId: a.auditId,
    siteId: a.siteId,
    buildingId: a.buildingId,
    spaceId: a.spaceId,
    equipmentId: a.equipmentId,
    uploadedBy: a.uploadedBy,
    uploadedAt: new Date().toISOString(),
  };
  MOCK_ATTACHMENTS.unshift(newA);
  // log photo added
  const targetEntity = a.riskId ? { type: 'risk', id: a.riskId } : a.equipmentId ? { type: 'equipment', id: a.equipmentId } : a.auditId ? { type: 'audit', id: a.auditId } : a.spaceId ? { type: 'space', id: a.spaceId } : null;
  if (targetEntity) {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: targetEntity.type,
      entityId: targetEntity.id,
      operation: "photoAdded",
      userId: a.uploadedBy || "u_system",
      description: `Pièce jointe ajoutée: ${newA.fileUrl}`,
      metadata: JSON.stringify({ attachment: newA }),
    });
  }
  return structuredClone(newA);
}

export async function deleteAttachment(id: string): Promise<boolean> {
  const idx = MOCK_ATTACHMENTS.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  const old = MOCK_ATTACHMENTS[idx];
  MOCK_ATTACHMENTS.splice(idx, 1);
  await createActivityLog({
    timestamp: new Date().toISOString(),
    entityType: old.auditId ? "audit" : old.riskId ? "risk" : old.equipmentId ? "equipment" : old.spaceId ? "space" : "attachment",
    entityId: old.auditId || old.riskId || old.equipmentId || old.spaceId || old.siteId || "",
    operation: "deleted",
    userId: old.uploadedBy || "u_system",
    description: `Pièce jointe supprimée: ${old.id}`,
  });
  return true;
}

// Action CRUD
export async function createAction(action: Partial<ActionItem>): Promise<ActionItem> {
  const newAct: ActionItem = {
    id: `act_${Date.now()}`,
    riskId: action.riskId || "",
    title: action.title || "Nouvelle action",
    description: action.description || "",
    ownerId: action.ownerId,
    dueDate: action.dueDate,
    status: action.status || "OUVERTE",
  };
  MOCK_ACTIONS.unshift(newAct);
  // log action created
  await createActivityLog({
    timestamp: new Date().toISOString(),
    entityType: "action",
    entityId: newAct.id,
    operation: "created",
    userId: newAct.ownerId || "u_system",
    description: `Action créée: ${newAct.title} assignée à ${newAct.ownerId || 'non défini'}`,
    metadata: JSON.stringify({ action: newAct }),
  });
  return structuredClone(newAct);
}

export async function updateAction(id: string, patch: Partial<ActionItem>): Promise<ActionItem | null> {
  const idx = MOCK_ACTIONS.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const old = MOCK_ACTIONS[idx];
  const updated = { ...old, ...patch };
  MOCK_ACTIONS[idx] = updated;
  if (patch.status && patch.status !== old.status) {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "action",
      entityId: id,
      operation: "statusChanged",
      userId: updated.ownerId || "u_system",
      description: `Action ${updated.title} déplacée en: ${patch.status}`,
      oldValue: old.status,
      newValue: patch.status as any,
    });
  } else {
    await createActivityLog({
      timestamp: new Date().toISOString(),
      entityType: "action",
      entityId: id,
      operation: "updated",
      userId: updated.ownerId || "u_system",
      description: `Action mise à jour: ${updated.title}`,
      metadata: JSON.stringify({ patch }),
    });
  }
  return structuredClone(MOCK_ACTIONS[idx]);
}

export async function deleteAction(id: string): Promise<boolean> {
  const idx = MOCK_ACTIONS.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  const old = MOCK_ACTIONS[idx];
  MOCK_ACTIONS.splice(idx, 1);
  await createActivityLog({
    timestamp: new Date().toISOString(),
    entityType: "action",
    entityId: id,
    operation: "deleted",
    userId: old.ownerId || "u_system",
    description: `Action supprimée: ${old.title}`,
  });
  return true;
}

// Counts and stats
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

export async function countStatsForSpace(spaceId: string) {
  const space = MOCK_SPACES.find((s) => s.id === spaceId);
  if (!space) return { total: { equipments: 0, risks: 0, actionsOpen: 0 } };
  const equipments = MOCK_EQUIP.filter((eq) => eq.spaceId === spaceId);
  const risks = MOCK_RISKS.filter((r) => r.spaceId === spaceId);
  const actions = MOCK_ACTIONS.filter((a) => risks.some((r) => r.id === a.riskId));
  const open = actions.filter((a) => a.status === "OUVERTE").length;
  return { total: { equipments: equipments.length, risks: risks.length, actionsOpen: open }, perRisk: risks.map((r) => ({ riskId: r.id, actions: MOCK_ACTIONS.filter((a) => a.riskId === r.id) })) };
}

export async function fetchAttachmentsForSpace(spaceId: string): Promise<Attachment[]> {
  return structuredClone(MOCK_ATTACHMENTS.filter((a) => a.spaceId === spaceId));
}

export async function fetchEquipmentsForSpace(spaceId: string): Promise<Equipment[]> {
  return structuredClone(MOCK_EQUIP.filter((e) => e.spaceId === spaceId));
}

export async function fetchRisksForSpace(spaceId: string): Promise<Risk[]> {
  return structuredClone(MOCK_RISKS.filter((r) => r.spaceId === spaceId));
}

export async function fetchActionsForRisks(riskIds: string[]): Promise<ActionItem[]> {
  return structuredClone(MOCK_ACTIONS.filter((a) => riskIds.includes(a.riskId)));
}

// Data Lake & Time-series mocks
let MOCK_DATA_LAKE: DataLakeRecord[] = [];
let MOCK_TIME_SERIES: TimeSeriesMetric[] = [];
let MOCK_MATERIALIZED_VIEWS: MaterializedView[] = [];

export async function writeDataLakeRecord(r: Partial<DataLakeRecord>): Promise<DataLakeRecord> {
  const newR: DataLakeRecord = {
    id: `dl_${Date.now()}`,
    entityType: r.entityType || '',
    entityId: r.entityId || '',
    timestamp: r.timestamp || new Date().toISOString(),
    snapshot: r.snapshot || '{}',
    changeType: (r.changeType as any) || 'UPDATED',
    changedBy: r.changedBy,
    delta: r.delta || '',
    clientId: r.clientId,
    createdAt: new Date().toISOString(),
  } as DataLakeRecord;
  MOCK_DATA_LAKE.unshift(newR);
  return structuredClone(newR);
}

export async function fetchDataLakeRecords(filters: { entityType?: string; entityId?: string; clientId?: string; from?: string; to?: string } = {}): Promise<DataLakeRecord[]> {
  return structuredClone(
    MOCK_DATA_LAKE.filter((rec) => {
      if (filters.entityType && rec.entityType !== filters.entityType) return false;
      if (filters.entityId && rec.entityId !== filters.entityId) return false;
      if (filters.clientId && rec.clientId !== filters.clientId) return false;
      if (filters.from && rec.timestamp < filters.from) return false;
      if (filters.to && rec.timestamp > filters.to) return false;
      return true;
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  );
}

export async function exportDataLakeAsCsv(filters: { entityType?: string; entityId?: string; clientId?: string; from?: string; to?: string } = {}): Promise<Blob> {
  const rows: string[] = ["id,entityType,entityId,timestamp,changeType,changedBy,clientId,snapshot"];
  const recs = await fetchDataLakeRecords(filters);
  for (const r of recs) {
    const line = [r.id, r.entityType, r.entityId, r.timestamp, r.changeType, r.changedBy || '', r.clientId || '', `"${(r.snapshot || '').toString().replace(/"/g, '""')}"`].join(',');
    rows.push(line);
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  return blob;
}

export async function purgeDataLakeOlderThan(months: number, clientId?: string): Promise<{ deleted: number }> {
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - months);
  const before = MOCK_DATA_LAKE.length;
  MOCK_DATA_LAKE = MOCK_DATA_LAKE.filter((r) => {
    if (clientId && r.clientId !== clientId) return true;
    return new Date(r.timestamp) >= threshold;
  });
  return { deleted: before - MOCK_DATA_LAKE.length };
}

// Time-series
export async function writeTimeSeriesMetric(m: Partial<TimeSeriesMetric>): Promise<TimeSeriesMetric> {
  const newM: TimeSeriesMetric = {
    id: `ts_${Date.now()}`,
    metricType: (m.metricType as any) || 'CUSTOM',
    value: typeof m.value === 'number' ? m.value : 0,
    timestamp: m.timestamp || new Date().toISOString(),
    siteId: m.siteId,
    buildingId: m.buildingId,
    clientId: m.clientId,
    metadata: m.metadata || undefined,
  } as TimeSeriesMetric;
  MOCK_TIME_SERIES.unshift(newM);
  return structuredClone(newM);
}

export async function fetchTimeSeries(filters: { metricType?: string; siteId?: string; buildingId?: string; clientId?: string; from?: string; to?: string } = {}): Promise<TimeSeriesMetric[]> {
  return structuredClone(
    MOCK_TIME_SERIES.filter((t) => {
      if (filters.metricType && t.metricType !== filters.metricType) return false;
      if (filters.siteId && t.siteId !== filters.siteId) return false;
      if (filters.buildingId && t.buildingId !== filters.buildingId) return false;
      if (filters.clientId && t.clientId !== filters.clientId) return false;
      if (filters.from && t.timestamp < filters.from) return false;
      if (filters.to && t.timestamp > filters.to) return false;
      return true;
    }).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  );
}

// Materialized views
export async function createMaterializedView(v: Partial<MaterializedView>): Promise<MaterializedView> {
  const newV: MaterializedView = {
    id: `mv_${Date.now()}`,
    name: v.name || 'Nouvelle vue matérialisée',
    description: v.description,
    query: v.query || '{}',
    lastRefreshed: v.lastRefreshed,
    refreshInterval: v.refreshInterval,
    data: v.data || '[]',
  } as MaterializedView;
  MOCK_MATERIALIZED_VIEWS.unshift(newV);
  return structuredClone(newV);
}

export async function fetchMaterializedViews(): Promise<MaterializedView[]> {
  return structuredClone(MOCK_MATERIALIZED_VIEWS);
}

export async function refreshMaterializedView(id: string): Promise<MaterializedView | null> {
  const idx = MOCK_MATERIALIZED_VIEWS.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  // Simulate refresh by generating a small summary based on current mocks
  const summary = { refreshedAt: new Date().toISOString(), sampleCount: Math.floor(Math.random() * 100) };
  MOCK_MATERIALIZED_VIEWS[idx].data = JSON.stringify(summary);
  MOCK_MATERIALIZED_VIEWS[idx].lastRefreshed = new Date().toISOString();
  return structuredClone(MOCK_MATERIALIZED_VIEWS[idx]);
}

export async function fetchDataLakeStats(): Promise<{ totalRecords: number; timeSeriesPoints: number; materializedViews: number; avgSnapshotSize: number }> {
  const total = MOCK_DATA_LAKE.length;
  const ts = MOCK_TIME_SERIES.length;
  const mv = MOCK_MATERIALIZED_VIEWS.length;
  const avg = total ? Math.round(MOCK_DATA_LAKE.reduce((s, r) => s + ((r.snapshot || '').length || 0), 0) / total) : 0;
  return { totalRecords: total, timeSeriesPoints: ts, materializedViews: mv, avgSnapshotSize: avg };
}

// convenience: replay helper
export async function fetchDataLakeForEntity(entityType: string, entityId: string): Promise<DataLakeRecord[]> {
  return fetchDataLakeRecords({ entityType, entityId });
}

// end of added Data Lake APIs

// Security / RBAC mocks
let MOCK_ROLES: Role[] = [
  { id: 'role_admin', name: 'ADMIN', description: 'Platform administrator', level: 100, isSystem: true },
  { id: 'role_manager', name: 'MANAGER', description: 'Manager', level: 80, isSystem: true },
  { id: 'role_auditeur', name: 'AUDITEUR', description: 'Auditor', level: 50, isSystem: true },
  { id: 'role_agent', name: 'AGENT', description: 'Field agent', level: 10, isSystem: true },
  { id: 'role_client_view', name: 'CLIENT_VIEW', description: 'Client viewer', level: 5, isSystem: true },
];

let MOCK_PERMISSIONS: Permission[] = [
  // default admin full access
  { id: 'perm_admin_all', roleId: 'role_admin', resource: '*', action: 'MANAGE', allowed: true },
  // client_view limited
  { id: 'perm_client_view_risks', roleId: 'role_client_view', resource: 'risk', action: 'VIEW', allowed: true, condition: JSON.stringify({ field: 'clientId', operator: '==', value: 'currentUser.clientId' }) },
];

let MOCK_USER_EXTENDED: UserExtended[] = [
  { id: 'ue_1', userId: 'u_1', roleId: 'role_auditeur', clientId: 'client_1', restrictedTo: JSON.stringify({ sites: ['site_1'] }) },
  { id: 'ue_admin', userId: 'u_admin', roleId: 'role_admin' },
];

let MOCK_SECURITY_LOGS: SecurityAuditLog[] = [];
let MOCK_RULES: RuleEngineRule[] = [
  { id: 'rule_critical_action_close', resource: 'action', action: 'UPDATE', condition: JSON.stringify({ field: 'risk.level', operator: '==', value: 'CRITIQUE' }), onlyRoles: ['MANAGER','ADMIN'], description: 'Only managers/admin can update actions for critical risks', active: true }
];

// Roles CRUD
export async function fetchRoles(): Promise<Role[]> { return structuredClone(MOCK_ROLES); }
export async function createRole(r: Partial<Role>): Promise<Role> { const newR: Role = { id: `role_${Date.now()}`, name: r.name || 'NEW_ROLE', description: r.description, level: r.level || 1, isSystem: !!r.isSystem }; MOCK_ROLES.unshift(newR); return structuredClone(newR); }
export async function updateRole(id: string, patch: Partial<Role>): Promise<Role | null> { const idx = MOCK_ROLES.findIndex(x=>x.id===id); if(idx===-1) return null; MOCK_ROLES[idx] = { ...MOCK_ROLES[idx], ...patch }; return structuredClone(MOCK_ROLES[idx]); }
export async function deleteRole(id: string): Promise<boolean> { const idx = MOCK_ROLES.findIndex(x=>x.id===id); if(idx===-1) return false; if(MOCK_ROLES[idx].isSystem) return false; MOCK_ROLES.splice(idx,1); return true; }

// Permissions CRUD
export async function fetchPermissions(roleId?: string): Promise<Permission[]> { return structuredClone(roleId ? MOCK_PERMISSIONS.filter(p=>p.roleId===roleId) : MOCK_PERMISSIONS); }
export async function createPermission(p: Partial<Permission>): Promise<Permission> { const newP: Permission = { id: `perm_${Date.now()}`, roleId: p.roleId || '', resource: p.resource || '*', action: (p.action as any) || 'VIEW', condition: p.condition, allowed: typeof p.allowed==='boolean'?p.allowed:true }; MOCK_PERMISSIONS.unshift(newP); return structuredClone(newP); }
export async function updatePermission(id: string, patch: Partial<Permission>): Promise<Permission | null> { const idx = MOCK_PERMISSIONS.findIndex(x=>x.id===id); if(idx===-1) return null; MOCK_PERMISSIONS[idx] = { ...MOCK_PERMISSIONS[idx], ...patch }; return structuredClone(MOCK_PERMISSIONS[idx]); }
export async function deletePermission(id: string): Promise<boolean> { const idx = MOCK_PERMISSIONS.findIndex(x=>x.id===id); if(idx===-1) return false; MOCK_PERMISSIONS.splice(idx,1); return true; }

// UserExtended
export async function fetchUserExtended(userId?: string): Promise<UserExtended[]> { return structuredClone(userId ? MOCK_USER_EXTENDED.filter(u=>u.userId===userId) : MOCK_USER_EXTENDED); }
export async function upsertUserExtended(u: Partial<UserExtended>): Promise<UserExtended> { const existing = MOCK_USER_EXTENDED.find(x=>x.userId===u.userId); if(existing){ existing.roleId = u.roleId || existing.roleId; existing.clientId = u.clientId || existing.clientId; existing.siteId = u.siteId || existing.siteId; existing.restrictedTo = u.restrictedTo || existing.restrictedTo; return structuredClone(existing); } const newU: UserExtended = { id: `ue_${Date.now()}`, userId: u.userId || '', roleId: u.roleId || '', clientId: u.clientId, siteId: u.siteId, restrictedTo: u.restrictedTo }; MOCK_USER_EXTENDED.unshift(newU); return structuredClone(newU); }

// Security logs
export async function writeSecurityLog(entry: Partial<SecurityAuditLog>): Promise<SecurityAuditLog> {
  const newE: SecurityAuditLog = { id: `sec_${Date.now()}`, userId: entry.userId, action: entry.action || '', entityType: entry.entityType, entityId: entry.entityId, timestamp: entry.timestamp || new Date().toISOString(), ipAddress: entry.ipAddress, userAgent: entry.userAgent, details: entry.details };
  MOCK_SECURITY_LOGS.unshift(newE);
  return structuredClone(newE);
}

export async function fetchSecurityLogs(filters: { userId?: string; action?: string; entityType?: string; from?: string; to?: string } = {}): Promise<SecurityAuditLog[]> {
  return structuredClone(MOCK_SECURITY_LOGS.filter(l=>{
    if(filters.userId && l.userId!==filters.userId) return false;
    if(filters.action && l.action!==filters.action) return false;
    if(filters.entityType && l.entityType!==filters.entityType) return false;
    if(filters.from && l.timestamp<filters.from) return false;
    if(filters.to && l.timestamp>filters.to) return false;
    return true;
  }));
}

// Rules engine CRUD
export async function fetchRules(): Promise<RuleEngineRule[]> { return structuredClone(MOCK_RULES); }
export async function createRule(r: Partial<RuleEngineRule>): Promise<RuleEngineRule> { const newR: RuleEngineRule = { id: `rule_${Date.now()}`, resource: r.resource || '', action: r.action || '', condition: r.condition, onlyRoles: r.onlyRoles, description: r.description, active: typeof r.active==='boolean'?r.active:true }; MOCK_RULES.unshift(newR); return structuredClone(newR); }
export async function updateRule(id: string, patch: Partial<RuleEngineRule>): Promise<RuleEngineRule | null> { const idx = MOCK_RULES.findIndex(x=>x.id===id); if(idx===-1) return null; MOCK_RULES[idx] = { ...MOCK_RULES[idx], ...patch }; return structuredClone(MOCK_RULES[idx]); }
export async function deleteRule(id: string): Promise<boolean> { const idx = MOCK_RULES.findIndex(x=>x.id===id); if(idx===-1) return false; MOCK_RULES.splice(idx,1); return true; }

// Permission evaluation helper
function resolveValueToken(token: string | undefined, currentUser: any, userExt?: UserExtended, entity?: any) {
  if (!token) return undefined;
  if (token.startsWith('currentUser.')) {
    const key = token.replace('currentUser.','');
    return (currentUser && (currentUser as any)[key]) || undefined;
  }
  if (token.startsWith('userExt.')) {
    const key = token.replace('userExt.','');
    try{ return userExt ? JSON.parse(userExt.restrictedTo || '{}')[key] : undefined; }catch(e){ return undefined; }
  }
  // support nested entity fields like 'risk.level'
  if (token.indexOf('.')!==-1 && entity) {
    const parts = token.split('.');
    let cur: any = entity;
    for(const p of parts){ if(cur && p in cur) cur = cur[p]; else { cur = undefined; break; } }
    return cur;
  }
  return token;
}

function evaluateCondition(condStr: string | undefined, entity: any, currentUser: any, userExt?: UserExtended): boolean {
  if(!condStr) return true;
  try{
    const cond = typeof condStr === 'string' ? JSON.parse(condStr) : condStr;
    const left = cond.field ? (entity ? (cond.field.indexOf('.')!==-1 ? (()=>{ const parts = cond.field.split('.'); let cur:any=entity; for(const p of parts){ cur = cur?p in cur?cur[p]:undefined:undefined } return cur })() : entity[cond.field]) : undefined) : undefined;
    const rightToken = cond.value;
    const right = (typeof rightToken === 'string' && (rightToken.startsWith('currentUser.')|| rightToken.startsWith('userExt.')|| rightToken.indexOf('.')!==-1)) ? resolveValueToken(rightToken as string, currentUser, userExt, entity) : rightToken;
    const op = cond.operator || '==';
    if(op === '==') return left == right;
    if(op === '!=') return left != right;
    if(op === 'in') return Array.isArray(right) ? right.includes(left) : (typeof right==='string' ? right.split(',').includes(left) : false);
    if(op === 'contains') return Array.isArray(left) ? left.includes(right) : (typeof left==='string' ? left.indexOf(right)!==-1 : false);
    return false;
  }catch(e){ return false; }
}

export async function hasPermission(currentUser: any, action: PermissionAction, resource: string, entity?: any): Promise<boolean> {
  if(!currentUser) return false;
  // get extended user
  const uexts = await fetchUserExtended(currentUser.id);
  const uext = uexts.length? uexts[0] : undefined;
  const role = uext ? MOCK_ROLES.find(r=>r.id===uext.roleId) : undefined;
  // admin shortcut
  if(role && role.name==='ADMIN') return true;
  // gather permissions for role
  const perms = role ? MOCK_PERMISSIONS.filter(p=>p.roleId===role.id) : [];
  // wildcard resource permissions
  const wildcardPerms = MOCK_PERMISSIONS.filter(p=>p.resource==='*' && p.roleId===role?.id);
  const allPerms = [...perms, ...wildcardPerms];
  // check explicit denies first
  for(const p of allPerms){ if(p.action===action && p.allowed===false && evaluateCondition(p.condition, entity, currentUser, uext)) return false; }
  // check allows
  for(const p of allPerms){ if(p.action===action && p.allowed===true && evaluateCondition(p.condition, entity, currentUser, uext)) return true; }
  // check rules engine
  const rules = MOCK_RULES.filter(r=> r.resource===resource && (r.action===action || r.action==='*') && r.active);
  for(const rule of rules){
    if(rule.onlyRoles && rule.onlyRoles.length>0){
      if(!role || !rule.onlyRoles.includes(role.name)) return false;
    }
    if(rule.condition && !evaluateCondition(rule.condition, entity, currentUser, uext)) return false;
  }
  // default: deny
  return false;
}

// end of security APIs
