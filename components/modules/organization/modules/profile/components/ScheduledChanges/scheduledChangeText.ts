import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { formatUserStatus } from "@/models/user/status";
import { NONE_LABEL_KEY } from "@/models/select";
import type { useTranslations } from "next-intl";

type OrgTranslator = ReturnType<typeof useTranslations<"organization">>;
type CommonTranslator = ReturnType<typeof useTranslations<"common">>;

/** What a dated assignment touches, as a label names it — a key under `profile.scheduled.things`. */
const ASSIGNABLE_LABELS = {
  OFFICE: "profile.scheduled.things.office",
  LEGAL_ENTITY: "profile.scheduled.things.legalEntity",
  DEPARTMENT: "profile.scheduled.things.department",
  TEAM: "profile.scheduled.things.team",
  JOB: "profile.scheduled.things.job",
  ROLE: "profile.scheduled.things.role",
  PUBLIC_HOLIDAY_CALENDAR: "profile.scheduled.things.holidayCalendar",
} as const;

/** The value a change carries, as a reader reads it: a status by its word, a reference by its name. */
export const valueLabelOf = (tCommon: CommonTranslator, change: ScheduledChange): string => {
  if (!change.value) return "";
  if (change.fieldId === "sys:status") return formatUserStatus(tCommon, change.value.id);
  return change.value.name ?? "";
};

/** One line naming the change — a label, so sentence case (`NAMING.md`). */
export const labelOfChange = (t: OrgTranslator, tCommon: CommonTranslator, change: ScheduledChange): string => {
  switch (change.kind) {
    case "TERMINATION":
      return t("profile.scheduled.kind.termination");
    case "EMPLOYMENT_START":
      return t("profile.scheduled.kind.employmentStart");
    case "INVITATION":
      return t("profile.scheduled.kind.invitation");
    case "TASK_DUE":
      return change.subject
        ? t("profile.scheduled.kind.taskDueSubject", { subject: change.subject })
        : t("profile.scheduled.kind.taskDue");
    case "ASSIGNMENT_START":
    case "ASSIGNMENT_END": {
      const type = change.labelKey.split(".")[1] ?? "";
      const thingKey = ASSIGNABLE_LABELS[type as keyof typeof ASSIGNABLE_LABELS];
      const thing = thingKey ? t(thingKey) : t("profile.scheduled.things.assignment");
      const name = valueLabelOf(tCommon, change);
      if (change.kind === "ASSIGNMENT_START") {
        return name
          ? t("profile.scheduled.assignment.startsNamed", { thing, name })
          : t("profile.scheduled.assignment.starts", { thing });
      }
      return name
        ? t("profile.scheduled.assignment.endsNamed", { thing, name })
        : t("profile.scheduled.assignment.ends", { thing });
    }
    default:
      return change.labelKey;
  }
};

/** What Change Date edits, by kind — the day a person reads it as, not the engine's effective day. */
export const rescheduleDateLabelOf = (t: OrgTranslator, change: ScheduledChange): string =>
  change.kind === "TERMINATION" ? t("profile.scheduled.lastWorkingDay") : t("profile.scheduled.sendOn");

/** The fields that hold several values; every other field holds one. */
const MULTI_VALUED = new Set(["sys:role", "sys:team", "sys:calendar"]);

export type FieldValue = { id: string; name: string };

/** One muted "→ new from date" after the current value. */
export type PendingStep = { date: string; label: string };

/**
 * What a field will read, date by date, given its value now and the changes waiting on it.
 *
 * Applied in date order, so an office that starts on the 1st and ends on the 31st reads
 * `London → Paris from 1 Dec → None from 1 Jan`. A date that would leave the field as it was draws
 * nothing: a removal of a value the field does not hold is not a change anybody would see.
 */
export const pendingSteps = (
  tCommon: CommonTranslator,
  changes: ScheduledChange[] | undefined,
  fieldId: string,
  current: FieldValue[],
): PendingStep[] => {
  const forField = (changes ?? [])
    .filter((c) => c.fieldId === fieldId && c.operation && c.value)
    .sort((a, b) => a.effectiveAt.localeCompare(b.effectiveAt));
  if (forField.length === 0) return [];

  const multi = MULTI_VALUED.has(fieldId);
  const nameOf = (values: FieldValue[]) =>
    values.length === 0 ? tCommon(NONE_LABEL_KEY) : values.map((v) => v.name).join(", ");

  let values = [...current];
  let lastLabel = nameOf(values);
  const steps: PendingStep[] = [];

  const dates = Array.from(new Set(forField.map((c) => c.effectiveAt)));
  for (const date of dates) {
    for (const change of forField.filter((c) => c.effectiveAt === date)) {
      if (!change.value) continue;
      const value: FieldValue = { id: change.value.id, name: valueLabelOf(tCommon, change) };
      if (change.operation === "SET" || (change.operation === "ADD" && !multi)) {
        values = [value];
      } else if (change.operation === "ADD") {
        if (!values.some((v) => v.id === value.id)) values = [...values, value];
      } else {
        values = values.filter((v) => v.id !== value.id);
      }
    }
    const label = nameOf(values);
    if (label !== lastLabel) {
      steps.push({ date, label });
      lastLabel = label;
    }
  }
  return steps;
};
