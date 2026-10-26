/**
 * Words for the automation vocabulary — one place, so the list, the builder, the run log and the
 * profile say the same thing about the same state. Labels are Title Case (`ui/NAMING.md`); the
 * sentence pieces are prose.
 */
import { formatDisplayDate } from "@/lib/date";
import type {
  ActionSpec,
  AssignableType,
  AutomationActionType,
  AutomationRuleStatus,
  AutomationRunStatus,
  AutomationStepStatus,
  AutomationTriggerType,
  CatalogOption,
  RecipientKind,
  RecipientSpec,
  TriggerSpec,
} from "./index";

export const TRIGGER_LABELS: Record<AutomationTriggerType, string> = {
  PERSON_HIRED: "Someone Is Hired",
  DATE_OFFSET: "A Date Comes Round",
  JOINS_SEGMENT: "Someone Starts Matching",
  FIELD_CHANGED: "A Field Changes",
  TERMINATION_SCHEDULED: "A Termination Is Recorded",
  LAST_WORKING_DAY_ARRIVES: "The Last Working Day Arrives",
};

/** One line under each trigger in the picker: what makes it fire. */
export const TRIGGER_HINTS: Record<AutomationTriggerType, string> = {
  PERSON_HIRED: "Counts from the hire date, as soon as there is one.",
  DATE_OFFSET: "Some days before, on or after a date on the profile — once, or every year.",
  JOINS_SEGMENT: "The day somebody first matches the conditions below.",
  FIELD_CHANGED: "Every time the field changes, optionally from one value to another.",
  TERMINATION_SCHEDULED: "The day a termination is recorded.",
  LAST_WORKING_DAY_ARRIVES: "Counts from the person's last working day.",
};

export const ACTION_LABELS: Record<AutomationActionType, string> = {
  SEND_EMAIL: "Send Email",
  NOTIFY: "Send Notification",
  CREATE_TASK: "Create Task",
  ASSIGN: "Assign",
  UNASSIGN: "Unassign",
  GRANT_TIME_OFF_POLICY: "Grant Time Off Policy",
};

export const RECIPIENT_LABELS: Record<RecipientKind, string> = {
  PERSON: "The Person",
  MANAGER: "Their Manager",
  ONBOARDING_MANAGER: "Their Onboarding Manager",
  ROLE: "Everyone With a Role",
  USER: "A Named Person",
};

export const ASSIGNABLE_LABELS: Record<AssignableType, string> = {
  ROLE: "Role",
  TIME_OFF_POLICY: "Time Off Policy",
  TEAM: "Team",
  DEPARTMENT: "Department",
  LEGAL_ENTITY: "Legal Entity",
  OFFICE: "Office",
  JOB: "Position",
  PUBLIC_HOLIDAY_CALENDAR: "Holiday Calendar",
};

export const PLACEHOLDER_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  fullName: "Full Name",
  startDate: "Start Date",
  lastWorkingDay: "Last Working Day",
  managerName: "Manager Name",
  companyName: "Company Name",
  jobTitle: "Job Title",
  office: "Office",
  department: "Department",
};

export const RULE_STATUS_LABELS: Record<AutomationRuleStatus, string> = {
  ENABLED: "Enabled",
  DISABLED: "Disabled",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
};

export const RUN_STATUS_LABELS: Record<AutomationRunStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
  SKIPPED: "Skipped",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const STEP_STATUS_LABELS: Record<AutomationStepStatus, string> = {
  SCHEDULED: "Scheduled",
  DONE: "Done",
  SKIPPED: "Skipped",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  STOPPED: "Stopped",
};

/** The built-in dates, for a reader without the catalogue (it needs MANAGE). */
const DATE_FIELD_LABELS: Record<string, string> = {
  HIRE_DATE: "Hire Date",
  PROBATION_END: "Probation End",
  LAST_WORKING_DAY: "Last Working Day",
  DATE_OF_BIRTH: "Date of Birth",
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "on the day", "3 days after", "2 days before". */
export const offsetText = (days: number | null | undefined): string => {
  const d = days ?? 0;
  if (d === 0) return "on the day";
  return `${plural(Math.abs(d), "day")} ${d > 0 ? "after" : "before"}`;
};

/** A Title Case label inside a sentence: "Hire Date" reads "the hire date". */
const lower = (label: string) => label.toLowerCase();

/** The "When …" half of a rule as prose. `dateFields`/`changeableFields` are the catalogue's labels. */
export const triggerSentence = (
  trigger: TriggerSpec | null | undefined,
  lookups: { dateFields?: CatalogOption[]; dateAttributes?: CatalogOption[]; changeableFields?: CatalogOption[] } = {},
): string => {
  if (!trigger) return "When nothing is chosen yet";
  switch (trigger.type) {
    case "PERSON_HIRED":
      return "When someone is hired";
    case "TERMINATION_SCHEDULED":
      return "When a termination is recorded";
    case "LAST_WORKING_DAY_ARRIVES":
      return "On the last working day";
    case "JOINS_SEGMENT":
      return "When someone starts matching";
    case "FIELD_CHANGED": {
      const label = lookups.changeableFields?.find((o) => o.value === trigger.field)?.label ?? "a field";
      const fromTo = [trigger.from ? ` from ${trigger.from}` : "", trigger.to ? ` to ${trigger.to}` : ""].join("");
      return `When ${lower(label)} changes${fromTo}`;
    }
    case "DATE_OFFSET": {
      const fieldLabel =
        trigger.field === "ATTRIBUTE"
          ? lookups.dateAttributes?.find((o) => o.value === trigger.attributeId)?.label ?? "a date field"
          : lookups.dateFields?.find((o) => o.value === trigger.field)?.label ?? DATE_FIELD_LABELS[trigger.field ?? ""] ?? "a date";
      const days = trigger.days ?? 0;
      const when =
        trigger.direction === "ON" || days === 0
          ? `On the ${lower(fieldLabel)}`
          : `${plural(days, "day")} ${trigger.direction === "AFTER" ? "after" : "before"} the ${lower(fieldLabel)}`;
      return trigger.everyYear ? `${when}, every year` : when;
    }
    default:
      return "When something happens";
  }
};

const recipientWord = (r: RecipientSpec, names: { roles?: Map<string, string>; people?: Map<string, string> }): string => {
  switch (r.kind) {
    case "PERSON":
      return "the person";
    case "MANAGER":
      return "their manager";
    case "ONBOARDING_MANAGER":
      return "their onboarding manager";
    case "ROLE":
      return (r.roleId && names.roles?.get(r.roleId)) ? `everyone with ${names.roles.get(r.roleId)}` : "everyone with a role";
    case "USER":
      return (r.userId && names.people?.get(r.userId)) || "a named person";
    default:
      return "somebody";
  }
};

export const recipientsText = (
  recipients: RecipientSpec[] | null | undefined,
  names: { roles?: Map<string, string>; people?: Map<string, string> } = {},
): string => {
  const list = (recipients ?? []).map((r) => recipientWord(r, names));
  if (list.length === 0) return "nobody yet";
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
};

/** One action as prose: "email the person: Welcome, {firstName}", "assign office Berlin". */
export const actionSentence = (
  action: ActionSpec,
  names: { targets?: Map<string, string>; roles?: Map<string, string>; people?: Map<string, string> } = {},
): string => {
  const target = (type: AssignableType | null | undefined, id: string | null | undefined) => {
    const kind = type ? lower(ASSIGNABLE_LABELS[type]) : "something";
    const name = id ? names.targets?.get(id) : undefined;
    return name ? `${kind} ${name}` : kind;
  };
  switch (action.type) {
    case "SEND_EMAIL":
      return `Email ${recipientsText(action.recipients, names)}${action.subject ? `: ${action.subject}` : ""}`;
    case "NOTIFY":
      return `Notify ${recipientsText(action.recipients, names)}${action.text ? `: ${action.text}` : ""}`;
    case "CREATE_TASK":
      return `Task for ${action.assignee ? recipientWord(action.assignee, names) : "nobody yet"}${action.title ? `: ${action.title}` : ""}`;
    case "ASSIGN":
      return `Assign ${target(action.assignableType, action.assignableId)}`;
    case "UNASSIGN":
      return `Unassign ${target(action.assignableType, action.assignableId)}`;
    case "GRANT_TIME_OFF_POLICY":
      return `Grant ${target("TIME_OFF_POLICY", action.policyId)}`;
    default:
      return "Do something";
  }
};

const REASON_TEXTS: Record<string, string> = {
  FORWARD_ONLY: "Not run: the rule was enabled for people from then on, and this moment had passed",
  LATE_DATA: "The date arrived late",
  MOMENT_PASSED: "Not run: the moment had already passed",
  NO_LONGER_MATCHES: "Skipped: no longer matches the conditions",
  ANCHOR_CLEARED: "Cancelled: the date it counted from was cleared",
  RULE_DISABLED: "Cancelled: the rule was disabled",
  RULE_PAUSED: "Cancelled: the rule was paused",
  PERSON_LEFT: "Cancelled: the person left",
  CANCELLED_BY_HAND: "Cancelled by hand",
  TERMINATION_CANCELLED: "Cancelled: the termination was cancelled",
  NO_RECIPIENT: "Skipped: nobody to send it to",
  NO_ONBOARDING_MANAGER: "Skipped: no onboarding manager",
  NOT_ASSIGNED: "Skipped: nothing of this rule's to take back",
  HAND_OVERRIDE: "Skipped: set by hand to something else",
  RULE_CONFLICT: "Skipped: another rule sets this",
  DUPLICATE: "Skipped: already had it",
  OUTRANKED: "Skipped: a more specific place gives this person their holiday calendar",
  MISSING_PLACEHOLDER: "Failed: a placeholder has no value",
  STRUCTURAL: "Failed: something the rule uses is gone",
};

/**
 * A run's or a step's reason in words. The wire carries a code with an optional detail after a
 * colon (`LATE_DATA: planned for 2026-10-14`, `MISSING_PLACEHOLDER: managerName`); a failure carries
 * the engine's error text, which is shown as it is — it is the only account of what went wrong.
 */
export const reasonText = (reason: string | null | undefined): string => {
  if (!reason) return "";
  const [head, ...rest] = reason.split(":");
  const code = head.trim();
  const detail = rest.join(":").trim();
  const known = REASON_TEXTS[code];
  if (!known) return reason;
  if (code === "LATE_DATA" && detail) {
    const date = detail.replace(/^planned for\s*/i, "");
    return `Ran late: planned for ${formatDisplayDate(date, { style: "medium" }) || date}`;
  }
  if (code === "MISSING_PLACEHOLDER" && detail) {
    return `Failed: {${detail}} has no value`;
  }
  return detail ? `${known} — ${detail}` : known;
};

/**
 * A moment from the backend. Its `LocalDateTime` fields are UTC wall-clock with no zone suffix
 * (`hris-api/CLAUDE.md` § "Time and dates"), which `new Date` would read as local time.
 */
export const formatMoment = (value: string | null | undefined): string => {
  if (!value) return "";
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  const time = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
  return `${formatDisplayDate(date, { style: "medium" })}, ${time}`;
};
