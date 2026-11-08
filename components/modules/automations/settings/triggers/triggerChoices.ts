import {
  Airplane01Icon,
  Calendar03Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Edit02Icon,
  Logout03Icon,
  RepeatIcon,
  TaskDone01Icon,
  UserAdd01Icon,
  UserGroupIcon,
  UserRemove01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@/components/desact/icon";
import type { AutomationCatalog, AutomationEvent, TriggerSpec } from "@/models/automations";

/**
 * The events of the trigger list (F2) — one row each, though the four time-off rows are one trigger type (`EVENT`)
 * with a different `event`, and the process row is `EVENT` too. The key is the shared catalogue's `trigger.*` key.
 */
export type TriggerChoiceKey =
  | "PERSON_HIRED"
  | "TERMINATION_SCHEDULED"
  | "LAST_WORKING_DAY_ARRIVES"
  | "JOINS_SEGMENT"
  | "FIELD_CHANGED"
  | "DATE_OFFSET"
  | "SCHEDULE"
  | "TIME_OFF_REQUESTED"
  | "TIME_OFF_APPROVED"
  | "TIME_OFF_REJECTED"
  | "TIME_OFF_CANCELLED"
  | "PROCESS_COMPLETED";

export type TriggerGroupKey = "people" | "dates" | "timeOff" | "processes";

export type TriggerChoice = { key: TriggerChoiceKey; group: TriggerGroupKey; icon: IconSvgElement };

export const TRIGGER_CHOICES: TriggerChoice[] = [
  { key: "PERSON_HIRED", group: "people", icon: UserAdd01Icon },
  { key: "TERMINATION_SCHEDULED", group: "people", icon: UserRemove01Icon },
  { key: "LAST_WORKING_DAY_ARRIVES", group: "people", icon: Logout03Icon },
  { key: "JOINS_SEGMENT", group: "people", icon: UserGroupIcon },
  { key: "FIELD_CHANGED", group: "people", icon: Edit02Icon },
  { key: "DATE_OFFSET", group: "dates", icon: Calendar03Icon },
  { key: "SCHEDULE", group: "dates", icon: RepeatIcon },
  { key: "TIME_OFF_REQUESTED", group: "timeOff", icon: Airplane01Icon },
  { key: "TIME_OFF_APPROVED", group: "timeOff", icon: CheckmarkCircle02Icon },
  { key: "TIME_OFF_REJECTED", group: "timeOff", icon: CancelCircleIcon },
  { key: "TIME_OFF_CANCELLED", group: "timeOff", icon: Clock01Icon },
  { key: "PROCESS_COMPLETED", group: "processes", icon: TaskDone01Icon },
];

export const TRIGGER_GROUPS: TriggerGroupKey[] = ["people", "dates", "timeOff", "processes"];

const EVENT_KEYS: Partial<Record<TriggerChoiceKey, AutomationEvent>> = {
  TIME_OFF_REQUESTED: "TIME_OFF_REQUESTED",
  TIME_OFF_APPROVED: "TIME_OFF_APPROVED",
  TIME_OFF_REJECTED: "TIME_OFF_REJECTED",
  TIME_OFF_CANCELLED: "TIME_OFF_CANCELLED",
  PROCESS_COMPLETED: "PROCESS_COMPLETED",
};

export const eventOfChoice = (key: TriggerChoiceKey): AutomationEvent | null => EVENT_KEYS[key] ?? null;

/** Which row of the list a trigger is. */
export const choiceOf = (trigger: TriggerSpec | null | undefined): TriggerChoiceKey | null => {
  if (!trigger) return null;
  if (trigger.type === "EVENT") return trigger.event ?? null;
  return trigger.type;
};

/** Whether the catalogue offers a row: its trigger type, and for an event the event too. */
export const offered = (catalog: Pick<AutomationCatalog, "triggers" | "events">, key: TriggerChoiceKey): boolean => {
  const event = eventOfChoice(key);
  if (event) return catalog.triggers.includes("EVENT") && catalog.events.some((e) => e.value === event);
  return catalog.triggers.includes(key as TriggerSpec["type"]);
};

/**
 * A new trigger with the design's defaults: a related date is 14 days before the hire date; a schedule monthly on
 * day 1 at 09:00 in each person's zone; a field change the office, dated as the change starts; time off counts step
 * days from the first day off (T3's pick); a process is any onboarding.
 */
export const defaultTrigger = (key: TriggerChoiceKey): TriggerSpec => {
  switch (key) {
    case "DATE_OFFSET":
      return { type: "DATE_OFFSET", field: "HIRE_DATE", days: 14, direction: "BEFORE", everyYear: false };
    case "SCHEDULE":
      return { type: "SCHEDULE", frequency: "MONTHLY", dayOfMonth: 1, at: "09:00", timeZone: "PERSON" };
    case "FIELD_CHANGED":
      return { type: "FIELD_CHANGED", field: "office", from: null, to: null, when: "EFFECTIVE" };
    case "JOINS_SEGMENT":
      return { type: "JOINS_SEGMENT", onLeave: "TAKE_BACK" };
    case "PROCESS_COMPLETED":
      return { type: "EVENT", event: "PROCESS_COMPLETED", process: "ANY_ONBOARDING", anchor: "EVENT", eventConditions: null };
    case "TIME_OFF_REQUESTED":
    case "TIME_OFF_APPROVED":
    case "TIME_OFF_REJECTED":
    case "TIME_OFF_CANCELLED":
      return { type: "EVENT", event: key, anchor: "LEAVE_START", eventConditions: null };
    default:
      return { type: key };
  }
};
