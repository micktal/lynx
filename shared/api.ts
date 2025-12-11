// Shared models for Security Audit Platform

export type ID = string;

export interface Organisation {
  id: ID;
  name: string;
  createdAt?: string;
}

export interface Site {
  id: ID;
  organisationId: ID;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  createdAt?: string;
}

export interface Building {
  id: ID;
  siteId: ID;
  name: string;
  code?: string;
  description?: string;
  mainUse?: string;
  floors?: number;
}

export interface Space {
  id: ID;
  buildingId: ID;
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
