import type { Site, Building, Space, Equipment, Risk, Audit, Attachment, ActionItem, WorkflowRule, Notification, ActivityLog } from "@shared/api";

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

export async function fetchWorkflowRules(): Promise<WorkflowRule[]> {
  return structuredClone(MOCK_WORKFLOW_RULES);
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
  MOCK_EQUIP[idx] = { ...MOCK_EQUIP[idx], ...patch };
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
