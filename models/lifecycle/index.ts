/**
 * Preboarding, onboarding and offboarding — templates, processes and tasks.
 * Design: (claude)/technical_documentation/LIFECYCLE_PROCESSES.md.
 */

export type ProcessType = "PREBOARDING" | "ONBOARDING" | "OFFBOARDING";
/**
 * TODO: a tick, and a file when it names a category. ACKNOWLEDGE: HR's material and "I have read it", only by
 * its assignee. QUESTIONNAIRE: questions defined on the template item.
 */
export type TaskKind =
  | "TODO"
  | "FILL_FIELDS"
  | "DOCUMENT"
  | "ACKNOWLEDGE"
  | "QUESTIONNAIRE"
  | "REVIEW"
  | "NOMINATE_PEERS"
  | "APPROVE_PEERS"
  | "APPROVE_REVIEW";

/** A review and its steps — nominating and approving peers, approving a manager review — come only from a review cycle. */
export type ReviewTaskKind = "REVIEW" | "NOMINATE_PEERS" | "APPROVE_PEERS" | "APPROVE_REVIEW";
export const REVIEW_TASK_KINDS: ReviewTaskKind[] = ["REVIEW", "NOMINATE_PEERS", "APPROVE_PEERS", "APPROVE_REVIEW"];
export const isReviewTaskKind = (k: TaskKind): k is ReviewTaskKind => (REVIEW_TASK_KINDS as TaskKind[]).includes(k);

/** The kinds a template or a running process may be given. */
export type EditableTaskKind = Exclude<TaskKind, ReviewTaskKind>;
export type DueKind = "OFFSET" | "BEFORE_START";
/** LINE_MANAGER: a task an automation gave to "the manager" — it follows the reporting line; never in a template. */
export type TemplateAssigneeKind = "TARGET" | "ONBOARDING_MANAGER" | "SPECIFIC_USER";
export type AssigneeKind = TemplateAssigneeKind | "LINE_MANAGER";
/** WAITING: waits for other tasks of its process; its assignee is not told and does not see it yet. */
export type TaskStatus = "WAITING" | "OPEN" | "DONE" | "CANCELLED";
export type ProcessStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "PARTIALLY_FAILED" | "CANCELLED";
/** Why a named person cannot take a task. */
export type AssigneeProblem = "MISSING" | "LEFT" | "NOT_STARTED_DRAFT";

export type Ref = { id: string; name: string | null };

/** A file (uploaded to `/lifecycle/files`) or a link HR attaches to a task for whoever does it. */
export type Material = {
  type: "FILE" | "LINK";
  fileId?: string | null;
  url?: string | null;
  name: string | null;
};

export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "DATE"
  | "YES_NO"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE";

/** One question of a questionnaire. Its id is chosen by the editor and kept across saves. */
export type Question = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[] | null;
  required?: boolean | null;
};

export type TaskConfig = {
  attributeIds?: string[] | null;
  /** DOCUMENT: the file's category. TODO: when set, the to-do requires a file of this category. */
  categoryId?: string | null;
  materials?: Material[] | null;
  questions?: Question[] | null;
};

/** Why an assignee cannot do a task as things stand — a warning, not a refusal. */
export type AccessProblem = "CANNOT_EDIT_FIELDS" | "CANNOT_UPLOAD";

export type TemplateSummary = {
  id: string;
  type: ProcessType;
  name: string;
  description: string | null;
  taskCount: number;
  archivedAt: string | null;
  updatedAt: string;
  hasProblems: boolean;
  /** Each task's day relative to the start day, for the small timeline; null = "by the start day". */
  dayOffsets: (number | null)[];
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
  /** The ids of the items of the same template this one waits for — the arrows on the canvas. */
  waitsFor: string[];
  /** A named person who cannot do this task for anybody. */
  accessProblem?: AccessProblem | null;
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
  /**
   * This item's name within the request — its id when it exists, anything unique when new. Items get new ids
   * on every save, so an arrow names keys, not ids.
   */
  key?: string;
  /** The keys of the items this one waits for (decision 10). */
  waitsFor?: string[];
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
  fields: {
    id: string;
    name: string | null;
    type: string | null;
    filled: boolean;
    isRequired: boolean;
    options: { id: string; label: string }[];
  }[] | null;
  category: Ref | null;
  completedAt: string | null;
  /** WAITING: the tasks it still waits for — "Waiting for …". Empty otherwise. */
  waitingFor: Ref[];
  materials: Material[];
  /** QUESTIONNAIRE: what it asks; null for the other kinds. */
  questions: Question[] | null;
  commentCount: number;
};

export type TaskComment = {
  id: string;
  author: Ref | null;
  body: string;
  createdAt: string;
  /** Written by whoever is reading. */
  mine: boolean;
};

/** A questionnaire answered — a row of the profile's Forms tab. */
export type QuestionnaireResponse = {
  id: string;
  title: string;
  processType: ProcessType | null;
  taskId: string | null;
  submittedBy: Ref | null;
  submittedAt: string;
  answers: { questionId: string; label: string; type: QuestionType; value: unknown }[];
};

/** A task added to a running process; its date is a calendar day. */
export type TaskAddRequest = {
  kind: TaskKind;
  title: string;
  description: string | null;
  dueDate: string | null;
  assigneeKind: TemplateAssigneeKind;
  assigneeUserId: string | null;
  config: TaskConfig | null;
};

/** What changes about one task of a running process; a missing part stays as it is. */
export type TaskUpdateRequest = {
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
  assigneeKind?: TemplateAssigneeKind | null;
  assigneeUserId?: string | null;
};

export type LifecycleFile = { id: string; name: string; mimeType: string | null; sizeBytes: number };

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
  /** The template items this one waits for, among those the summary keeps. */
  waitsFor: string[];
  /** The assignee cannot do it as things stand — said, not refused. */
  accessProblem: AccessProblem | null;
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
  /** Questionnaires answered in it — the person's, so they stay. */
  answersKept: number;
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
    materials: Material[];
    questions: Question[] | null;
    commentCount: number;
  }[];
};

export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
  PREBOARDING: "Preboarding",
  ONBOARDING: "Onboarding",
  OFFBOARDING: "Offboarding",
};

export const TASK_KIND_LABELS: Record<TaskKind, string> = {
  TODO: "To-do",
  FILL_FIELDS: "Fill in fields",
  DOCUMENT: "Upload document",
  ACKNOWLEDGE: "Acknowledge",
  QUESTIONNAIRE: "Questionnaire",
  REVIEW: "Review",
  NOMINATE_PEERS: "Nominate peers",
  APPROVE_PEERS: "Approve peers",
  APPROVE_REVIEW: "Approve review",
};

/** One line each, for choosing a kind: what the person is asked to do, and what closes it. */
export const TASK_KIND_DESCRIPTIONS: Record<TaskKind, string> = {
  TODO: "Something to do and tick off. Can ask for a file to be attached.",
  FILL_FIELDS: "Fields of the profile to fill in. Closes when every one holds a value.",
  DOCUMENT: "A file to upload into the person's documents. Closes when it arrives.",
  ACKNOWLEDGE: "A file or a link to read and confirm. Only the person it is for can confirm.",
  QUESTIONNAIRE: "Questions to answer. The answers are kept on the person's Forms tab.",
  REVIEW: "A performance review to write. Closes when it is submitted.",
  NOMINATE_PEERS: "Colleagues to nominate for a performance review. Closes when the nomination is sent.",
  APPROVE_PEERS: "Peers somebody nominated, to approve. Closes when they are approved.",
  APPROVE_REVIEW: "A manager review to approve before it is shared. Closes when approved or sent back.",
};

/** The kinds a template or process editor offers — every kind but a review's and its steps'. */
export const EDITABLE_TASK_KINDS = (Object.keys(TASK_KIND_LABELS) as TaskKind[]).filter(
  (k): k is EditableTaskKind => !isReviewTaskKind(k),
);

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  NUMBER: "Number",
  DATE: "Date",
  YES_NO: "Yes or no",
  SINGLE_CHOICE: "One choice",
  MULTIPLE_CHOICE: "Several choices",
};

export const ACCESS_PROBLEM_LABELS: Record<AccessProblem, string> = {
  CANNOT_EDIT_FIELDS: "Cannot edit these fields",
  CANNOT_UPLOAD: "Cannot upload this person's documents",
};

/** A to-do that names a category requires a file of it, which closes it. */
export const requiresFile = (task: { kind: TaskKind; category?: Ref | null; categoryName?: string | null }) =>
  task.kind === "TODO" && Boolean(task.category ?? task.categoryName);

/** What a template may name — LINE_MANAGER is an automation's, never offered here. */
export const ASSIGNEE_KIND_LABELS: Record<TemplateAssigneeKind, string> = {
  TARGET: "The new person",
  ONBOARDING_MANAGER: "Onboarding manager",
  SPECIFIC_USER: "Specific person",
};

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  PARTIALLY_FAILED: "Partially failed",
  CANCELLED: "Cancelled",
};

export const ASSIGNEE_PROBLEM_LABELS: Record<AssigneeProblem, string> = {
  MISSING: "Nobody is assigned",
  LEFT: "Has left the company",
  NOT_STARTED_DRAFT: "Not an employee yet",
};

/**
 * "7 days before start", "On the start day", "3 days after start", "By the start day" — or, for an offboarding,
 * counted from the last working day: "By the last day", "2 days after the last day".
 */
export const describeDue = (dueKind: DueKind, offsetDays: number | null | undefined, type?: ProcessType | null): string => {
  const leaving = type === "OFFBOARDING";
  if (dueKind === "BEFORE_START") return leaving ? "By the last day" : "By the start day";
  const n = offsetDays ?? 0;
  if (n === 0) return leaving ? "On the last day" : "On the start day";
  const days = Math.abs(n) === 1 ? "1 day" : `${Math.abs(n)} days`;
  if (leaving) return n < 0 ? `${days} before the last day` : `${days} after the last day`;
  return n < 0 ? `${days} before start` : `${days} after start`;
};

/**
 * An assignee kind as an offboarding says it: the leaver, and the manager who runs it — the same role the
 * product calls the onboarding manager everywhere else.
 */
export const assigneeKindLabel = (kind: TemplateAssigneeKind, type?: ProcessType | null): string => {
  if (type !== "OFFBOARDING") return ASSIGNEE_KIND_LABELS[kind];
  if (kind === "TARGET") return "The leaver";
  if (kind === "ONBOARDING_MANAGER") return "Offboarding manager";
  return ASSIGNEE_KIND_LABELS[kind];
};
