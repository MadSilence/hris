import type { useTranslations } from "next-intl";
import type {
  AutomationDefinition,
  CalendarRelation,
  EventCondition,
  RecipientSpec,
  StepSpec,
  Timing,
  TriggerSpec,
} from "@/models/automations";
import type { Segment } from "@/models/segment/Segment";
import type { FilterDTO } from "@/models/user/fields";
import type { SentencePart } from "../../contracts";
import { flatten } from "../../model/tree";
import { comparisons } from "../conditions/eventConditionModel";
import { tokensAsWords } from "../tokens/tokens";
import { fixedRunDate } from "../triggers/fixedRunDate";
import type { SettingsTranslator } from "../parts/problems";

export type AutomationsTranslator = ReturnType<typeof useTranslations<"automations">>;

/**
 * The names of the company's things, looked up by id — roles, policies, calendars, forms, templates, fields and the
 * values of conditions. Built by `useAutomationWords` from the catalogue and the reference hooks; a name not (yet)
 * known is null, and the words fall back to the kind of thing ("a role", "a policy").
 */
export type NameBook = {
  role: (id: string | null | undefined) => string | null;
  policy: (id: string | null | undefined) => string | null;
  calendar: (id: string | null | undefined) => string | null;
  form: (id: string | null | undefined) => string | null;
  processTemplate: (id: string | null | undefined) => string | null;
  dateAttribute: (id: string | null | undefined) => string | null;
  /** A changeable field's name — the shared catalogue's for the system's, the company's own for an `attr:`. */
  changeableField: (value: string | null | undefined) => string | null;
  /** A thing to assign: a role, a team, an office… by its kind and id. */
  assignable: (type: string | null | undefined, id: string | null | undefined) => string | null;
  /** A People-table field by its id (`sys:office`, `attr:…`). */
  fieldLabel: (field: string) => string | null;
  /** A condition's value in words: "Poland or Lithuania". */
  filterValue: (filter: FilterDTO) => string;
  /** A field a wait can wait for. */
  fillable: (field: string | null | undefined) => string;
  placeholder: (name: string) => string;
  eventField: (name: string) => string;
  eventValue: (value: string) => string;
};

export type WordsDeps = {
  t: SettingsTranslator;
  tA: AutomationsTranslator;
  names: NameBook;
  /** "1 Mar 2027" in the page's language. */
  date: (iso: string) => string;
  /** "A, B and C" in the page's language. */
  list: (items: string[]) => string;
  /** Weekday names, Monday = 1. */
  weekday: (day: number) => string;
  /** "1 March" — a day of a month, no year. */
  dayOfMonth: (month: number, day: number) => string;
};

const PERSON_DATES = ["HIRE_DATE", "PROBATION_END", "LAST_WORKING_DAY", "DATE_OF_BIRTH"] as const;
type PersonDate = (typeof PERSON_DATES)[number];
const isPersonDate = (v: string | null | undefined): v is PersonDate => (PERSON_DATES as readonly string[]).includes(v ?? "");

const RELATIVE = ["PERSON", "MANAGER", "MANAGERS_MANAGER", "DEPARTMENT_HEAD", "ONBOARDING_MANAGER", "APPROVER"] as const;
type Relative = (typeof RELATIVE)[number];

const lowerFirst = (s: string) => (s ? s[0].toLocaleLowerCase() + s.slice(1) : s);
const upperFirst = (s: string) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);

/** The words of an automation — pure over its translators and name book, so they are tested without React. */
export const automationWords = (d: WordsDeps) => {
  const { t, tA, names } = d;

  // ── small pieces ─────────────────────────────────────────────────────────────────────────────

  /** One recipient inside a sentence: "their manager", "HR Admin", "a person". */
  const recipient = (r: RecipientSpec): string => {
    if (r.kind === "ROLE") return names.role(r.roleId) ?? t("words.aRole");
    if (r.kind === "USER") return t("words.aPerson");
    return (RELATIVE as readonly string[]).includes(r.kind) ? t(`words.recipient.${r.kind as Relative}`) : t("words.aPerson");
  };
  const recipients = (rs: RecipientSpec[] | null | undefined): string | null => {
    const list = rs ?? [];
    if (list.length === 0) return null;
    const people = list.filter((r) => r.kind === "USER").length;
    const named = list.filter((r) => r.kind !== "USER").map(recipient);
    if (people > 1) named.push(t("words.people", { count: people }));
    else if (people === 1) named.push(t("words.aPerson"));
    return d.list(named);
  };

  /** "the hire date", "the end of probation", "Visa expires". */
  const dateNoun = (field: string | null | undefined, attributeId?: string | null): string => {
    if (isPersonDate(field)) return t(`words.dateNoun.${field}`);
    if (field === "ATTRIBUTE") return names.dateAttribute(attributeId) ?? t("words.aDate");
    if (field?.startsWith("ATTRIBUTE:")) return names.dateAttribute(field.slice("ATTRIBUTE:".length)) ?? t("words.aDate");
    return t("words.aDate");
  };

  /** "80 days after the hire date", "7 days after the step before". */
  const timing = (when: Timing | null | undefined): string | null => {
    if (!when || when.mode !== "LATER") return null;
    const from = !when.countedFrom || when.countedFrom === "PREVIOUS_STEP" ? t("words.previousStep") : dateNoun(when.countedFrom);
    return t("words.timing", { days: when.days ?? 0, dir: when.direction === "BEFORE" ? "BEFORE" : "AFTER", from });
  };

  /** "Department is Engineering" */
  const filterText = (f: FilterDTO): string =>
    t("conditions.line", { field: names.fieldLabel(f.field) ?? f.field, op: t(`operator.${f.op}`), value: names.filterValue(f) });
  const conditionsText = (s: Segment | null | undefined): string | null => {
    const filters = s?.filters ?? [];
    if (filters.length === 0) return null;
    return filters.map(filterText).join(` ${t("conditions.andLower")} `);
  };

  /** "Days more than 10" */
  const eventConditionsText = (c: EventCondition | null | undefined): string | null => {
    const leaves = comparisons(c);
    if (leaves.length === 0) return null;
    const joiner = c?.kind === "ANY" ? ` ${t("conditions.orLower")} ` : ` ${t("conditions.andLower")} `;
    return leaves
      .map((l) =>
        t("conditions.line", {
          field: names.eventField(l.field),
          op: l.op ? t(`eventOperator.${l.op}`) : "",
          value: l.value.split(",").map((v) => names.eventValue(v.trim())).join(", "),
        }),
      )
      .join(joiner);
  };

  const anyField = (field: string | null | undefined) => {
    const label = names.changeableField(field) ?? t("words.aField");
    return field?.startsWith("attr:") ? label : label.toLocaleLowerCase();
  };
  const changeValue = (field: string | null | undefined, value: string | null | undefined): string => {
    if (!value) return t("words.anyValue", { field: anyField(field) });
    const type = ({ office: "OFFICE", department: "DEPARTMENT", team: "TEAM", legalEntity: "LEGAL_ENTITY", job: "JOB" } as Record<string, string>)[field ?? ""];
    if (type) return names.assignable(type, value) ?? value;
    if (field === "hireDate" || field === "probationEnd") return d.date(value);
    if (field === "manager") return t("words.aPerson");
    return value;
  };

  const processName = (trigger: TriggerSpec): "ANY_ONBOARDING" | "ANY_OFFBOARDING" | "TEMPLATE" =>
    trigger.process === "ANY_OFFBOARDING" ? "ANY_OFFBOARDING" : trigger.process && trigger.process !== "ANY_ONBOARDING" ? "TEMPLATE" : "ANY_ONBOARDING";

  const at = (trigger: TriggerSpec) => trigger.at || "09:00";

  const scheduleTitle = (trigger: TriggerSpec): string => {
    switch (trigger.frequency) {
      case "DAILY":
        return t("words.schedule.daily", { at: at(trigger) });
      case "WEEKLY":
        return t("words.schedule.weekly", { days: d.list((trigger.weekdays ?? []).map(d.weekday)), at: at(trigger) });
      case "QUARTERLY":
        return trigger.dayOfMonth === 0
          ? t("words.schedule.quarterlyLast", { month: String(trigger.monthOfPeriod ?? 1), at: at(trigger) })
          : t("words.schedule.quarterly", { day: trigger.dayOfMonth ?? 1, month: String(trigger.monthOfPeriod ?? 1), at: at(trigger) });
      case "YEARLY":
        return t("words.schedule.yearly", { date: d.dayOfMonth(trigger.monthOfPeriod ?? 1, trigger.dayOfMonth || 1), at: at(trigger) });
      default:
        if (trigger.weekOfMonth != null) {
          return t("words.schedule.monthlyWeekday", {
            week: String(trigger.weekOfMonth),
            weekday: d.weekday(trigger.weekdays?.[0] ?? 1),
            at: at(trigger),
          });
        }
        return trigger.dayOfMonth === 0
          ? t("words.schedule.monthlyLast", { at: at(trigger) })
          : t("words.schedule.monthly", { day: trigger.dayOfMonth ?? 1, at: at(trigger) });
    }
  };

  // ── the trigger ─────────────────────────────────────────────────────────────────────────────

  /** The When card's title: "14 days before the end of probation", "Office changes", "Every day, 09:00". */
  const triggerTitle = (trigger: TriggerSpec | null | undefined, conditions?: Segment | null): string => {
    if (!trigger) return t("words.noTrigger");
    switch (trigger.type) {
      case "DATE_OFFSET": {
        if (trigger.field === "FIXED") return trigger.date ? t("words.onDate", { date: d.date(fixedRunDate(trigger)!) }) : tA("trigger.FIXED_DATE");
        const date = dateNoun(trigger.field, trigger.attributeId);
        if (trigger.direction === "ON") return upperFirst(t("words.onTheDate", { date }));
        return upperFirst(t("words.relative", { days: trigger.days ?? 0, dir: trigger.direction === "AFTER" ? "AFTER" : "BEFORE", date }));
      }
      case "FIELD_CHANGED":
        return t("words.fieldChanges", { field: names.changeableField(trigger.field) ?? t("words.aField") });
      case "SCHEDULE":
        return scheduleTitle(trigger);
      case "JOINS_SEGMENT": {
        const only = conditions?.filters?.length === 1 ? conditions.filters[0] : null;
        return only ? t("words.joins", { group: names.filterValue(only) }) : tA("trigger.JOINS_SEGMENT");
      }
      case "EVENT":
        if (trigger.event === "PROCESS_COMPLETED") {
          const kind = processName(trigger);
          return kind === "TEMPLATE"
            ? t("words.process.TEMPLATE", { name: names.processTemplate(trigger.process) ?? t("words.aProcess") })
            : t(`words.process.${kind}`);
        }
        return trigger.event ? tA(`trigger.${trigger.event}`) : tA("trigger.TIME_OFF_REQUESTED");
      default:
        return tA(`trigger.${trigger.type}`);
    }
  };

  /** The When card's second line: "Every person, once", "From any office to any office". */
  const triggerSubtitle = (trigger: TriggerSpec | null | undefined): string | null => {
    if (!trigger) return null;
    switch (trigger.type) {
      case "DATE_OFFSET":
        if (trigger.field === "FIXED") return t("words.sub.once");
        return trigger.everyYear ? t("words.sub.everyYear") : t("words.sub.everyPersonOnce");
      case "FIELD_CHANGED":
        return t("words.sub.fromTo", {
          from: changeValue(trigger.field, trigger.from),
          to: changeValue(trigger.field, trigger.to),
        });
      case "SCHEDULE":
        return t("words.sub.schedule");
      case "JOINS_SEGMENT":
        return t("words.sub.joins");
      case "EVENT": {
        const cond = eventConditionsText(trigger.eventConditions);
        if (trigger.event === "PROCESS_COMPLETED") {
          const kind = processName(trigger);
          return cond ?? (kind === "TEMPLATE" ? null : t(`words.sub.${kind}`));
        }
        return cond ?? t("words.sub.anyTimeOff");
      }
      default:
        return t(`words.sub.${trigger.type}`);
    }
  };

  /** The list's "Starts when". */
  const triggerLine = (trigger: TriggerSpec | null | undefined): string => triggerTitle(trigger);

  /** The trigger inside the sentence, after "When": "the end of probation is 14 days away". */
  const triggerPhrase = (trigger: TriggerSpec, conditions: Segment | null): string => {
    switch (trigger.type) {
      case "DATE_OFFSET": {
        if (trigger.field === "FIXED") return t("words.sentence.fixed", { date: trigger.date ? d.date(fixedRunDate(trigger)!) : t("words.aDate") });
        const date = dateNoun(trigger.field, trigger.attributeId);
        if (trigger.direction === "ON") return t("words.sentence.dateOn", { date });
        return trigger.direction === "AFTER"
          ? t("words.sentence.dateAfter", { date, days: trigger.days ?? 0 })
          : t("words.sentence.dateBefore", { date, days: trigger.days ?? 0 });
      }
      case "FIELD_CHANGED":
        return t("words.sentence.fieldChanges", { field: anyField(trigger.field) });
      case "SCHEDULE":
        return lowerFirst(scheduleTitle(trigger));
      case "JOINS_SEGMENT": {
        const only = conditions?.filters?.length === 1 ? conditions.filters[0] : null;
        return only ? t("words.sentence.joins", { group: names.filterValue(only) }) : t("words.sentence.joinsAny");
      }
      case "EVENT":
        if (trigger.event === "PROCESS_COMPLETED") {
          const kind = processName(trigger);
          return kind === "TEMPLATE"
            ? t("words.sentence.process.TEMPLATE", { name: names.processTemplate(trigger.process) ?? t("words.aProcess") })
            : t(`words.sentence.process.${kind}`);
        }
        return t(`words.sentence.timeOff.${trigger.event ?? "TIME_OFF_REQUESTED"}`);
      default:
        return t(`words.sentence.${trigger.type}`);
    }
  };

  // ── steps ───────────────────────────────────────────────────────────────────────────────────

  const stepKind = (step: StepSpec): string => tA(`stepType.${step.type}`);

  const which = (step: StepSpec): string | null => {
    if (step.relation) return lowerFirst(tA(`relation.${step.relation as CalendarRelation}`));
    if (!step.assignableId) return null;
    if (step.assignableType === "PUBLIC_HOLIDAY_CALENDAR") return names.calendar(step.assignableId);
    return names.assignable(step.assignableType, step.assignableId);
  };

  const words = (text: string | null | undefined) => tokensAsWords(text, names.placeholder).trim();

  /** The card's title: "Their manager approves", "Book the probation review", "Tell HR Admin". */
  const stepTitle = (step: StepSpec): string => {
    switch (step.type) {
      case "NOTIFY": {
        const who = recipients(step.recipients);
        return who ? t("words.step.tell", { who }) : stepKind(step);
      }
      case "SEND_EMAIL": {
        const subject = words(step.subject);
        const who = recipients(step.recipients);
        return subject || (who ? t("words.step.to", { who }) : stepKind(step));
      }
      case "CREATE_TASK":
        return words(step.title) || stepKind(step);
      case "REQUEST_APPROVAL":
        return step.assignee ? upperFirst(t("words.step.approves", { who: recipient(step.assignee) })) : stepKind(step);
      case "WAIT_UNTIL":
        return step.until === "FIELD_FILLED"
          ? step.field
            ? t("words.step.filled", { field: names.fillable(step.field) })
            : stepKind(step)
          : t("words.step.taskDone");
      case "ASSIGN":
      case "UNASSIGN": {
        const thing = which(step);
        if (!thing) return step.type === "UNASSIGN" ? t("words.step.unassign") : t("words.step.assign");
        return upperFirst(step.type === "UNASSIGN" ? t("words.step.takeBack", { thing }) : thing);
      }
      case "GRANT_TIME_OFF_POLICY":
        return names.policy(step.policyId) ?? stepKind(step);
      case "START_REVIEW":
        return names.form(step.formId) ?? stepKind(step);
      case "SIGN_DOCUMENT":
        return step.documents?.length ? d.list(step.documents) : stepKind(step);
      case "SEND_SURVEY":
        return step.survey?.trim() || stepKind(step);
      case "SPLIT":
        return step.question?.trim() || stepKind(step);
      default:
        return stepKind(step);
    }
  };

  /** The card's second line: "No answer in 3 days: ask their manager", "For their manager · due in 7 days". */
  const stepSubtitle = (step: StepSpec): string | null => {
    const parts: string[] = [];
    switch (step.type) {
      case "NOTIFY":
        break;
      case "SEND_EMAIL": {
        const who = recipients(step.recipients);
        if (who && words(step.subject)) parts.push(t("words.step.to", { who }));
        break;
      }
      case "CREATE_TASK":
        if (step.assignee) parts.push(t("words.step.for", { who: recipient(step.assignee) }));
        if (step.dueDays != null) parts.push(t("words.step.dueIn", { days: step.dueDays }));
        break;
      case "REQUEST_APPROVAL":
        if (step.maxDays != null) {
          parts.push(t("words.step.noAnswer", { days: step.maxDays, then: t(`words.noAnswer.${step.ifNoAnswer ?? "ASK_THEIR_MANAGER"}`) }));
        }
        break;
      case "WAIT_UNTIL": {
        const then =
          step.onTimeout === "STOP_AND_TELL"
            ? t("words.timeout.STOP_AND_TELL", { who: recipients(step.tell) ?? t("words.recipient.OWNER") })
            : t(`words.timeout.${step.onTimeout === "STOP" ? "STOP" : "CONTINUE"}`);
        if (step.maxDays != null) parts.push(upperFirst(t("words.step.atMost", { days: step.maxDays, then })));
        break;
      }
      case "ASSIGN":
      case "UNASSIGN":
        if (step.assignableType) parts.push(tA(`assignable.${step.assignableType}`));
        break;
      case "START_REVIEW":
        if (step.assignee) parts.push(t("words.step.by", { who: recipient(step.assignee) }));
        if (step.dueDays != null) parts.push(t("words.step.dueIn", { days: step.dueDays }));
        break;
      case "SIGN_DOCUMENT":
        if (step.assignee) parts.push(t("words.step.signedBy", { who: recipient(step.assignee) }));
        break;
      case "SEND_SURVEY": {
        const who = recipients(step.recipients);
        if (who) parts.push(t("words.step.to", { who }));
        break;
      }
      case "SPLIT":
        parts.push(t("words.step.paths", { count: (step.paths?.length ?? 0) + 1 }));
        break;
      default:
        break;
    }
    const when = timing(step.when);
    if (when) parts.push(when);
    const only = conditionsText(step.condition);
    if (only) parts.push(t("words.step.onlyIf", { conditions: only }));
    if (parts.length === 0) return null;
    return upperFirst(parts.join(" · "));
  };

  /** The step inside the sentence: "tells HR Admin", "asks their manager to approve". */
  const stepPhrase = (step: StepSpec): string => {
    switch (step.type) {
      case "NOTIFY":
        return t("words.phrase.notify", { who: recipients(step.recipients) ?? t("words.someone") });
      case "SEND_EMAIL":
        return t("words.phrase.email", { who: recipients(step.recipients) ?? t("words.someone") });
      case "CREATE_TASK":
        return step.assignee ? t("words.phrase.task", { who: recipient(step.assignee) }) : t("words.phrase.taskNobody");
      case "REQUEST_APPROVAL":
        return t("words.phrase.approval", { who: step.assignee ? recipient(step.assignee) : t("words.someone") });
      case "WAIT_UNTIL":
        return step.until === "FIELD_FILLED"
          ? t("words.phrase.waitField", { field: names.fillable(step.field) || t("words.aField") })
          : t("words.phrase.waitTask");
      case "ASSIGN":
        return t("words.phrase.assign", { thing: which(step) ?? t("words.something") });
      case "UNASSIGN":
        return t("words.phrase.unassign", { thing: which(step) ?? t("words.something") });
      case "GRANT_TIME_OFF_POLICY":
        return t("words.phrase.policy", { policy: names.policy(step.policyId) ?? t("words.aPolicy") });
      case "START_REVIEW":
        return t("words.phrase.review");
      case "SIGN_DOCUMENT":
        return t("words.phrase.sign");
      case "SEND_SURVEY":
        return t("words.phrase.survey");
      case "SPLIT":
        return t("words.phrase.split");
      default:
        return lowerFirst(stepKind(step));
    }
  };

  /**
   * "In short": "When [the end of probation is 14 days away], noddo [gives their manager a task], then [waits until
   * the task is done]." — each step's words a chip marked with its id; grey placeholder chips before a trigger or a
   * step exists. A schedule starts with its own words ("Every day at 09:00, noddo …").
   */
  const sentence = (definition: AutomationDefinition): SentencePart[] => {
    const out: SentencePart[] = [];
    const text = (s: string) => out.push({ text: s, stepId: null, chip: false, placeholder: false });
    const trigger = definition.trigger;
    const who = conditionsText(definition.conditions);
    if (!trigger) {
      text(t("words.sentence.when"));
      out.push({ text: t("words.sentence.somethingHappens"), stepId: null, chip: true, placeholder: true });
    } else if (trigger.type === "SCHEDULE") {
      out.push({ text: scheduleTitle(trigger), stepId: null, chip: true, placeholder: false });
    } else {
      text(t("words.sentence.when"));
      out.push({ text: triggerPhrase(trigger, definition.conditions), stepId: null, chip: true, placeholder: false });
    }
    if (who && trigger?.type !== "JOINS_SEGMENT") {
      text(t("words.sentence.for"));
      out.push({ text: who, stepId: null, chip: true, placeholder: false });
    }
    text(t("words.sentence.noddo"));
    const steps = flatten(definition).map((n) => n.step).filter((s) => !s.skipped);
    if (steps.length === 0) {
      out.push({ text: t("words.sentence.doesTheSteps"), stepId: null, chip: true, placeholder: true });
    } else {
      steps.forEach((s, i) => {
        if (i > 0) text(i === steps.length - 1 ? t("words.sentence.andLast") : t("words.sentence.then"));
        out.push({ text: stepPhrase(s), stepId: s.id, chip: true, placeholder: false });
      });
    }
    text(t("words.sentence.end"));
    return out;
  };

  return {
    triggerTitle,
    triggerSubtitle,
    triggerLine,
    stepKind,
    stepTitle,
    stepSubtitle,
    sentence,
    // Pieces the read rows use.
    recipients,
    recipient,
    timing,
    conditionsText,
    eventConditionsText,
    changeValue,
    dateNoun,
    scheduleTitle,
  };
};

export type AutomationWords = ReturnType<typeof automationWords>;
