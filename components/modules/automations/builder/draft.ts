import { emptySegment } from "@/models/segment/Segment";
import type {
  ActionSpec,
  AutomationActionType,
  AutomationDefinition,
  AutomationTriggerType,
  TriggerSpec,
} from "@/models/automations";
import type { AutomationsT } from "@/components/modules/automations/shared/vocabulary";

/** A placeholder token for a message argument: `{firstName}` stays `{firstName}` in every language. */
const token = (name: string) => `{${name}}`;

/**
 * The builder's draft lives in the page — there are no server drafts (AUTOMATIONS_DESIGN.md § 9.1).
 * A rule created and never enabled is the "draft" the server knows about.
 */
export type Draft = {
  name: string;
  description: string;
  definition: AutomationDefinition;
};

export const defaultTrigger = (type: AutomationTriggerType): TriggerSpec => {
  switch (type) {
    case "DATE_OFFSET":
      return { type, field: "HIRE_DATE", direction: "BEFORE", days: 3, everyYear: false };
    case "FIELD_CHANGED":
      return { type, field: null, from: null, to: null, when: "EFFECTIVE" };
    case "EVENT":
      return { type, event: "TIME_OFF_APPROVED", eventConditions: null, anchor: "EVENT", direction: "ON", days: 0 };
    case "SCHEDULE":
      return { type, frequency: "WEEKLY", weekday: 1, dayOfMonth: null };
    default:
      return { type };
  }
};

export const emptyDefinition = (): AutomationDefinition => ({
  trigger: defaultTrigger("PERSON_HIRED"),
  conditions: emptySegment(),
  actions: [],
  latePolicy: "RUN_LATE",
  lateWindowDays: null,
});

export const newAction = (type: AutomationActionType): ActionSpec => {
  switch (type) {
    case "SEND_EMAIL":
      return { type, offsetDays: 0, recipients: [{ kind: "PERSON" }], subject: "", body: "" };
    case "NOTIFY":
      return { type, offsetDays: 0, recipients: [{ kind: "PERSON" }], text: "" };
    case "CREATE_TASK":
      return { type, offsetDays: 0, assignee: { kind: "MANAGER" }, title: "", description: "", dueOffsetDays: null };
    case "GRANT_TIME_OFF_POLICY":
      return { type, offsetDays: 0, policyId: null };
    case "START_REVIEW":
      return { type, offsetDays: 0, templateCycleId: null, reviewWindows: [], releaseOffsetDays: null };
    case "WAIT_UNTIL":
      return { type, offsetDays: 0, until: "TASK_DONE", taskStep: null, field: null, maxDays: 14, onTimeout: "STOP_AND_TELL" };
    case "REQUEST_APPROVAL":
      return { type, offsetDays: 0, assignee: { kind: "MANAGER" }, title: "", maxDays: 7, onTimeout: "STOP_AND_TELL" };
    default:
      return { type, offsetDays: 0, assignableType: null, assignableId: null };
  }
};

export type StarterId = "welcome-email" | "manager-day-one" | "office-calendar" | "termination-hr";

/**
 * Four ready-made starting points from the research catalogue (§ A.10 "Templates"). Each opens the
 * builder filled in and saves nothing — what is missing (the office, the calendar, the HR role) is
 * left for the author, and the preview says so. The words are the reader's language; the placeholders stay tokens.
 */
export const STARTERS: { id: StarterId; draft: (t: AutomationsT) => Draft }[] = [
  {
    id: "welcome-email",
    draft: (t) => ({
      name: t("starter.welcomeEmail.name"),
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "DATE_OFFSET", field: "HIRE_DATE", direction: "BEFORE", days: 3, everyYear: false },
        // A dated email sent days late is worse than none (research § A.10, late data).
        latePolicy: "SKIP",
        actions: [{
          type: "SEND_EMAIL",
          offsetDays: 0,
          recipients: [{ kind: "PERSON" }],
          subject: t("starter.welcomeEmail.subject", { companyName: token("companyName"), firstName: token("firstName") }),
          body: t("starter.welcomeEmail.body", {
            firstName: token("firstName"), startDate: token("startDate"), managerName: token("managerName"),
          }),
        }],
      },
    }),
  },
  {
    id: "manager-day-one",
    draft: (t) => ({
      name: t("starter.managerDayOne.name"),
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "PERSON_HIRED" },
        actions: [{
          type: "CREATE_TASK",
          offsetDays: 0,
          assignee: { kind: "MANAGER" },
          title: t("starter.managerDayOne.taskTitle", { firstName: token("firstName") }),
          description: t("starter.managerDayOne.taskDescription", { firstName: token("firstName") }),
          dueOffsetDays: 0,
        }],
      },
    }),
  },
  {
    id: "office-calendar",
    draft: (t) => ({
      name: t("starter.officeCalendar.name"),
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "JOINS_SEGMENT" },
        actions: [{ type: "ASSIGN", offsetDays: 0, assignableType: "PUBLIC_HOLIDAY_CALENDAR", assignableId: null }],
      },
    }),
  },
  {
    id: "termination-hr",
    draft: (t) => ({
      name: t("starter.terminationHr.name"),
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "TERMINATION_SCHEDULED" },
        actions: [{
          type: "NOTIFY",
          offsetDays: 0,
          recipients: [{ kind: "ROLE", roleId: null }],
          text: t("starter.terminationHr.text", { fullName: token("fullName"), lastWorkingDay: token("lastWorkingDay") }),
        }],
      },
    }),
  },
];

export const starterDraft = (t: AutomationsT, id: string | null | undefined): Draft | null =>
  STARTERS.find((s) => s.id === id)?.draft(t) ?? null;

/** A shipped template (D3) as a draft: its definition, with an empty audience when it has none. */
export const templateDraft = (t: { name: string; description: string; definition: AutomationDefinition }): Draft => ({
  name: t.name,
  description: t.description,
  definition: {
    ...emptyDefinition(),
    ...t.definition,
    conditions: t.definition.conditions ?? emptySegment(),
  },
});

/** The placeholders an action may use under this trigger: the person's, and an event's own (A3). */
export const placeholdersFor = (
  catalog: { placeholders: string[]; events?: { value: string; placeholders: string[] }[] },
  trigger: TriggerSpec,
): string[] => {
  const extra = trigger.type === "EVENT" ? catalog.events?.find((e) => e.value === trigger.event)?.placeholders ?? [] : [];
  return [...catalog.placeholders, ...extra];
};

/**
 * The text after an "@" the caret sits in, or null: "Hello @fir|" → { start: 6, query: "fir" }. Typing "@" opens the
 * placeholder list (A3); the token stored is still `{name}`.
 */
export const mentionAt = (text: string, caret: number): { start: number; query: string } | null => {
  const before = text.slice(0, caret);
  const m = /(^|[^\w{])@(\w*)$/.exec(before);
  if (!m) return null;
  return { start: caret - m[2].length - 1, query: m[2] };
};

/** Order-sensitive on purpose: the action list's order is the author's and is part of the rule. */
export const sameDefinition = (a: AutomationDefinition | null | undefined, b: AutomationDefinition | null | undefined) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Inserts `{name}` at the caret of a text field and returns the new text and caret. The text is the
 * field's value; `start`/`end` are its selection — so a placeholder never lands at the end by accident.
 */
export const insertPlaceholder = (
  text: string,
  placeholder: string,
  start: number | null | undefined,
  end: number | null | undefined,
): { text: string; caret: number } => {
  const token = `{${placeholder}}`;
  const from = start ?? text.length;
  const to = end ?? from;
  return { text: text.slice(0, from) + token + text.slice(to), caret: from + token.length };
};
