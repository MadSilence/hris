import type { TriggerSpec } from "@/models/automations";
import { dateToISO, isoToDate } from "@/lib/date";

/**
 * The day a picked date (`field: FIXED`) runs: the date, moved by the trigger's days before or after — the backend
 * shifts it the same way (`AutomationPlanMath.datedOccurrence`). Null without a date.
 */
export const fixedRunDate = (trigger: Pick<TriggerSpec, "date" | "days" | "direction">): string | null => {
  if (!trigger.date) return null;
  const days = trigger.direction === "ON" ? 0 : (trigger.days ?? 0) * (trigger.direction === "BEFORE" ? -1 : 1);
  const d = isoToDate(trigger.date);
  d.setDate(d.getDate() + days);
  return dateToISO(d);
};
