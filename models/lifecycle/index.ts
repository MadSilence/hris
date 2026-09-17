/**
 * Preboarding and onboarding — templates, processes and tasks.
 * Design: (claude)/technical_design/LIFECYCLE_PROCESSES_DESIGN.md.
 */

export type ProcessType = "PREBOARDING" | "ONBOARDING";
export type TaskKind = "CHECKLIST" | "FILL_FIELDS" | "DOCUMENT";
export type DueKind = "OFFSET" | "BEFORE_START";
export type AssigneeKind = "TARGET" | "ONBOARDING_MANAGER" | "SPECIFIC_USER";
export type TaskStatus = "OPEN" | "DONE" | "CANCELLED";
export type ProcessStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "PARTIALLY_FAILED" | "CANCELLED";
/** Why a named person cannot take a task. */
export type AssigneeProblem = "MISSING" | "LEFT" | "NOT_STARTED_DRAFT";

export type Ref = { id: string; name: string | null };

export type TaskConfig = {
  attributeIds?: string[] | null;
  categoryId?: string | null;
};

export type TemplateSummary = {
  id: string;
  type: ProcessType;
  name: string;
  description: string | null;
  taskCount: number;
  archivedAt: string | null;
  updatedAt: string;
  hasProblems: boolean;
};

export type TemplateItem = {
  id: string;
  position: number;
  kind: TaskKind;
  title: string;
  description: string | null;
  dueKind: DueKind;
  offsetDays: number | null;
  assigneeKind: AssigneeKind;
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeProblem: AssigneeProblem | null;
  config: TaskConfig;
};

export type Template = {
  id: string;
  type: ProcessType;
  name: string;
  description: string | null;
  archivedAt: string | null;
  version: number;
  items: TemplateItem[];
};

export type TemplateItemWrite = {
  kind: TaskKind;
  title: string;
  description: string | null;
  dueKind: DueKind;
  offsetDays: number | null;
  assigneeKind: AssigneeKind;
  assigneeUserId: string | null;
  config: TaskConfig | null;
};

export type TemplateWrite = {
  type: ProcessType;
  name: string;
  description: string | null;
  items: TemplateItemWrite[];
  /** On update, the version the editor was opened with; a stale one is refused with E00409. */
  version?: number;
};

export type Task = {
  id: string;
  kind: TaskKind;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueKind: DueKind;
  dueDate: string | null;
  dueReached: boolean;
  subject: Ref;
  assigneeKind: AssigneeKind;
  assignee: Ref | null;
  processId: string | null;
  processType: ProcessType | null;
  fields: { id: string; name: string | null; type: string | null; filled: boolean }[] | null;
  category: Ref | null;
  completedAt: string | null;
};

export type ItemOverride = {
  templateItemId: string;
  removed: boolean;
  title?: string | null;
  description?: string | null;
  dueKind?: DueKind | null;
  offsetDays?: number | null;
  assigneeKind?: AssigneeKind | null;
  assigneeUserId?: string | null;
};

export type StartProcessRequest = {
  type: ProcessType;
  templateId: string;
  managerUserId: string | null;
  hireDate: string | null;
  email: string | null;
  items: ItemOverride[] | null;
};

export type PlannedTask = {
  templateItemId: string;
  position: number;
  kind: TaskKind;
  title: string;
  description: string | null;
  dueKind: DueKind;
  offsetDays: number | null;
  dueDate: string | null;
  assigneeKind: AssigneeKind;
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeProblem: AssigneeProblem | null;
  config: TaskConfig;
};

export type StartPreview = {
  type: ProcessType;
  target: Ref;
  templateId: string;
  templateName: string;
  anchorDate: string | null;
  hireDateRequired: boolean;
  emailRequired: boolean;
  manager: Ref | null;
  managerProblem: AssigneeProblem | null;
  tasks: PlannedTask[];
};

export type ProcessSummary = {
  id: string;
  type: ProcessType;
  status: ProcessStatus;
  target: Ref;
  manager: Ref | null;
  templateName: string;
  anchorDate: string;
  taskCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
  closedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type Process = {
  id: string;
  type: ProcessType;
  status: ProcessStatus;
  target: Ref;
  manager: Ref | null;
  templateName: string;
  templateVersion: number;
  anchorDate: string;
  anchorDrift: {
    from: string;
    to: string;
    changes: { taskId: string; title: string; from: string | null; to: string | null }[];
  } | null;
  tasks: Task[];
  closedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  linkActive: boolean;
};

export type ProcessDeleteImpact = {
  tasksDeleted: number;
  documentsKept: number;
  historyKept: boolean;
};

export type PreboardingPage = {
  firstName: string | null;
  companyName: string | null;
  startDate: string | null;
  tasks: {
    id: string;
    kind: TaskKind;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueKind: DueKind;
    dueDate: string | null;
    fields: {
      id: string;
      name: string;
      type: string;
      isRequired: boolean;
      isFilled: boolean;
      options: { id: string; label: string }[];
    }[] | null;
    categoryName: string | null;
  }[];
};

export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  PREBOARDING: "Preboarding",
  ONBOARDING: "Onboarding",
};

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  CHECKLIST: "Checklist",
  FILL_FIELDS: "Fill In Fields",
  DOCUMENT: "Upload Document",
};

export const ASSIGNEE_KIND_LABELS: Record<AssigneeKind, string> = {
  TARGET: "The New Person",
  ONBOARDING_MANAGER: "Onboarding Manager",
  SPECIFIC_USER: "Specific Person",
};

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  PARTIALLY_FAILED: "Partially Failed",
  CANCELLED: "Cancelled",
};

export const ASSIGNEE_PROBLEM_LABELS: Record<AssigneeProblem, string> = {
  MISSING: "Nobody is assigned",
  LEFT: "Has left the company",
  NOT_STARTED_DRAFT: "Not an employee yet",
};

/** "7 days before start", "On the start day", "3 days after start", "By the start day". */
export const describeDue = (dueKind: DueKind, offsetDays: number | null | undefined): string => {
  if (dueKind === "BEFORE_START") return "By the start day";
  const n = offsetDays ?? 0;
  if (n === 0) return "On the start day";
  const days = Math.abs(n) === 1 ? "1 day" : `${Math.abs(n)} days`;
  return n < 0 ? `${days} before start` : `${days} after start`;
};
