import { emptySegment } from "@/models/segment/Segment";
import type {
  ActionSpec,
  AutomationActionType,
  AutomationDefinition,
  AutomationTriggerType,
  TriggerSpec,
} from "@/models/automations";

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
      return { type, field: null, from: null, to: null };
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
    default:
      return { type, offsetDays: 0, assignableType: null, assignableId: null };
  }
};

export type StarterId = "welcome-email" | "manager-day-one" | "office-calendar" | "termination-hr";

/**
 * Four ready-made starting points from the research catalogue (§ A.10 "Templates"). Each opens the
 * builder filled in and saves nothing — what is missing (the office, the calendar, the HR role) is
 * left for the author, and the preview says so.
 */
export const STARTERS: { id: StarterId; title: string; hint: string; draft: () => Draft }[] = [
  {
    id: "welcome-email",
    title: "Welcome Email Before the First Day",
    hint: "Emails the new person three days before they start.",
    draft: () => ({
      name: "Welcome email",
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
          subject: "Welcome to {companyName}, {firstName}",
          body: "Hi {firstName},\n\nWe are looking forward to seeing you on {startDate}.\n\n{managerName}",
        }],
      },
    }),
  },
  {
    id: "manager-day-one",
    title: "A Task for the Manager on Day One",
    hint: "Gives the manager a task on the new person's first day.",
    draft: () => ({
      name: "First day with the manager",
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "PERSON_HIRED" },
        actions: [{
          type: "CREATE_TASK",
          offsetDays: 0,
          assignee: { kind: "MANAGER" },
          title: "Welcome {firstName} on their first day",
          description: "Show {firstName} around and introduce them to the team.",
          dueOffsetDays: 0,
        }],
      },
    }),
  },
  {
    id: "office-calendar",
    title: "Holiday Calendar by Office",
    hint: "Everyone in an office gets its holiday calendar, and keeps following it.",
    draft: () => ({
      name: "Holiday calendar by office",
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
    title: "Tell HR About a Termination",
    hint: "Notifies a role the day a termination is recorded.",
    draft: () => ({
      name: "Termination recorded",
      description: "",
      definition: {
        ...emptyDefinition(),
        trigger: { type: "TERMINATION_SCHEDULED" },
        actions: [{
          type: "NOTIFY",
          offsetDays: 0,
          recipients: [{ kind: "ROLE", roleId: null }],
          text: "{fullName}'s termination was recorded. Their last working day is {lastWorkingDay}.",
        }],
      },
    }),
  },
];

export const starterDraft = (id: string | null | undefined): Draft | null =>
  STARTERS.find((s) => s.id === id)?.draft() ?? null;

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
