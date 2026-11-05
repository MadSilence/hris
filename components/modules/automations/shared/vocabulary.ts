/**
 * The automation vocabulary in the reader's language — the list, the builder, the run log and the profile say the
 * same thing about the same state. The codes are the backend's; every word is a key of the `automations` catalogue.
 *
 * The sentence builders take the translator, so they stay plain functions the list can call per row.
 */
import type { useTranslations } from "next-intl";
import { formatDisplayDate } from "@/lib/date";
import type {
  ActionSpec,
  AssignableType,
  CatalogOption,
  RecipientSpec,
  TriggerSpec,
} from "@/models/automations";

export type AutomationsT = ReturnType<typeof useTranslations<"automations">>;

const isOneOf = <T extends string>(list: readonly T[], value: string | null | undefined): value is T =>
  value != null && (list as readonly string[]).includes(value);

/** A Title Case label inside a sentence: "Hire date" reads "the hire date". */
const lower = (label: string) => label.toLowerCase();

// ── the server's catalogue labels, translated by their code ─────────────────────────────────────

const DATE_FIELDS = ["HIRE_DATE", "PROBATION_END", "LAST_WORKING_DAY", "DATE_OF_BIRTH", "ATTRIBUTE"] as const;
const CHANGEABLE_FIELDS = ["hireDate", "probationEnd", "firstName", "lastName", "email", "manager", "job", "department",
  "office", "legalEntity", "team", "status"] as const;
const EVENT_FIELDS = ["leaveType", "policy", "days", "startsInDays", "processType", "template", "kind", "cycle"] as const;
const PLACEHOLDERS = ["firstName", "lastName", "fullName", "startDate", "lastWorkingDay", "managerName", "companyName",
  "jobTitle", "office", "department", "leaveType", "leaveStart", "leaveEnd", "leaveDays", "processName", "processType",
  "reviewKind", "cycleName"] as const;
const WEEKDAYS = ["1", "2", "3", "4", "5", "6", "7"] as const;

/** A built-in date of `catalog.dateFields`; a code the frontend does not know keeps the server's label. */
export const dateFieldLabel = (t: AutomationsT, option: CatalogOption): string =>
  isOneOf(DATE_FIELDS, option.value) ? t(`dateField.${option.value}`) : option.label;

/** A field of `catalog.changeableFields`; a company field (`attr:…`) is the company's own name. */
export const changeableFieldLabel = (t: AutomationsT, option: CatalogOption): string =>
  isOneOf(CHANGEABLE_FIELDS, option.value) ? t(`changeableField.${option.value}`) : option.label;

/** A field of an event's own facts (`catalog.events[].fields`). */
export const eventFieldLabel = (t: AutomationsT, field: { name: string; label: string }): string =>
  isOneOf(EVENT_FIELDS, field.name) ? t(`eventField.${field.name}`) : field.label;

/** A placeholder's words; an unknown one is shown by its name. */
export const placeholderLabel = (t: AutomationsT, name: string): string =>
  isOneOf(PLACEHOLDERS, name) ? t(`placeholder.${name}`) : name;

/** Monday is 1. */
export const weekdayLabel = (t: AutomationsT, weekday: number): string => {
  const key = String(weekday);
  return isOneOf(WEEKDAYS, key) ? t(`weekday.${key}`) : key;
};
export const WEEKDAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

// ── sentences ─────────────────────────────────────────────────────────────────────────────────

/** "on the day", "3 days after", "2 days before". */
export const offsetText = (t: AutomationsT, days: number | null | undefined): string => {
  const d = days ?? 0;
  if (d === 0) return t("sentence.offset.onTheDay");
  return t("sentence.offset.days", { days: Math.abs(d), direction: d > 0 ? "after" : "before" });
};

/** The "When …" half of a rule as prose. `dateFields`/`changeableFields` are the catalogue's options. */
export const triggerSentence = (
  t: AutomationsT,
  trigger: TriggerSpec | null | undefined,
  lookups: { dateFields?: CatalogOption[]; dateAttributes?: CatalogOption[]; changeableFields?: CatalogOption[] } = {},
): string => {
  if (!trigger) return t("sentence.trigger.none");
  switch (trigger.type) {
    case "PERSON_HIRED":
    case "TERMINATION_SCHEDULED":
    case "LAST_WORKING_DAY_ARRIVES":
    case "JOINS_SEGMENT":
      return t(`sentence.trigger.${trigger.type}`);
    case "FIELD_CHANGED": {
      const option = lookups.changeableFields?.find((o) => o.value === trigger.field);
      const label = option ? changeableFieldLabel(t, option) : t("sentence.trigger.someField");
      return t("sentence.trigger.fieldChanged", {
        field: lower(label),
        hasFrom: trigger.from ? "yes" : "no",
        from: trigger.from ?? "",
        hasTo: trigger.to ? "yes" : "no",
        to: trigger.to ?? "",
        recorded: trigger.when === "RECORDED" ? "yes" : "no",
      });
    }
    case "EVENT": {
      const what = trigger.event ? lower(t(`event.label.${trigger.event}`)) : t("sentence.trigger.somethingHappens");
      const days = trigger.days ?? 0;
      if (!trigger.anchor || trigger.anchor === "EVENT") return t("sentence.trigger.event", { what });
      if (trigger.direction === "ON" || days === 0) {
        return t("sentence.trigger.eventOn", { what, anchor: trigger.anchor });
      }
      return t("sentence.trigger.eventOffset", {
        what, days, anchor: trigger.anchor, direction: trigger.direction === "AFTER" ? "AFTER" : "BEFORE",
      });
    }
    case "SCHEDULE": {
      switch (trigger.frequency) {
        case "DAILY":
          return t("sentence.schedule.daily");
        case "WEEKLY": {
          const key = String(trigger.weekday ?? 1);
          return isOneOf(WEEKDAYS, key) ? t(`sentence.schedule.weekly.${key}`) : t("sentence.schedule.everyWeek");
        }
        case "MONTHLY":
          return trigger.dayOfMonth === 0 ? t("sentence.schedule.monthlyLast")
            : t("sentence.schedule.monthly", { day: trigger.dayOfMonth ?? 1 });
        case "QUARTERLY":
          return trigger.dayOfMonth === 0 ? t("sentence.schedule.quarterlyLast")
            : t("sentence.schedule.quarterly", { day: trigger.dayOfMonth ?? 1 });
        default:
          return t("sentence.schedule.other");
      }
    }
    case "DATE_OFFSET": {
      let fieldLabel: string;
      if (trigger.field === "ATTRIBUTE") {
        fieldLabel = lookups.dateAttributes?.find((o) => o.value === trigger.attributeId)?.label
          ?? t("sentence.dateOffset.someDateField");
      } else {
        const option = lookups.dateFields?.find((o) => o.value === trigger.field);
        fieldLabel = option ? dateFieldLabel(t, option)
          : isOneOf(DATE_FIELDS, trigger.field) ? t(`dateField.${trigger.field}`) : t("sentence.dateOffset.someDate");
      }
      const days = trigger.days ?? 0;
      const when = trigger.direction === "ON" || days === 0
        ? t("sentence.dateOffset.on", { field: lower(fieldLabel) })
        : t("sentence.dateOffset.offset", {
          days, field: lower(fieldLabel), direction: trigger.direction === "AFTER" ? "AFTER" : "BEFORE",
        });
      return trigger.everyYear ? t("sentence.dateOffset.everyYear", { when }) : when;
    }
    default:
      return t("sentence.trigger.other");
  }
};

type Names = { targets?: Map<string, string>; roles?: Map<string, string>; people?: Map<string, string> };

const recipientWord = (t: AutomationsT, r: RecipientSpec, names: Names): string => {
  switch (r.kind) {
    case "ROLE": {
      const role = r.roleId ? names.roles?.get(r.roleId) : undefined;
      return role ? t("recipient.word.roleNamed", { role }) : t("recipient.word.ROLE");
    }
    case "USER":
      return (r.userId && names.people?.get(r.userId)) || t("recipient.word.USER");
    case "PERSON":
    case "MANAGER":
    case "ONBOARDING_MANAGER":
    case "DEPARTMENT_HEAD":
    case "MANAGERS_MANAGER":
    case "APPROVER":
    case "REVIEWER":
      return t(`recipient.word.${r.kind}`);
    default:
      return t("recipient.word.somebody");
  }
};

export const recipientsText = (t: AutomationsT, recipients: RecipientSpec[] | null | undefined, names: Names = {}): string => {
  const list = (recipients ?? []).map((r) => recipientWord(t, r, names));
  if (list.length === 0) return t("recipient.nobodyYet");
  if (list.length === 1) return list[0];
  return t("recipient.list", { head: list.slice(0, -1).join(", "), last: list[list.length - 1] });
};

/** One action as prose: "Email the person: Welcome, {firstName}", "Assign office Berlin". */
export const actionSentence = (t: AutomationsT, action: ActionSpec, names: Names = {}): string => {
  const target = (type: AssignableType | null | undefined, id: string | null | undefined) => {
    const kind = type ? lower(t(`assignable.${type}`)) : t("sentence.action.something");
    const name = id ? names.targets?.get(id) : undefined;
    return name ? t("sentence.action.targetNamed", { kind, name }) : kind;
  };
  switch (action.type) {
    case "SEND_EMAIL":
      return t("sentence.action.email", {
        recipients: recipientsText(t, action.recipients, names),
        hasSubject: action.subject ? "yes" : "no",
        subject: action.subject ?? "",
      });
    case "NOTIFY":
      return t("sentence.action.notify", {
        recipients: recipientsText(t, action.recipients, names),
        hasText: action.text ? "yes" : "no",
        text: action.text ?? "",
      });
    case "CREATE_TASK":
      return t("sentence.action.task", {
        assignee: action.assignee ? recipientWord(t, action.assignee, names) : t("recipient.nobodyYet"),
        hasTitle: action.title ? "yes" : "no",
        title: action.title ?? "",
      });
    case "ASSIGN":
      return t("sentence.action.assign", { target: target(action.assignableType, action.assignableId) });
    case "UNASSIGN":
      return t("sentence.action.unassign", { target: target(action.assignableType, action.assignableId) });
    case "GRANT_TIME_OFF_POLICY":
      return t("sentence.action.grant", { target: target("TIME_OFF_POLICY", action.policyId) });
    case "START_REVIEW": {
      const template = action.templateCycleId ? names.targets?.get(action.templateCycleId) : undefined;
      return t("sentence.action.startReview", { template: template ?? t("sentence.action.someReviewTemplate") });
    }
    case "WAIT_UNTIL": {
      const days = action.maxDays ?? 0;
      if (action.until === "TASK_DONE") return t("sentence.action.waitTaskDone", { step: (action.taskStep ?? 0) + 1, days });
      if (action.until === "FIELD_FILLED") return t("sentence.action.waitFieldFilled", { days });
      return t("sentence.action.waitOther", { days });
    }
    case "REQUEST_APPROVAL":
      return t("sentence.action.approval", {
        who: action.assignee ? recipientWord(t, action.assignee, names) : t("recipient.word.somebody"),
        hasTitle: action.title ? "yes" : "no",
        title: action.title ?? "",
      });
    default:
      return t("sentence.action.other");
  }
};

const REASONS = ["FORWARD_ONLY", "LATE_DATA", "MOMENT_PASSED", "NO_LONGER_MATCHES", "ANCHOR_CLEARED", "RULE_DISABLED",
  "RULE_PAUSED", "PERSON_LEFT", "CANCELLED_BY_HAND", "TERMINATION_CANCELLED", "NO_RECIPIENT", "NO_ONBOARDING_MANAGER",
  "NOT_ASSIGNED", "HAND_OVERRIDE", "RULE_CONFLICT", "DUPLICATE", "OUTRANKED", "MISSING_PLACEHOLDER", "STRUCTURAL",
  "CONDITION_NOT_MET", "OBJECT_CLOSED", "MISSED", "TIMED_OUT", "DECLINED", "NO_APPROVER", "AUTHOR_LEFT",
  "AUTHOR_LACKS_RIGHT"] as const;

/**
 * A run's or a step's reason in words. The wire carries a code with an optional detail after a
 * colon (`LATE_DATA: planned for 2026-10-14`, `MISSING_PLACEHOLDER: managerName`); a failure carries
 * the engine's error text, which is shown as it is — it is the only account of what went wrong.
 */
export const reasonText = (t: AutomationsT, reason: string | null | undefined, language?: string): string => {
  if (!reason) return "";
  const [head, ...rest] = reason.split(":");
  const code = head.trim();
  const detail = rest.join(":").trim();
  if (!isOneOf(REASONS, code)) return reason;
  if (code === "LATE_DATA" && detail) {
    const date = detail.replace(/^planned for\s*/i, "");
    return t("reasonDetail.lateData", { date: formatDisplayDate(date, { style: "medium", language }) || date });
  }
  if (code === "MISSING_PLACEHOLDER" && detail) {
    return t("reasonDetail.missingPlaceholder", { token: `{${detail}}` });
  }
  const known = t(`reason.${code}`);
  return detail ? t("reasonDetail.withDetail", { reason: known, detail }) : known;
};
