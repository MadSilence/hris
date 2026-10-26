import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { formatUserStatus } from "@/models/user/status";
import { NONE_LABEL } from "@/models/select";

/** What a dated assignment touches, as a label names it. */
const ASSIGNABLE_LABELS: Record<string, string> = {
  OFFICE: "Office",
  LEGAL_ENTITY: "Legal Entity",
  DEPARTMENT: "Department",
  TEAM: "Team",
  JOB: "Job",
  ROLE: "Role",
  PUBLIC_HOLIDAY_CALENDAR: "Holiday Calendar",
};

/** The value a change carries, as a reader reads it: a status by its word, a reference by its name. */
export const valueLabelOf = (change: ScheduledChange): string => {
  if (!change.value) return "";
  if (change.fieldId === "sys:status") return formatUserStatus(change.value.id);
  return change.value.name ?? "";
};

/** One line naming the change — a label, so Title Case (`NAMING.md`). */
export const labelOfChange = (change: ScheduledChange): string => {
  switch (change.kind) {
    case "TERMINATION":
      return "Employment Ends";
    case "EMPLOYMENT_START":
      return "Employment Starts";
    case "INVITATION":
      return "Invitation Goes Out";
    case "TASK_DUE":
      return change.subject ? `Task Due: ${change.subject}` : "Task Due";
    case "ASSIGNMENT_START":
    case "ASSIGNMENT_END": {
      const type = change.labelKey.split(".")[1] ?? "";
      const thing = ASSIGNABLE_LABELS[type] ?? "Assignment";
      const verb = change.kind === "ASSIGNMENT_START" ? "Starts" : "Ends";
      const name = valueLabelOf(change);
      return name ? `${thing} ${verb}: ${name}` : `${thing} ${verb}`;
    }
    default:
      return change.labelKey;
  }
};

/** What Change Date edits, by kind — the day a person reads it as, not the engine's effective day. */
export const rescheduleDateLabelOf = (change: ScheduledChange): string =>
  change.kind === "TERMINATION" ? "Last Working Day" : "Send On";

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
    values.length === 0 ? NONE_LABEL : values.map((v) => v.name).join(", ");

  let values = [...current];
  let lastLabel = nameOf(values);
  const steps: PendingStep[] = [];

  const dates = Array.from(new Set(forField.map((c) => c.effectiveAt)));
  for (const date of dates) {
    for (const change of forField.filter((c) => c.effectiveAt === date)) {
      if (!change.value) continue;
      const value: FieldValue = { id: change.value.id, name: valueLabelOf(change) };
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
