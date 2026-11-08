/**
 * Automations (the redesign, (claude)/development_plan/AUTOMATIONS_REDESIGN_PLAN.md), and the assignment modal's live
 * rules. Mirrors hris-api `features/automations/dto/AutomationDTOs` and `features/automations/model/*`.
 * The screens are specified in `design/screens/automations-*`.
 */
import type { Segment } from "@/models/segment/Segment";
import type { HolidayCalendarBindingRef } from "@/models/publicHolidays/binding";

// ── vocabulary ────────────────────────────────────────────────────────────────────────────────

/** DRAFT: never turned on. PAUSED: turned off by hand, or by the system (see `AutomationPause`). */
export type AutomationStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
export type AutomationPauseReason = "MANUAL" | "OWNER_LEFT" | "OWNER_LACKS_RIGHT" | "TARGET_GONE";
/** SYSTEM: a holiday calendar binding's — read only, changed through the place's Holiday Calendar field. */
export type AutomationOrigin = "BUILDER" | "ASSIGNMENT" | "SYSTEM";
export type AutomationTriggerType =
  | "PERSON_HIRED"
  | "TERMINATION_SCHEDULED"
  | "LAST_WORKING_DAY_ARRIVES"
  | "DATE_OFFSET"
  | "JOINS_SEGMENT"
  | "FIELD_CHANGED"
  | "EVENT"
  | "SCHEDULE";
export type AutomationStepType =
  | "NOTIFY"
  | "SEND_EMAIL"
  | "CREATE_TASK"
  | "ASSIGN"
  | "UNASSIGN"
  | "GRANT_TIME_OFF_POLICY"
  | "START_REVIEW"
  | "WAIT_UNTIL"
  | "REQUEST_APPROVAL"
  | "SPLIT"
  | "SIGN_DOCUMENT"
  | "SEND_SURVEY";
export type AutomationLatePolicy = "RUN_LATE" | "SKIP";
export type AutomationRunStatus = "SCHEDULED" | "IN_PROGRESS" | "WAITING" | "DONE" | "SKIPPED" | "FAILED" | "CANCELLED";
export type AutomationStepStatus = "SCHEDULED" | "DONE" | "SKIPPED" | "FAILED" | "CANCELLED" | "STOPPED" | "WAITING";
export type DateField = "HIRE_DATE" | "PROBATION_END" | "LAST_WORKING_DAY" | "DATE_OF_BIRTH" | "ATTRIBUTE" | "FIXED";
export type TriggerDirection = "BEFORE" | "ON" | "AFTER";
export type RecipientKind =
  | "PERSON"
  | "MANAGER"
  | "ONBOARDING_MANAGER"
  | "ROLE"
  | "USER"
  | "DEPARTMENT_HEAD"
  | "MANAGERS_MANAGER"
  | "APPROVER";
export type AutomationEvent =
  | "TIME_OFF_REQUESTED"
  | "TIME_OFF_APPROVED"
  | "TIME_OFF_REJECTED"
  | "TIME_OFF_CANCELLED"
  | "PROCESS_COMPLETED";
export type EventAnchor = "EVENT" | "LEAVE_START" | "LEAVE_END";
export type ChangeTiming = "EFFECTIVE" | "RECORDED";
export type ScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type OnLeave = "TAKE_BACK" | "KEEP";
export type WaitUntil = "TASK_DONE" | "FIELD_FILLED";
export type OnTimeout = "CONTINUE" | "STOP" | "STOP_AND_TELL";
export type NoAnswer = "ASK_THEIR_MANAGER" | "STOP" | "DECLINE";
export type CalendarRelation = "OFFICE_CALENDAR" | "COUNTRY_CALENDAR" | "LEGAL_ENTITY_CALENDAR";
export type TimingMode = "RIGHT_AWAY" | "LATER";
export type TimingDirection = "BEFORE" | "AFTER";

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
/** KEEP: runs going stay on their version. MOVE: every run that has not started follows the changes. */
export type InFlightChoice = "KEEP" | "MOVE";
/** NONE: only new cases (the default). ALL: also those already there or waiting. */
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

// ── the definition ────────────────────────────────────────────────────────────────────────────

export type TriggerSpec = {
  type: AutomationTriggerType;
  field?: string | null;
  attributeId?: string | null;
  /** "Pick a date": one date with a year (`field: "FIXED"`). */
  date?: string | null;
  direction?: TriggerDirection | null;
  days?: number | null;
  everyYear?: boolean | null;
  from?: string | null;
  to?: string | null;
  when?: ChangeTiming | null;
  event?: AutomationEvent | null;
  eventConditions?: EventCondition | null;
  anchor?: EventAnchor | null;
  /** A process event: `ANY_ONBOARDING`, `ANY_OFFBOARDING` or a template's id. */
  process?: string | null;
  frequency?: ScheduleFrequency | null;
  weekdays?: number[] | null;
  /** Monthly "on a weekday": 1–4, or 0 for the last. */
  weekOfMonth?: number | null;
  dayOfMonth?: number | null;
  /** Quarterly: 1–3, the month of the quarter. Yearly: 1–12. */
  monthOfPeriod?: number | null;
  at?: string | null;
  /** `PERSON` (each person's own, the default), `COMPANY`, or an IANA zone. */
  timeZone?: string | null;
  onLeave?: OnLeave | null;
};

export type RecipientSpec = { kind: RecipientKind; userId?: string | null; roleId?: string | null };

export type Timing = {
  mode: TimingMode;
  days?: number | null;
  direction?: TimingDirection | null;
  /** `PREVIOUS_STEP` (the default), a DateField name, or `ATTRIBUTE:<id>`. */
  countedFrom?: string | null;
  at?: string | null;
};

export type SplitPath = { id: string; name: string; condition?: Segment | null; steps: StepSpec[] };

/** One step of the tree. Each type reads its own fields. */
export type StepSpec = {
  id: string;
  type: AutomationStepType;
  when?: Timing | null;
  skipped?: boolean | null;
  condition?: Segment | null;
  recipients?: RecipientSpec[] | null;
  text?: string | null;
  subject?: string | null;
  body?: string | null;
  assignee?: RecipientSpec | null;
  title?: string | null;
  description?: string | null;
  dueDays?: number | null;
  assignableType?: AssignableType | null;
  assignableId?: string | null;
  relation?: CalendarRelation | null;
  policyId?: string | null;
  formId?: string | null;
  until?: WaitUntil | null;
  taskStepId?: string | null;
  field?: string | null;
  maxDays?: number | null;
  onTimeout?: OnTimeout | null;
  tell?: RecipientSpec[] | null;
  ifNoAnswer?: NoAnswer | null;
  remindDaily?: boolean | null;
  approved?: StepSpec[] | null;
  declined?: StepSpec[] | null;
  question?: string | null;
  paths?: SplitPath[] | null;
  otherwise?: SplitPath | null;
  documents?: string[] | null;
  survey?: string | null;
};

export type AutomationDefinition = {
  trigger: TriggerSpec | null;
  conditions: Segment;
  steps: StepSpec[];
  latePolicy?: AutomationLatePolicy | null;
  lateWindowDays?: number | null;
};

// ── automations ───────────────────────────────────────────────────────────────────────────────

export type PersonRef = { id: string | null; name: string | null };
export type PersonCard = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  office: string | null;
};

export type AutomationPause = {
  reason: AutomationPauseReason;
  by: PersonRef | null;
  at: string | null;
  detail: string | null;
  stepId: string | null;
};

export type AutomationSummary = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: AutomationStatus;
  origin: AutomationOrigin;
  trigger: TriggerSpec | null;
  versionNo: number;
  owner: PersonRef | null;
  pause: AutomationPause | null;
  lastRun: { runId: string | null; at: string | null; failed: boolean } | null;
  runs: number;
  waiting: number;
  updatedAt: string | null;
  archivedAt: string | null;
  archivedBy: PersonRef | null;
  binding?: HolidayCalendarBindingRef | null;
};

export type Automation = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  status: AutomationStatus;
  origin: AutomationOrigin;
  pause: AutomationPause | null;
  owner: PersonRef | null;
  ownerActive: boolean;
  versionNo: number;
  definition: AutomationDefinition | null;
  createdAt: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  runs: number;
  runsGoing: number;
  binding?: HolidayCalendarBindingRef | null;
};

export type AutomationVersion = {
  versionNo: number;
  current: boolean;
  /** JSON: `{ trigger, whoItRunsFor, added, removed, changed }`; null on the first version. */
  summary: string | null;
  createdAt: string | null;
  createdBy: PersonRef | null;
  runsOnIt: number;
  definition: AutomationDefinition;
};

export type CreateAutomationRequest = {
  name: string;
  description?: string | null;
  icon?: string | null;
  definition: AutomationDefinition;
};
export type DraftAutomationRequest = CreateAutomationRequest;
export type RenameAutomationRequest = { name: string; description?: string | null; icon?: string | null };
export type SaveAutomationRequest = {
  definition: AutomationDefinition;
  inFlight?: InFlightChoice;
  expectedVersionNo?: number | null;
  confirmVolume?: boolean | null;
};
export type SaveAutomationResult = { automation: Automation; movedRuns: number; keptRuns: number };
export type TurnOnRequest = { backfill?: BackfillChoice; confirmVolume?: boolean | null };
export type AutomationActivation = { automation: Automation; plannedRuns: number; cancelledRuns: number };

// ── checking ──────────────────────────────────────────────────────────────────────────────────

export type CheckAutomationRequest = {
  automationId?: string | null;
  definition: AutomationDefinition;
  samplePersonId?: string | null;
};
export type AutomationProblem = { stepId: string | null; field: string | null; code: string; message: string };
export type StepExample = {
  stepId: string;
  actionType: AutomationStepType;
  person: PersonRef | null;
  recipients: PersonRef[];
  title: string | null;
  text: string | null;
  dueDate: string | null;
  assigns: string | null;
  missingPlaceholders: string[];
};
export type AutomationCheck = {
  matchingCount: number;
  matching: PersonRef[];
  places: string[];
  waitingCases: number;
  messagesPerFiring: number;
  volumeThreshold: number;
  audiences: string[];
  runsGoing: number;
  examples: StepExample[];
  problems: AutomationProblem[];
};

// ── the test run ──────────────────────────────────────────────────────────────────────────────

export type TestCase = {
  id: string;
  person: PersonRef;
  label: string;
  startDate: string | null;
  endDate: string | null;
  example: boolean;
};
export type ApprovalPick = "APPROVES" | "DECLINES" | "NO_ANSWER";
export type TestRunRequest = {
  automationId?: string | null;
  definition: AutomationDefinition;
  caseId: string;
  decisions?: Record<string, ApprovalPick>;
};
export type TestRunOutcome =
  | "WOULD_SEND"
  | "WOULD_CREATE"
  | "WOULD_ASSIGN"
  | "WOULD_WAIT"
  | "DECIDED"
  | "PATH"
  | "SKIPPED_PATH"
  | "SKIPPED_CONDITION"
  | "SKIPPED_FOR_NOW"
  | "NOT_CONNECTED"
  | "NO_RECIPIENT"
  | "MISSING_DETAILS";
export type TestRunStep = {
  stepId: string;
  actionType: AutomationStepType;
  outcome: TestRunOutcome;
  title: string | null;
  recipients: PersonRef[];
  detail: string | null;
  date: string | null;
  path: string | null;
  pathName: string | null;
  sendable: boolean;
  missingPlaceholders: string[];
};
export type TestRun = { testCase: TestCase; triggerLine: string; steps: TestRunStep[]; testItems: number };
export type TestSendRequest = { automationId?: string | null; definition: AutomationDefinition; caseId: string; stepId: string };
export type TestSent = { stepId: string; outcome: "SENT" | "EMAILED" | "CREATED" | "NO_EMAIL"; testItems: number };

export type AutomationTemplate = {
  key: string;
  name: string;
  description: string;
  category: string;
  definition: AutomationDefinition;
};

// ── runs ──────────────────────────────────────────────────────────────────────────────────────

export type AutomationRunStep = {
  id: string;
  stepId: string;
  position: number;
  path: string;
  actionType: AutomationStepType;
  plannedDate: string | null;
  effectiveDate: string | null;
  runAt: string | null;
  status: AutomationStepStatus;
  reason: string | null;
  ranLate: boolean;
  result: Record<string, unknown>;
  finishedAt: string | null;
};

export type AutomationRun = {
  id: string;
  ruleId: string;
  ruleName: string | null;
  ruleIcon: string | null;
  versionNo: number;
  person: PersonCard | null;
  occurrenceKey: string;
  triggerType: AutomationTriggerType;
  anchorDate: string | null;
  triggerDate: string | null;
  about: Record<string, unknown>;
  status: AutomationRunStatus;
  reason: string | null;
  ranLate: boolean;
  daysLate: number;
  createdAt: string | null;
  finishedAt: string | null;
  nextDate: string | null;
  steps: AutomationRunStep[] | null;
};

export type RunCounts = {
  all: number;
  failed: number;
  waiting: number;
  scheduled: number;
  done: number;
  inProgress: number;
  skipped: number;
  cancelled: number;
  next7Days: number;
};

export type RunChip = "ALL" | "FAILED" | "WAITING" | "SCHEDULED" | "DONE" | "NEXT_7_DAYS";
export type RunQuery = {
  automationId?: string | null;
  chip?: RunChip;
  q?: string | null;
  segment?: Segment | null;
  cursor?: string | null;
  size?: number;
  /** Activity: the chips count what the search and the Filters show, also for one automation (V8b). */
  countsFollowSearch?: boolean;
};
export type RunSlice = { content: AutomationRun[]; nextCursor: string | null; counts: RunCounts; outsideScope: number };

/** A page, as Spring sends it — the assignment history. */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

// ── catalogue ─────────────────────────────────────────────────────────────────────────────────

export type CatalogOption = { value: string; label: string | null };
export type RoleOption = { id: string; name: string };

export type AutomationEventOption = {
  value: AutomationEvent;
  family: "TIME_OFF" | "PROCESS";
  fields: { name: string; type: string }[];
  placeholders: string[];
  countsFromLeave: boolean;
  recipientKinds: RecipientKind[];
};

export type AutomationCatalog = {
  triggers: AutomationTriggerType[];
  dateFields: CatalogOption[];
  dateAttributes: CatalogOption[];
  changeableFields: CatalogOption[];
  actions: AutomationStepType[];
  assignableTypes: AssignableType[];
  placeholders: string[];
  recipientKinds: RecipientKind[];
  roles: RoleOption[];
  relations: CalendarRelation[];
  defaultLateWindowDays: number;
  events: AutomationEventOption[];
  processTemplates: CatalogOption[];
  reviewForms: CatalogOption[];
};

// ── live assignment rules (the assignment modal) ──────────────────────────────────────────────

export type AssignmentPreviewItem = {
  person: PersonRef | null;
  outcome: "ASSIGN" | "SKIP";
  reason: AssignmentSkipReason | null;
  conflictRule: PersonRef | null;
};

export type AssignmentConflict = {
  person: PersonRef | null;
  assignableType: AssignableType;
  value: string;
  otherRule: PersonRef | null;
  otherValue: string | null;
};

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

export * from "./moment";
