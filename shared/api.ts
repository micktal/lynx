// Shared models for Security Audit Platform

export type ID = string;

export interface Organisation {
  id: ID;
  name: string;
  createdAt?: string;
}

export interface Client {
  id: ID;
  name: string;
  logoUrl?: string;
  industry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  active?: boolean;
  notes?: string;
  createdAt?: string;
}

export type ClientUserRole = "CLIENT_VIEW" | "CLIENT_MANAGER" | "CLIENT_ADMIN";
export interface ClientUser {
  id: ID;
  userId: ID;
  clientId: ID;
  role: ClientUserRole;
  permissions?: string; // JSON
  active?: boolean;
}

export interface Site {
  id: ID;
  organisationId: ID;
  clientId?: ID;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  createdAt?: string;
  lat?: number;
  lng?: number;
  status?: 'IN_PROGRESS' | 'FINISHED' | 'NOT_STARTED';
  scoreCriticite?: number;
  progressionTravaux?: number; // 0-100
  // geo / admin codes
  regionCode?: string; // ex: 'IDF', 'PACA'
  departmentCode?: string | number; // ex: '75' or 75
  // aggregates
  nbRisquesCritiques?: number;
  nbActionsEnRetard?: number;
  nbIncidentsOuverts?: number;
}

export interface Region {
  id: ID;
  name: string;
  code: string; // short code like 'IDF'
  lat?: number;
  lng?: number;
  zoomLevel?: number;
  bounds?: any; // GeoJSON polygon or bbox
}

export interface Department {
  id: ID;
  name: string;
  code: string | number; // ex '75' or 92
  regionCode?: string; // reference to Region.code
  lat?: number;
  lng?: number;
  zoomLevel?: number;
  bounds?: any;
}

export interface Building {
  id: ID;
  siteId: ID;
  clientId?: ID;
  name: string;
  code?: string;
  description?: string;
  mainUse?: string;
  floors?: number;
}

export interface Space {
  id: ID;
  buildingId: ID;
  clientId?: ID;
  name: string;
  code?: string;
  description?: string;
  floor?: number;
  accessLevel?: string;
  importance?: 1 | 2 | 3 | 4 | 5;
}

export type EquipmentState =
  | "OK"
  | "A_CONTROLER"
  | "NON_CONFORME"
  | "OBSOLETE"
  | "ABSENT";

export interface Equipment {
  id: ID;
  spaceId: ID;
  clientId?: ID;
  category: string;
  name: string;
  reference?: string;
  management?: string;
  state: EquipmentState;
  comment?: string;
}

export type RiskLevel = "FAIBLE" | "MOYEN" | "IMPORTANT" | "CRITIQUE";

export interface Risk {
  id: ID;
  auditId?: ID;
  clientId?: ID;
  siteId?: ID;
  buildingId?: ID;
  spaceId?: ID;
  equipmentId?: ID;
  title: string;
  description?: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  level: RiskLevel;
  recommendation?: string;
}

export type ActionStatus = "OUVERTE" | "EN_COURS" | "CLOTUREE";

export interface ActionItem {
  id: ID;
  riskId: ID;
  clientId?: ID;
  title: string;
  description?: string;
  ownerId?: ID;
  dueDate?: string; // ISO date
  status: ActionStatus;
}

export type AuditStatus = "draft" | "in_progress" | "completed";

export interface Audit {
  id: ID;
  siteId: ID;
  clientId?: ID;
  buildingId?: ID;
  templateId?: ID;
  status: AuditStatus;
  title: string;
  auditorId?: ID;
  scheduledAt?: string;
  completedAt?: string;
}

export interface AuditTemplate {
  id: ID;
  name: string;
  description?: string;
  version?: string | number;
  scope?: string;
}

export interface Attachment {
  id: ID;
  fileUrl: string;
  fileType: string;
  auditId?: ID;
  clientId?: ID;
  siteId?: ID;
  buildingId?: ID;
  spaceId?: ID;
  equipmentId?: ID;
  uploadedBy?: ID;
  uploadedAt?: string;
}

export interface DashboardPage {
  id: ID;
  title: string;
  siteId?: ID;
  createdAt?: string;
}

export interface ActivityLog {
  id: ID;
  timestamp: string; // ISO datetime
  entityType: string; // audit | risk | action | equipment | space | building | site
  entityId: ID;
  operation: "created" | "updated" | "deleted" | "statusChanged" | "commentAdded" | "photoAdded";
  userId?: ID;
  description?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: string; // JSON string
}

export interface BuildingPlan {
  id: ID;
  buildingId: ID;
  name: string;
  floor?: string | number;
  svgContent: string;
  width?: number;
  height?: number;
  isDefault?: boolean;
  createdAt?: string;
}

export interface PlanArea {
  id: ID;
  buildingPlanId: ID;
  spaceId: ID;
  label?: string;
  shapeType: "polygon" | "rect" | "circle";
  shapeData: string; // JSON string representing coordinates
  fillColor?: string;
  strokeColor?: string;
  opacity?: number;
}

export interface PlanMarker {
  id: ID;
  buildingPlanId: ID;
  spaceId?: ID;
  equipmentId?: ID;
  riskId?: ID;
  type: "equipment" | "risk";
  x: number;
  y: number;
  iconType?: string;
  color?: string;
  tooltip?: string;
}

export interface AuditTemplate {
  id: ID;
  name: string;
  description?: string;
  auditType?: string;
  active?: boolean;
  createdAt?: string;
}

export interface AuditCategory {
  id: ID;
  templateId: ID;
  name: string;
  order?: number;
}

export interface AuditSubcategory {
  id: ID;
  categoryId: ID;
  name: string;
  order?: number;
}

export type AuditQuestionType = "yesno" | "choice" | "text" | "photo_required" | "numeric";

export interface AuditQuestion {
  id: ID;
  subcategoryId: ID;
  label: string;
  helpText?: string;
  type: AuditQuestionType;
  critical?: boolean;
  defaultRiskLevel?: "FAIBLE" | "MOYEN" | "IMPORTANT" | "CRITIQUE";
  defaultActionRequired?: boolean;
  order?: number;
}

export interface ComplianceOption {
  id: ID;
  questionId: ID;
  label: string;
  riskLevel?: "FAIBLE" | "MOYEN" | "IMPORTANT" | "CRITIQUE";
  createsAction?: boolean;
  createsRisk?: boolean;
}

export interface GeneratedAuditQuestion {
  id: ID;
  auditId: ID;
  questionId: ID;
  spaceId?: ID;
  value?: string;
  comment?: string;
  photoId?: ID;
  autoRiskId?: ID;
  autoActionId?: ID;
}

export type WorkflowTrigger =
  | "onRiskCreated"
  | "onRiskUpdated"
  | "onActionCreated"
  | "onActionUpdated"
  | "beforeDueDate"
  | "overdue";

export interface WorkflowRule {
  id: ID;
  ruleName: string;
  trigger: WorkflowTrigger;
  condition?: string; // logical expression to evaluate on the event payload
  assignmentTarget?: string; // e.g. "userId:u_1" or "role:site_lead" or "team:ssi"
  notificationTemplate?: string; // template with placeholders like {{risk.title}}
  escalationTarget?: string;
  delayBeforeEscalation?: number; // hours
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: ID;
  userId: ID;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export type IncidentType = "intrusion" | "incendie" | "agression" | "technique" | "TMS" | "autre";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Incident {
  id: ID;
  type: IncidentType;
  status: IncidentStatus;
  priority: IncidentPriority;
  siteId?: ID;
  buildingId?: ID;
  spaceId?: ID;
  description?: string;
  reportedBy?: ID;
  assignedTo?: ID;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export type AgentRole = "agent" | "superviseur" | "pc_securite";
export type AgentStatus = "AVAILABLE" | "ON_PATROL" | "ON_INCIDENT" | "OFFLINE";

export interface Agent {
  id: ID;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  lastKnownPosition?: { lat: number; lng: number };
  lastCheckIn?: string;
  siteId?: ID;
  battery?: number;
}

export type AgentEventType = "CHECK_IN" | "CHECK_OUT" | "PATROL_START" | "PATROL_END" | "INCIDENT_ASSIGNED" | "MESSAGE_SENT";
export interface AgentEvent {
  id: ID;
  agentId: ID;
  eventType: AgentEventType;
  timestamp: string;
  data?: string; // JSON
}

export interface LocationPing {
  id: ID;
  agentId: ID;
  lat: number;
  lng: number;
  timestamp: string;
}

export type SupervisionEventType = "SYSTEM" | "ALERT" | "INFO";
export interface SupervisionEvent {
  id: ID;
  eventType: SupervisionEventType;
  entityType?: string; // agent / incident / system
  entityId?: ID;
  description?: string;
  status?: string;
  timestamp: string;
}

// Reporting models

export interface ReportDashboard {
  id: ID;
  name: string;
  description?: string;
  ownerId?: ID;
  clientId?: ID;
  config?: string; // JSON string describing widgets, layout and filters
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WidgetType = "bar" | "line" | "pie" | "donut" | "heatmap" | "table" | "kpi" | "gauge";

export interface ReportWidget {
  id: ID;
  dashboardId: ID;
  type: WidgetType;
  title: string;
  query?: string; // JSON string describing datasource and aggregations
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface ReportFilter {
  id: ID;
  dashboardId: ID;
  key: string; // e.g., 'siteId', 'buildingId', 'riskLevel'
  value: string;
}

// Security models

export interface Role {
  id: ID;
  name: string; // ADMIN / MANAGER / AUDITEUR / AGENT / CLIENT_ADMIN / CLIENT_MANAGER / CLIENT_VIEW
  description?: string;
  level?: number; // hierarchical level
  isSystem?: boolean;
}

export type PermissionAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "ASSIGN" | "EXPORT" | "MANAGE";

export interface Permission {
  id: ID;
  roleId: ID;
  resource: string; // e.g., audit, risk, action, site, building, equipment, incident, reporting, supervision, admin
  action: PermissionAction;
  condition?: string; // JSON logic string, e.g., {"field":"clientId","operator":"==","value":"currentUser.clientId"}
  allowed: boolean;
}

export interface UserExtended {
  id: ID;
  userId: ID; // reference to auth user
  roleId: ID;
  clientId?: ID;
  siteId?: ID;
  restrictedTo?: string; // JSON string describing exact perimeter, e.g., {"sites":["s1","s2"]}
}

export interface SecurityAuditLog {
  id: ID;
  userId?: ID;
  action: string;
  entityType?: string;
  entityId?: ID;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string; // JSON
}

export interface RuleEngineRule {
  id: ID;
  resource: string;
  action: PermissionAction | string;
  condition?: string; // JSON structure
  onlyRoles?: string[]; // roles allowed
  description?: string;
  active?: boolean;
}

export interface SecureVaultEntry {
  id: ID;
  name: string;
  ciphertext: string; // opaque, encrypted server-side
  createdAt?: string;
}

export interface SecuritySettings {
  id: ID;
  passwordMinLength?: number;
  passwordRequireUpper?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSymbol?: boolean;
  passwordExpiryDays?: number;
  mfaRequiredForRoles?: string[];
  sessionTimeoutMinutes?: number;
}

// Project management models
export interface Project {
  id: ID;
  name: string;
  clientId?: ID;
  description?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'DELAYED' | 'FINISHED' | 'CANCELLED';
  startDate?: string; // ISO
  endDate?: string; // ISO
  progression?: number; // 0-100
  projectManager?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chantier {
  id: ID;
  projectId?: ID;
  siteId?: ID;
  name: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'DELAYED' | 'FINISHED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  progression?: number; // 0-100
  companyAssigned?: string;
  teamLeader?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: ID;
  chantierId?: ID;
  name: string;
  description?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  progression?: number; // 0-100
  dependsOn?: ID[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'TO_DO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  createdAt?: string;
  updatedAt?: string;
}

export interface ExternalCompany {
  id: ID;
  name: string;
  contactName?: string;
  contactEmail?: string;
  phone?: string;
  specialty?: string;
  createdAt?: string;
  updatedAt?: string;
}
