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
