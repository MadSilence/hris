/**
 * The simulation's sentences (D2) worded from the codes the backend sends beside its English
 * (`AutomationSimulationNotice`, `AutomationViews#summaryCode`; I18N.md rule 1). A code this frontend does
 * not know — or a backend that sends none — gives null, and the screen shows the server's English.
 */
import type { CodedMessage } from "@/models/misc";
import type {
  ActionSpec,
  AssignableType,
  AutomationActionType,
  OnTimeout,
  RecipientKind,
  RecipientSpec,
  SimulatedStep,
} from "@/models/automations";
import { actionSentence, type AutomationsT } from "./vocabulary";

const isOneOf = <T extends string>(list: readonly T[], value: string | null | undefined): value is T =>
  value != null && (list as readonly string[]).includes(value);

const RECIPIENT_KINDS = ["PERSON", "MANAGER", "ONBOARDING_MANAGER", "ROLE", "USER", "DEPARTMENT_HEAD",
  "MANAGERS_MANAGER", "APPROVER", "REVIEWER"] as const satisfies readonly RecipientKind[];
const ASSIGNABLE_TYPES = ["ROLE", "TIME_OFF_POLICY", "TEAM", "DEPARTMENT", "LEGAL_ENTITY", "OFFICE", "JOB",
  "PUBLIC_HOLIDAY_CALENDAR"] as const satisfies readonly AssignableType[];
const ACTION_TYPES = ["NOTIFY", "SEND_EMAIL", "CREATE_TASK", "REQUEST_APPROVAL", "ASSIGN", "GRANT_TIME_OFF_POLICY",
  "UNASSIGN", "WAIT_UNTIL", "START_REVIEW"] as const satisfies readonly AutomationActionType[];
const ON_TIMEOUT = ["CONTINUE", "STOP", "STOP_AND_TELL"] as const satisfies readonly OnTimeout[];

/** A number param, or null when it is absent or not a number. */
const num = (v: string | undefined): number | null => {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

/** One of the simulation's notes about the whole run; null for a code this frontend does not know. */
export const simulationNoteText = (t: AutomationsT, m: CodedMessage | null | undefined): string | null => {
  switch (m?.code) {
    case "DOES_NOT_MATCH": return t("tryIt.note.doesNotMatch");
    case "NO_ANCHOR_DATE": return t("tryIt.note.noAnchorDate");
    case "MOMENT_PASSED": return t("tryIt.note.momentPassed");
    case "SCHEDULE_INCOMPLETE": return t("tryIt.note.scheduleIncomplete");
    case "EVENT_COUNTED_TODAY": return t("tryIt.note.eventCountedToday");
    case "EVENT_COUNTED_TODAY_LEAVE_DATES": return t("tryIt.note.eventCountedTodayLeaveDates");
    default: return null;
  }
};

/** The notes, each worded from its code, or the server's English where the codes do not pair one to one. */
export const simulationNotes = (
  t: AutomationsT,
  notes: readonly string[] | null | undefined,
  codes: readonly CodedMessage[] | null | undefined,
): string[] => {
  const lines = notes ?? [];
  const paired = codes != null && codes.length === lines.length;
  return lines.map((line, i) => (paired ? simulationNoteText(t, codes[i]) : null) ?? line);
};

/** A step's note — skipped, held by a wait — from its code; null for none or an unknown code. */
export const stepNoteText = (t: AutomationsT, m: CodedMessage | null | undefined): string | null => {
  if (!m) return null;
  const maxDays = num(m.params?.maxDays);
  switch (m.code) {
    case "STEP_SKIPPED": return t("tryIt.note.stepSkipped");
    case "STEP_AFTER_WAIT": return t("tryIt.note.stepAfterWait");
    case "STEP_WAITS_FOR_APPROVAL":
      return maxDays == null ? null : t("tryIt.note.stepWaitsForApproval", { maxDays });
    case "STEP_WAITS": {
      const onTimeout = m.params?.onTimeout;
      return maxDays == null || !isOneOf(ON_TIMEOUT, onTimeout) ? null
        : t("tryIt.note.stepWaits", { maxDays, onTimeout });
    }
    default: return null;
  }
};

/** A `recipients` param — RecipientKind names, comma-separated, "" for nobody — as specs the vocabulary words. */
const recipientSpecs = (value: string | undefined): RecipientSpec[] | null => {
  const kinds = (value ?? "").split(",").map((k) => k.trim()).filter(Boolean);
  if (!kinds.every((k) => isOneOf(RECIPIENT_KINDS, k))) return null;
  return kinds.map((kind) => ({ kind: kind as RecipientKind }));
};

/** The id the company's own name is filed under for the vocabulary's lookup: the summary carries the name itself. */
const NAMED = "named";

/**
 * A step's action as one line, from its code: the code is the action type and the params are its parts, worded by
 * the builder's own `actionSentence`. Texts the company typed (a subject, a title, a name) go in as they are.
 */
export const stepSummaryText = (t: AutomationsT, m: CodedMessage | null | undefined): string | null => {
  if (!m || !isOneOf(ACTION_TYPES, m.code)) return null;
  const p = m.params ?? {};
  const named = (name: string | undefined) => (name ? { targets: new Map([[NAMED, name]]) } : {});
  let action: ActionSpec;
  switch (m.code) {
    case "NOTIFY":
    case "SEND_EMAIL": {
      const recipients = recipientSpecs(p.recipients);
      if (!recipients) return null;
      action = { type: m.code, recipients, text: p.text || null, subject: p.subject || null };
      break;
    }
    case "CREATE_TASK":
    case "REQUEST_APPROVAL": {
      const recipients = recipientSpecs(p.recipients);
      if (!recipients) return null;
      action = { type: m.code, assignee: recipients[0] ?? null, title: p.title || null };
      break;
    }
    case "ASSIGN":
    case "UNASSIGN":
    case "GRANT_TIME_OFF_POLICY": {
      if (p.target && !isOneOf(ASSIGNABLE_TYPES, p.target)) return null;
      const type = (p.target || null) as AssignableType | null;
      const id = p.targetName ? NAMED : null;
      action = m.code === "GRANT_TIME_OFF_POLICY"
        ? { type: m.code, policyId: id }
        : { type: m.code, assignableType: type, assignableId: id };
      return actionSentence(t, action, named(p.targetName));
    }
    case "WAIT_UNTIL": {
      const maxDays = num(p.maxDays);
      const step = num(p.taskStep);
      if (maxDays == null || !isOneOf(["TASK_DONE", "FIELD_FILLED"] as const, p.until)) return null;
      if (p.until === "TASK_DONE" && step == null) return null;
      // The wire's task step is 1-based; the spec's is a 0-based position.
      action = { type: m.code, until: p.until, taskStep: step == null ? null : step - 1, maxDays };
      break;
    }
    case "START_REVIEW":
      action = { type: m.code, templateCycleId: p.templateName ? NAMED : null };
      return actionSentence(t, action, named(p.templateName));
  }
  return actionSentence(t, action);
};

/** What the panel shows for a step: its summary and note, worded from the codes, else the server's English. */
export const simulatedStepText = (t: AutomationsT, s: SimulatedStep): { summary: string; note: string | null } => ({
  summary: stepSummaryText(t, s.summaryCode) ?? s.summary,
  note: stepNoteText(t, s.noteCode) ?? s.note,
});
