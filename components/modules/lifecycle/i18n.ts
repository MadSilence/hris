import type { useTranslations } from "next-intl";
import type { DueKind, ProcessType, TemplateAssigneeKind } from "@/models/lifecycle";

/** The `lifecycle` namespace's translator — what the module's pure functions are handed to say things. */
export type LifecycleT = ReturnType<typeof useTranslations<"lifecycle">>;

/**
 * An assignee kind as an offboarding says it: the leaver, and the manager who runs it — the same role the
 * product calls the onboarding manager everywhere else.
 */
export const assigneeKindText = (t: LifecycleT, kind: TemplateAssigneeKind, type?: ProcessType | null): string =>
  type === "OFFBOARDING" ? t(`assigneeKindOffboarding.${kind}`) : t(`assigneeKind.${kind}`);

/** "N days before start" and its kin, counted from the start day — or an offboarding's last working day. */
const offsetText = (t: LifecycleT, n: number, leaving: boolean): string => {
  const count = Math.abs(n);
  if (leaving) return n < 0 ? t("due.beforeLastDay", { count }) : t("due.afterLastDay", { count });
  return n < 0 ? t("due.beforeStart", { count }) : t("due.afterStart", { count });
};

/**
 * "7 days before start", "On the start day", "3 days after start", "By the start day" — or, for an offboarding,
 * counted from the last working day: "By the last day", "2 days after the last day".
 */
export const describeDue = (
  t: LifecycleT, dueKind: DueKind, offsetDays: number | null | undefined, type?: ProcessType | null,
): string => {
  const leaving = type === "OFFBOARDING";
  if (dueKind === "BEFORE_START") return leaving ? t("due.byLastDay") : t("due.byStartDay");
  const n = offsetDays ?? 0;
  if (n === 0) return leaving ? t("due.onLastDay") : t("due.onStartDay");
  return offsetText(t, n, leaving);
};

/**
 * The template canvas's way of saying a day: "By the start day", "Day 1", "3 days after start" — agreeing with
 * the ruler's "+3"; an offboarding's anchor is its "Last day".
 */
export const canvasDayText = (
  t: LifecycleT, dueKind: DueKind, offsetDays: number | null | undefined, type?: ProcessType | null,
): string => {
  const leaving = type === "OFFBOARDING";
  if (dueKind === "BEFORE_START") return leaving ? t("due.byLastDay") : t("due.byStartDay");
  const n = offsetDays ?? 0;
  if (n === 0) return leaving ? t("due.lastDay") : t("due.dayOne");
  return offsetText(t, n, leaving);
};
