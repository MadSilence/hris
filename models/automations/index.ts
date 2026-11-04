/**
 * Settings → Automation, and the assignment modal's live rules.
 * Design and API: (claude)/technical_design/AUTOMATIONS_DESIGN.md § 8.
 * Mirrors hris-api `features/automations/dto/AutomationDTOs` and `features/automations/model/*`.
 */
import type { ReviewKind } from "@/models/reviews";
import type { Segment } from "@/models/segment/Segment";
import type { HolidayCalendarBindingRef } from "@/models/publicHolidays/binding";

// ── vocabulary ────────────────────────────────────────────────────────────────────────────────

export type AutomationRuleStatus = "DISABLED" | "ENABLED" | "PAUSED" | "ARCHIVED";
/** SYSTEM: a holiday calendar binding's rule — read-only here, changed through the place's Holiday Calendar field. */
export type AutomationRuleOrigin = "BUILDER" | "ASSIGNMENT" | "SYSTEM";
export type AutomationTriggerType =
  | "PERSON_HIRED"
  | "TERMINATION_SCHEDULED"
  | "LAST_WORKING_DAY_ARRIVES"
  | "DATE_OFFSET"
  | "JOINS_SEGMENT"
  | "FIELD_CHANGED"
  /** Something happened in another module — time off, a process completing, a review. */
  | "EVENT"
  /** On a schedule, once per period for each person of the segment. */
  | "SCHEDULE";
export type AutomationActionType =
  | "NOTIFY"
  | "SEND_EMAIL"
  | "CREATE_TASK"
  | "ASSIGN"
  | "UNASSIGN"
  | "GRANT_TIME_OFF_POLICY"
  | "START_REVIEW"
  /** Holds the rest of the run until a task of it is done or a field is filled, at most so many days. */
  | "WAIT_UNTIL"
  /** Asks somebody to approve; the rest waits for the answer, and a refusal stops it. */
  | "REQUEST_APPROVAL";
export type AutomationLatePolicy = "RUN_LATE" | "SKIP";
export type AutomationRunStatus = "SCHEDULED" | "IN_PROGRESS" | "DONE" | "SKIPPED" | "FAILED" | "CANCELLED";
export type AutomationStepStatus = "SCHEDULED" | "DONE" | "SKIPPED" | "FAILED" | "CANCELLED" | "STOPPED" | "WAITING";
export type DateField = "HIRE_DATE" | "PROBATION_END" | "LAST_WORKING_DAY" | "DATE_OF_BIRTH" | "ATTRIBUTE";
export type TriggerDirection = "BEFORE" | "ON" | "AFTER";
export type RecipientKind =
  | "PERSON"
  | "MANAGER"
  | "ONBOARDING_MANAGER"
  | "ROLE"
  | "USER"
  /** The head of the person's department. */
  | "DEPARTMENT_HEAD"
  /** Their manager's manager. */
  | "MANAGERS_MANAGER"
  /** A time off event: whoever decides or decided the request. */
  | "APPROVER"
  /** A review event: whoever wrote the review (never an anonymous one). */
  | "REVIEWER";
export type AutomationEvent =
  | "TIME_OFF_REQUESTED"
  | "TIME_OFF_APPROVED"
  | "TIME_OFF_REJECTED"
  | "TIME_OFF_CANCELLED"
  | "PROCESS_COMPLETED"
  | "REVIEW_SUBMITTED"
  | "REVIEW_SHARED";
/** What an event's offsets count from. */
export type EventAnchor = "EVENT" | "LEAVE_START" | "LEAVE_END";
/** A change dated ahead: the day it takes effect (default), or the day it is recorded. */
export type ChangeTiming = "EFFECTIVE" | "RECORDED";
export type ScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
export type WaitUntil = "TASK_DONE" | "FIELD_FILLED";
export type OnTimeout = "CONTINUE" | "STOP" | "STOP_AND_TELL";

/** A condition on an event's own fields: all / any / not over comparisons. */
export type EventCondition = {
  kind: "ALL" | "ANY" | "NOT" | "MATCH";
  children?: EventCondition[] | null;
  field?: string | null;
  op?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | null;
  value?: string | null;
};
export type AssignableType =
  | "ROLE"
  | "TIME_OFF_POLICY"
  | "TEAM"
  | "DEPARTMENT"
  | "LEGAL_ENTITY"
  | "OFFICE"
  | "JOB"
  | "PUBLIC_HOLIDAY_CALENDAR";
export type AssignmentOrigin = "HAND" | "RULE";
export type AssignmentRecordStatus = "CREATED" | "SCHEDULED" | "SKIPPED" | "FAILED" | "REMOVED";
export type AssignmentSkipReason =
  | "DUPLICATE"
  | "USER_ARCHIVED"
  | "USER_NOT_FOUND"
  | "DOMAIN_ERROR"
  | "INVALID_TARGET"
  | "HAND_OVERRIDE"
  | "RULE_CONFLICT";
/** KEEP: runs in flight stay on their version. MOVE: every run that has not started is re-planned. */
export type InFlightChoice = "KEEP" | "MOVE";
/** NONE: forward only (the default). ALL: also everybody whose moment already passed. */
export type BackfillChoice = "NONE" | "ALL";

/** The placeholders a text may use, as `{name}`. The catalogue sends the same list. */
export const AUTOMATION_PLACEHOLDERS = [
  "firstName",
  "lastName",
  "fullName",
  "startDate",
  "lastWorkingDay",
  "managerName",
  "companyName",
  "jobTitle",
  "office",
  "department",
] as const;
export type AutomationPlaceholder = (typeof AUTOMATION_PLACEHOLDERS)[number];

/**
 * Reasons a run or a step carries. Free text on the wire — a failure carries the engine's error, a
 * late run `LATE_DATA: planned for 2026-10-14` — so these are the known prefixes, not a closed set.
 */
export const AUTOMATION_REASONS = [
  "FORWARD_ONLY",
  "LATE_DATA",
  "MOMENT_PASSED",
  "NO_LONGER_MATCHES",
  "ANCHOR_CLEARED",
  "RULE_DISABLED",
  "RULE_PAUSED",
  "PERSON_LEFT",
  "CANCELLED_BY_HAND",
  "TERMINATION_CANCELLED",
  "NO_RECIPIENT",
  "NO_ONBOARDING_MANAGER",
  "NOT_ASSIGNED",
  "HAND_OVERRIDE",
  "RULE_CONFLICT",
  "DUPLICATE",
  "OUTRANKED",
  "MISSING_PLACEHOLDER",
  "STRUCTURAL",
  "CONDITION_NOT_MET",
  "OBJECT_CLOSED",
  "MISSED",
  "TIMED_OUT",
  "DECLINED",
  "NO_APPROVER",
  "AUTHOR_LEFT",
  "AUTHOR_LACKS_RIGHT",
] as const;

// ── the definition ────────────────────────────────────────────────────────────────────────────

export type TriggerSpec = {
  type: AutomationTriggerType;
  /** DATE_OFFSET: a DateField. FIELD_CHANGED: hireDate | probationEnd | firstName | lastName | email | manager | job | attr:<id>. */
  field?: string | null;
  /** DATE_OFFSET on ATTRIBUTE: the DATE attribute. */
  attributeId?: string | null;
  direction?: TriggerDirection | null;
  /** Calendar days, never negative — the direction says which way. */
  days?: number | null;
  everyYear?: boolean | null;
  /** FIELD_CHANGED only; not supported for custom fields. For a team: removed from / added to. */
  from?: string | null;
  to?: string | null;
  /** FIELD_CHANGED: a change dated ahead fires on its day (default) or when recorded. */
  when?: ChangeTiming | null;
  /** EVENT */
  event?: AutomationEvent | null;
  eventConditions?: EventCondition | null;
  anchor?: EventAnchor | null;
  /** SCHEDULE */
  frequency?: ScheduleFrequency | null;
  /** SCHEDULE weekly: 1 (Monday) … 7 (Sunday). */
  weekday?: number | null;
  /** SCHEDULE monthly and quarterly: 1 … 28, or 0 for the last day. */
  dayOfMonth?: number | null;
};

export type RecipientSpec = {
  kind: RecipientKind;
  userId?: string | null;
  roleId?: string | null;
};

/** One action. Each type reads its own fields; the rest are omitted. */
export type ActionSpec = {
  type: AutomationActionType;
  /** Calendar days from the trigger's moment; negative is before it. */
  offsetDays?: number | null;
  /** NOTIFY, SEND_EMAIL */
  recipients?: RecipientSpec[] | null;
  /** NOTIFY */
  text?: string | null;
  /** SEND_EMAIL */
  subject?: string | null;
  /** SEND_EMAIL — plain text, newlines kept. */
  body?: string | null;
  /** CREATE_TASK */
  assignee?: RecipientSpec | null;
  title?: string | null;
  description?: string | null;
  /** CREATE_TASK: due on the moment plus this; null = no due date. */
  dueOffsetDays?: number | null;
  /** ASSIGN, UNASSIGN — never TIME_OFF_POLICY (that is GRANT_TIME_OFF_POLICY). */
  assignableType?: AssignableType | null;
  assignableId?: string | null;
  /** GRANT_TIME_OFF_POLICY */
  policyId?: string | null;
  /** START_REVIEW: the review cycle template a one-person review is started from (REVIEWS_PLAN.md 11.3). */
  templateCycleId?: string | null;
  /** START_REVIEW: each kind of the template's window, in calendar days from the moment. */
  reviewWindows?: ReviewWindowSpec[] | null;
  /** START_REVIEW, a template that releases its results on a date: that date, in days from the moment. */
  releaseOffsetDays?: number | null;
  /** Any action: "only if" — a segment the person must match when the step runs. */
  condition?: Segment | null;
  /** WAIT_UNTIL */
  until?: WaitUntil | null;
  /** WAIT_UNTIL on TASK_DONE: the position of a CREATE_TASK action before it. */
  taskStep?: number | null;
  /** WAIT_UNTIL on FIELD_FILLED: sys:<field> or attr:<id>. */
  field?: string | null;
  /** WAIT_UNTIL, REQUEST_APPROVAL: the longest it waits. */
  maxDays?: number | null;
  onTimeout?: OnTimeout | null;
};

/** One kind of review of a START_REVIEW action, counted in days from the moment as a task's due offset is. */
export type ReviewWindowSpec = {
  kind: ReviewKind;
  opensOffsetDays?: number | null;
  dueOffsetDays?: number | null;
  /** Peers the person nominates only. */
  nominationOffsetDays?: number | null;
  approvalOffsetDays?: number | null;
};

export type AutomationDefinition = {
  trigger: TriggerSpec;
  conditions: Segment;
  actions: ActionSpec[];
  latePolicy?: AutomationLatePolicy;
  /** How far back "late" reaches; null = the default (the catalogue's defaultLateWindowDays). */
  lateWindowDays?: number | null;
};

// ── rules ─────────────────────────────────────────────────────────────────────────────────────

export type PersonRef = { id: string; name: string | null };

export type RunCounts = {
  scheduled: number;
  inProgress: number;
  done: number;
  skipped: number;
  failed: number;
  cancelled: number;
};

export type AutomationRuleSummary = {
  id: string;
  name: string;
  description: string | null;
  status: AutomationRuleStatus;
  origin: AutomationRuleOrigin;
  triggerType: AutomationTriggerType | null;
  versionNo: number;
  author: PersonRef | null;
  pausedReason: string | null;
  enabledAt: string | null;
  updatedAt: string;
  runs: RunCounts;
  /** The current version's definition, so the list can read each rule as one sentence. */
  definition?: AutomationDefinition | null;
  /** When a run of this rule last finished; null when none has. */
  lastRunAt?: string | null;
  /** A holiday calendar binding's rule: what it is of. */
  binding?: HolidayCalendarBindingRef | null;
};

export type AutomationRule = {
  id: string;
  name: string;
  description: string | null;
  status: AutomationRuleStatus;
  origin: AutomationRuleOrigin;
  pausedReason: string | null;
  pausedAt: string | null;
  author: PersonRef | null;
  versionNo: number;
  definition: AutomationDefinition | null;
  enabledAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  runs: RunCounts;
  /** A holiday calendar binding's rule: what it is of. */
  binding?: HolidayCalendarBindingRef | null;
  /** Told of a failure or a pause besides the author. */
  alsoNotify?: PersonRef[];
  /** False when the author has left or cannot sign in — the rule needs somebody to take it over. */
  authorActive?: boolean;
};

export type AutomationVersion = {
  versionNo: number;
  definition: AutomationDefinition;
  createdAt: string;
  createdBy: PersonRef | null;
};

export type CreateAutomationRequest = { name: string; description?: string | null; definition: AutomationDefinition };
export type RenameAutomationRequest = { name: string; description?: string | null; alsoNotifyUserIds?: string[] | null };
export type PublishAutomationRequest = {
  definition: AutomationDefinition;
  inFlight?: InFlightChoice;
  /** The version the editor was opened on; a newer one refuses the publish (AU00007). */
  expectedVersionNo?: number | null;
  /** One firing sends more than the preview's threshold of messages, and the author means it. */
  confirmVolume?: boolean | null;
};
export type PublishAutomationResult = { rule: AutomationRule; movedRuns: number; keptRuns: number };
export type EnableAutomationRequest = { backfill?: BackfillChoice; confirmVolume?: boolean | null };
export type AutomationActivationResult = {
  rule: AutomationRule;
  plannedRuns: number;
  consideredRuns: number;
  cancelledRuns: number;
  /** Runs that already finished and stay as they are — "done, cannot be undone". */
  completedRuns: number;
};

// ── preview ───────────────────────────────────────────────────────────────────────────────────

export type AutomationPreviewRequest = {
  ruleId?: string | null;
  definition: AutomationDefinition;
  samplePersonId?: string | null;
};

export type UpcomingFiring = {
  date: string;
  person: PersonRef;
  position: number;
  actionType: AutomationActionType;
  summary: string;
  late: boolean;
};

export type RenderedSample = {
  position: number;
  actionType: AutomationActionType;
  person: PersonRef;
  recipients: PersonRef[];
  /** SEND_EMAIL: the subject. CREATE_TASK: the title. */
  subject: string | null;
  /** NOTIFY: the text. SEND_EMAIL: the body. CREATE_TASK: the description. */
  text: string | null;
  missingPlaceholders: string[];
};

export type AssignmentPreviewItem = {
  person: PersonRef;
  outcome: "ASSIGN" | "SKIP";
  reason: AssignmentSkipReason | null;
  conflictRule: PersonRef | null;
};

export type AssignmentImpact = {
  position: number;
  assignableType: AssignableType;
  assignableId: string;
  willAssign: number;
  skippedByReason: Partial<Record<AssignmentSkipReason, number>>;
  items: AssignmentPreviewItem[];
};

export type AssignmentConflict = {
  person: PersonRef;
  assignableType: AssignableType;
  value: string;
  otherRule: PersonRef | null;
  otherValue: string | null;
};

export type InFlightImpact = {
  scheduledRuns: number;
  inProgressRuns: number;
  completedRuns: number;
  wouldCancel: number;
  wouldAdd: number;
  /** Runs held by a wait or an approval — they stay on their version either way. */
  waitingRuns: number;
};

export type AutomationProblem = { path: string; code: string; message: string };

export type AutomationPreview = {
  matchingCount: number;
  matching: PersonRef[];
  /** Whom backfill ALL would add — the "people already here" question. */
  pastMomentCount: number;
  backfillCandidates: PersonRef[];
  /** Every step dated within the next 30 days. */
  upcoming: UpcomingFiring[];
  /** Nothing can be dated ahead (termination recorded, a field changed). */
  eventDriven: boolean;
  samples: RenderedSample[];
  assignments: AssignmentImpact[];
  conflicts: AssignmentConflict[];
  /** Only when ruleId was given — the publish dialog's counts. */
  inFlight: InFlightImpact | null;
  /** The same checks publish refuses on. */
  problems: AutomationProblem[];
  /** The notifications and emails one firing sends; above volumeThreshold publishing asks to confirm. */
  messagesPerFiring: number;
  volumeThreshold: number;
};

// ── runs ──────────────────────────────────────────────────────────────────────────────────────

export type AutomationRunStep = {
  id: string;
  position: number;
  actionType: AutomationActionType;
  summary: string;
  offsetDays: number;
  plannedDate: string | null;
  effectiveDate: string | null;
  status: AutomationStepStatus;
  reason: string | null;
  ranLate: boolean;
  /** taskId, taskTitle, assigneeUserId, recipientUserIds, subject, text, assignableType, assignableId, assignmentRecordId, conflictRuleId */
  result: Record<string, unknown>;
  finishedAt: string | null;
};

export type AutomationRun = {
  id: string;
  ruleId: string;
  ruleName: string | null;
  versionNo: number;
  person: PersonRef | null;
  occurrenceKey: string;
  triggerType: AutomationTriggerType;
  anchorDate: string | null;
  triggerDate: string | null;
  status: AutomationRunStatus;
  reason: string | null;
  ranLate: boolean;
  backfill: boolean;
  createdAt: string;
  finishedAt: string | null;
  steps: AutomationRunStep[];
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  /** The run log: runs about people the reader may not see — counted, never listed. */
  outsideScope?: number;
};

// ── catalogue ─────────────────────────────────────────────────────────────────────────────────

export type CatalogOption = { value: string; label: string };

/** What the builder may offer this author: actions they could not perform by hand are absent. */
export type AutomationCatalog = {
  triggers: AutomationTriggerType[];
  dateFields: CatalogOption[];
  dateAttributes: CatalogOption[];
  changeableFields: CatalogOption[];
  actions: AutomationActionType[];
  assignableTypes: AssignableType[];
  placeholders: string[];
  recipientKinds: Partial<Record<AutomationActionType, RecipientKind[]>>;
  defaultLateWindowDays: number;
  events: AutomationEventOption[];
};

/** One event an EVENT trigger may listen to, with what it offers. */
export type AutomationEventOption = {
  value: AutomationEvent;
  label: string;
  family: "TIME_OFF" | "PROCESS" | "REVIEW";
  /** type: TEXT, NUMBER, or the comma-separated values it can take. */
  fields: { name: string; label: string; type: string }[];
  placeholders: string[];
  countsFromLeave: boolean;
  recipientKinds: RecipientKind[];
};

// ── trying a rule, templates ──────────────────────────────────────────────────────────────────

export type AutomationTestItem = {
  position: number;
  actionType: AutomationActionType;
  outcome: "EMAILED" | "NOTIFIED" | "NOT_CREATED" | "NOT_SENT" | "NO_EMAIL";
  text: string | null;
  missingPlaceholders: string[];
};
export type AutomationTestResult = { person: PersonRef; items: AutomationTestItem[] };

export type SimulatedStep = {
  position: number;
  actionType: AutomationActionType;
  summary: string;
  date: string | null;
  late: boolean;
  conditionMet: boolean | null;
  note: string | null;
};
export type AutomationSimulation = {
  person: PersonRef;
  matches: boolean;
  moment: string | null;
  steps: SimulatedStep[];
  notes: string[];
};

export type AutomationTemplate = {
  key: string;
  name: string;
  description: string;
  category: string;
  definition: AutomationDefinition;
};

// ── live assignment rules (the assignment modal) ──────────────────────────────────────────────

export type LiveAssignmentRequest = {
  assignableType: AssignableType;
  assignableId: string;
  segment: Segment;
  name?: string | null;
};

export type LiveAssignmentPreview = {
  matching: number;
  willAssign: number;
  skippedByReason: Partial<Record<AssignmentSkipReason, number>>;
  items: AssignmentPreviewItem[];
  conflicts: AssignmentConflict[];
};

export type LiveAssignmentCreated = {
  ruleId: string;
  ruleName: string;
  willAssign: number;
  skippedByReason: Partial<Record<AssignmentSkipReason, number>>;
  /** How many were assigned before the response returned. */
  appliedNow: number;
};

export type AssignmentHistoryItem = {
  recordId: string;
  person: PersonRef | null;
  status: AssignmentRecordStatus;
  origin: AssignmentOrigin;
  rule: PersonRef | null;
  by: PersonRef | null;
  at: string;
  skipReason: AssignmentSkipReason | null;
};

export type AssignmentProvenance = {
  assignableType: AssignableType;
  assignableId: string;
  assignableName: string | null;
  origin: AssignmentOrigin;
  rule: PersonRef | null;
  since: string | null;
  /** A live rule that would set something else here, held off by this hand value — "Return to rule". */
  overriddenRule: PersonRef | null;
  /** A holiday calendar inherited from where the person works: which binding gave it ("From office: Berlin"). */
  source?: HolidayCalendarBindingRef | null;
  /** An own holiday calendar: the binding it holds off — "Return to Rule" applies it. */
  overriddenSource?: HolidayCalendarBindingRef | null;
};

export type ReturnToRuleRequest = {
  userId: string;
  assignableType: AssignableType;
  assignableId?: string | null;
};

export * from "./labels";
