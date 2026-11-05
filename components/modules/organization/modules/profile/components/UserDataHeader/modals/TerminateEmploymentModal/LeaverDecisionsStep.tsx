"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/desact/label";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import type { LeaverDecisionsDTO } from "@/api/modules/users/clients/hrisApiUsersClient";

export type LeaverReassignmentChoice = {
  requestsTo: PickedUser | null;
  tasksTo: PickedUser | null;
  policiesTo: PickedUser | null;
  processesTo: PickedUser | null;
};

export const NO_REASSIGNMENT: LeaverReassignmentChoice = {
  requestsTo: null,
  tasksTo: null,
  policiesTo: null,
  processesTo: null,
};

export const hasLeaverDecisions = (d: LeaverDecisionsDTO | null | undefined): d is LeaverDecisionsDTO =>
  !!d && d.requests.length + d.tasks.length + d.policies.length + (d.processes?.length ?? 0) > 0;

type OrgTranslator = ReturnType<typeof useTranslations<"organization">>;

const processLabel = (t: OrgTranslator, type: string | null): string =>
  type === "OFFBOARDING"
    ? t("profile.leaver.offboarding")
    : type === "ONBOARDING"
      ? t("profile.leaver.onboarding")
      : t("profile.leaver.process");

const span = (start: string, end: string, formatDisplayDate: DateFormatter) =>
  start === end ? formatDisplayDate(start) : `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;

/** One default for a group, as a sentence: the roles named when they are the same, generic when not. */
const fallbackDefault = (t: OrgTranslator, names: (string | null)[]): string => {
  const distinct = Array.from(new Set(names));
  if (distinct.length === 1 && distinct[0]) return t("profile.leaver.fallbackRole", { role: distinct[0] });
  if (distinct.every((n) => !n)) return t("profile.leaver.fallbackNone");
  return t("profile.leaver.fallbackEach");
};

/**
 * The leaver's-decisions step of a termination: what was waiting on the person — leave requests they
 * were to approve, lifecycle tasks assigned to them, policy steps naming them, processes they manage — with *Reassign To…* per
 * group. Applied with the termination's effects, on the day after the last working day, to whatever is
 * still waiting then; a group left unchosen goes to its default, which each group says.
 */
export const LeaverDecisionsStep: FC<{
  fullName: string;
  decisions: LeaverDecisionsDTO;
  value: LeaverReassignmentChoice;
  onChange: (value: LeaverReassignmentChoice) => void;
  disabled?: boolean;
}> = ({ fullName, decisions, value, onChange, disabled }) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const groups = [
    decisions.requests.length > 0 && {
      key: "requestsTo" as const,
      title: t("profile.leaver.requestsTitle", { count: decisions.requests.length }),
      items: decisions.requests.map((r) =>
        t("profile.leaver.requestItem", { name: r.requester?.name ?? t("profile.leaver.aColleague"), dates: span(r.startDate, r.endDate, formatDisplayDate) })),
      hint: fallbackDefault(t, decisions.requests.map((r) => r.fallbackRoleName)),
    },
    decisions.tasks.length > 0 && {
      key: "tasksTo" as const,
      title: t("profile.leaver.tasksTitle", { count: decisions.tasks.length }),
      items: decisions.tasks.map((task) =>
        (task.subject?.name ? t("profile.leaver.taskItem", { title: task.title, name: task.subject.name }) : task.title)),
      hint: t("profile.leaver.tasksHint"),
    },
    decisions.policies.length > 0 && {
      key: "policiesTo" as const,
      title: t("profile.leaver.policiesTitle", { count: decisions.policies.length }),
      items: decisions.policies.map((p) =>
        t("profile.leaver.policyItem", { policy: p.policyName ?? t("profile.leaver.aPolicy"), step: String(p.approvalOrder) })),
      hint: fallbackDefault(t, decisions.policies.map((p) => p.fallbackRoleName)),
    },
    // The processes they manage: the tasks held by the onboarding manager follow whoever takes them
    // (WALK_QUESTIONS § 18, decided 2026-10-27).
    (decisions.processes?.length ?? 0) > 0 && {
      key: "processesTo" as const,
      title: t("profile.leaver.processesTitle", { count: decisions.processes!.length }),
      items: decisions.processes!.map((p) =>
        p.subject?.name
          ? t("profile.leaver.processItem", { process: processLabel(t, p.type), name: p.subject.name })
          : processLabel(t, p.type)),
      hint: decisions.processes![0].defaultManager?.name
        ? t("profile.leaver.processesHint", { name: decisions.processes![0].defaultManager.name })
        : t("profile.leaver.processesHintNone"),
    },
  ].filter((g): g is Exclude<typeof g, false> => !!g);

  return (
    <div className="space-y-4 rounded-control border border-divider p-3.5">
      <div>
        <p className="text-body font-medium text-primary">{t("profile.leaver.title", { name: fullName })}</p>
        <p className="text-hint text-tertiary">
          {t("profile.leaver.description")}
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="space-y-1.5" data-test={`leaver-group-${g.key}`}>
          <Label htmlFor={`reassign-${g.key}`} className="text-body">{g.title}</Label>
          <ul className="space-y-0.5 text-hint text-secondary">
            {g.items.slice(0, 5).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {g.items.length > 5 && <li className="text-tertiary">{t("profile.leaver.more", { count: g.items.length - 5 })}</li>}
          </ul>
          <UserPickerField
            id={`reassign-${g.key}`}
            value={value[g.key]}
            onChange={(u) => onChange({ ...value, [g.key]: u })}
            placeholder={t("profile.leaver.reassignTo")}
            disabled={disabled}
          />
          {!value[g.key] && <p className="text-hint text-tertiary">{g.hint}</p>}
        </div>
      ))}
    </div>
  );
};
