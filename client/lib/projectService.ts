import type { Project, Chantier, Task, ExternalCompany } from "@shared/api";

// Simple in-memory mocks
let MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "Projet Déploiement Retail",
    clientId: "client_1",
    description: "Déploiement de sécurité",
    status: "IN_PROGRESS",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    progression: 45,
    projectManager: "Paul Client",
    budget: 120000,
    createdAt: new Date().toISOString(),
  },
];

let MOCK_CHANTIERS: Chantier[] = [
  {
    id: "ch_1",
    projectId: "proj_1",
    siteId: "site_1",
    name: "Chantier Paris - Siège",
    status: "IN_PROGRESS",
    startDate: "2024-01-10",
    endDate: "2024-06-30",
    progression: 50,
    companyAssigned: "Entreprise A",
    teamLeader: "Chef Chantier",
    notes: "",
    createdAt: new Date().toISOString(),
  },
];

let MOCK_TASKS: Task[] = [
  {
    id: "t_1",
    chantierId: "ch_1",
    name: "Installer alarmes",
    description: "Pose des alarmes de zone",
    assignee: "Tech A",
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    progression: 70,
    dependsOn: [],
    priority: "HIGH",
    status: "IN_PROGRESS",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t_2",
    chantierId: "ch_1",
    name: "Installer caméras",
    description: "Pose caméras",
    assignee: "Tech B",
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    progression: 20,
    dependsOn: ["t_1"],
    priority: "MEDIUM",
    status: "TO_DO",
    createdAt: new Date().toISOString(),
  },
];

let MOCK_EXTERNAL_COMPANIES: ExternalCompany[] = [
  {
    id: "co_1",
    name: "Entreprise A",
    contactName: "M. Fournier",
    contactEmail: "contact@enta.fr",
    phone: "+33123456789",
    specialty: "Installation",
    createdAt: new Date().toISOString(),
  },
];

// Projects APIs
export async function fetchProjects(): Promise<Project[]> {
  return structuredClone(MOCK_PROJECTS);
}
export async function fetchProjectById(
  id: string,
): Promise<Project | undefined> {
  return structuredClone(MOCK_PROJECTS.find((p) => p.id === id));
}
export async function createProject(p: Partial<Project>): Promise<Project> {
  const newP: Project = {
    id: `proj_${Date.now()}`,
    name: p.name || "Nouveau projet",
    clientId: p.clientId,
    description: p.description,
    status: p.status || "PLANNED",
    startDate: p.startDate,
    endDate: p.endDate,
    progression: typeof p.progression === "number" ? p.progression : 0,
    projectManager: p.projectManager,
    budget: p.budget,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Project;
  MOCK_PROJECTS.unshift(newP);
  await recalcProjectProgress(newP.id);
  return structuredClone(newP);
}
export async function updateProject(
  id: string,
  patch: Partial<Project>,
): Promise<Project | null> {
  const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  MOCK_PROJECTS[idx] = {
    ...MOCK_PROJECTS[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await recalcProjectProgress(id);
  return structuredClone(MOCK_PROJECTS[idx]);
}
export async function deleteProject(id: string): Promise<boolean> {
  const idx = MOCK_PROJECTS.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  MOCK_PROJECTS.splice(idx, 1);
  return true;
}

// Chantiers APIs
export async function fetchChantiers(projectId?: string): Promise<Chantier[]> {
  return structuredClone(
    projectId
      ? MOCK_CHANTIERS.filter((c) => c.projectId === projectId)
      : MOCK_CHANTIERS,
  );
}
export async function fetchChantierById(
  id: string,
): Promise<Chantier | undefined> {
  return structuredClone(MOCK_CHANTIERS.find((c) => c.id === id));
}
export async function createChantier(c: Partial<Chantier>): Promise<Chantier> {
  const newC: Chantier = {
    id: `ch_${Date.now()}`,
    projectId: c.projectId,
    siteId: c.siteId,
    name: c.name || "Nouveau chantier",
    status: c.status || "PLANNED",
    startDate: c.startDate,
    endDate: c.endDate,
    progression: typeof c.progression === "number" ? c.progression : 0,
    companyAssigned: c.companyAssigned,
    teamLeader: c.teamLeader,
    notes: c.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Chantier;
  MOCK_CHANTIERS.unshift(newC);
  await recalcChantierProgress(newC.id);
  if (newC.projectId) await recalcProjectProgress(newC.projectId);
  return structuredClone(newC);
}
export async function updateChantier(
  id: string,
  patch: Partial<Chantier>,
): Promise<Chantier | null> {
  const idx = MOCK_CHANTIERS.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  MOCK_CHANTIERS[idx] = {
    ...MOCK_CHANTIERS[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await recalcChantierProgress(id);
  if (MOCK_CHANTIERS[idx].projectId)
    await recalcProjectProgress(MOCK_CHANTIERS[idx].projectId!);
  return structuredClone(MOCK_CHANTIERS[idx]);
}
export async function deleteChantier(id: string): Promise<boolean> {
  const idx = MOCK_CHANTIERS.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  MOCK_CHANTIERS.splice(idx, 1);
  return true;
}

// Tasks APIs
export async function fetchTasks(chantierId?: string): Promise<Task[]> {
  return structuredClone(
    chantierId
      ? MOCK_TASKS.filter((t) => t.chantierId === chantierId)
      : MOCK_TASKS,
  );
}
export async function fetchTaskById(id: string): Promise<Task | undefined> {
  return structuredClone(MOCK_TASKS.find((t) => t.id === id));
}
export async function createTask(t: Partial<Task>): Promise<Task> {
  const newT: Task = {
    id: `t_${Date.now()}`,
    chantierId: t.chantierId,
    name: t.name || "Nouvelle tâche",
    description: t.description,
    assignee: t.assignee,
    startDate: t.startDate,
    endDate: t.endDate,
    progression: typeof t.progression === "number" ? t.progression : 0,
    dependsOn: t.dependsOn || [],
    priority: t.priority || "MEDIUM",
    status: t.status || "TO_DO",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Task;
  MOCK_TASKS.unshift(newT);
  if (newT.chantierId) await recalcChantierProgress(newT.chantierId);
  return structuredClone(newT);
}
export async function updateTask(
  id: string,
  patch: Partial<Task>,
): Promise<Task | null> {
  const idx = MOCK_TASKS.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  MOCK_TASKS[idx] = {
    ...MOCK_TASKS[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (MOCK_TASKS[idx].chantierId)
    await recalcChantierProgress(MOCK_TASKS[idx].chantierId!);
  return structuredClone(MOCK_TASKS[idx]);
}
export async function deleteTask(id: string): Promise<boolean> {
  const idx = MOCK_TASKS.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  const chantierId = MOCK_TASKS[idx].chantierId;
  MOCK_TASKS.splice(idx, 1);
  if (chantierId) await recalcChantierProgress(chantierId);
  return true;
}

// External companies
export async function fetchExternalCompanies(): Promise<ExternalCompany[]> {
  return structuredClone(MOCK_EXTERNAL_COMPANIES);
}
export async function createExternalCompany(
  c: Partial<ExternalCompany>,
): Promise<ExternalCompany> {
  const newC: ExternalCompany = {
    id: `co_${Date.now()}`,
    name: c.name || "Nouvelle entreprise",
    contactName: c.contactName,
    contactEmail: c.contactEmail,
    phone: c.phone,
    specialty: c.specialty,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ExternalCompany;
  MOCK_EXTERNAL_COMPANIES.unshift(newC);
  return structuredClone(newC);
}

// Recalculation helpers
export async function recalcChantierProgress(
  chantierId: string,
): Promise<void> {
  const tasks = MOCK_TASKS.filter((t) => t.chantierId === chantierId);
  if (!tasks.length) return;
  const avg = Math.round(
    tasks.reduce((a, c) => a + (c.progression || 0), 0) / tasks.length,
  );
  const idx = MOCK_CHANTIERS.findIndex((c) => c.id === chantierId);
  if (idx === -1) return;
  MOCK_CHANTIERS[idx].progression = avg;
  // update status
  const now = new Date();
  if (MOCK_CHANTIERS[idx].progression === 100)
    MOCK_CHANTIERS[idx].status = "FINISHED";
  else if (
    MOCK_CHANTIERS[idx].endDate &&
    new Date(MOCK_CHANTIERS[idx].endDate) < now &&
    MOCK_CHANTIERS[idx].progression! < 100
  )
    MOCK_CHANTIERS[idx].status = "DELAYED";
  else MOCK_CHANTIERS[idx].status = "IN_PROGRESS";
}

export async function recalcProjectProgress(projectId: string): Promise<void> {
  const chs = MOCK_CHANTIERS.filter((c) => c.projectId === projectId);
  if (!chs.length) return;
  const avg = Math.round(
    chs.reduce((a, c) => a + (c.progression || 0), 0) / chs.length,
  );
  const idx = MOCK_PROJECTS.findIndex((p) => p.id === projectId);
  if (idx === -1) return;
  MOCK_PROJECTS[idx].progression = avg;
  const now = new Date();
  if (MOCK_PROJECTS[idx].progression === 100)
    MOCK_PROJECTS[idx].status = "FINISHED";
  else if (
    MOCK_PROJECTS[idx].endDate &&
    new Date(MOCK_PROJECTS[idx].endDate) < now &&
    MOCK_PROJECTS[idx].progression! < 100
  )
    MOCK_PROJECTS[idx].status = "DELAYED";
  else MOCK_PROJECTS[idx].status = "IN_PROGRESS";
}

export async function recalcAllProgressions(): Promise<void> {
  for (const t of MOCK_TASKS) {
    // noop
  }
  for (const c of MOCK_CHANTIERS) {
    await recalcChantierProgress(c.id);
  }
  for (const p of MOCK_PROJECTS) {
    await recalcProjectProgress(p.id);
  }
}

// initialize recalc
recalcAllProgressions();

export default {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  fetchChantiers,
  fetchChantierById,
  createChantier,
  updateChantier,
  deleteChantier,
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  fetchExternalCompanies,
  createExternalCompany,
  recalcChantierProgress,
  recalcProjectProgress,
  recalcAllProgressions,
};
