"use client";

import { FC } from "react";
import { Label } from "@/public/desact/src/components/ui/label";
import { UserPickerField, type PickedUser } from "@/components/modules/settings/shared/UserPickerField/UserPickerField";
import { formatDisplayDate } from "@/lib/date";
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

const processLabel = (type: string | null): string =>
  type === "OFFBOARDING" ? "Offboarding" : type === "ONBOARDING" ? "Onboarding" : "Process";

const span = (start: string, end: string) =>
  start === end ? formatDisplayDate(start) : `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;

/** One default for a group, as a sentence: the roles named when they are the same, generic when not. */
const fallbackDefault = (names: (string | null)[]): string => {
  const distinct = Array.from(new Set(names));
  if (distinct.length === 1 && distinct[0]) return `Unchosen, they go to the ${distinct[0]} role, the policy's fallback.`;
  if (distinct.every((n) => !n)) return "Unchosen, they wait for an administrator: the policy has no fallback role.";
  return "Unchosen, each goes to its policy's fallback role.";
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
  const groups = [
    decisions.requests.length > 0 && {
      key: "requestsTo" as const,
      title: `Leave Requests Waiting on Them (${decisions.requests.length})`,
      items: decisions.requests.map((r) => `${r.requester?.name ?? "A colleague"} · ${span(r.startDate, r.endDate)}`),
      hint: fallbackDefault(decisions.requests.map((r) => r.fallbackRoleName)),
    },
    decisions.tasks.length > 0 && {
      key: "tasksTo" as const,
      title: `Tasks Assigned to Them (${decisions.tasks.length})`,
      items: decisions.tasks.map((t) => (t.subject?.name ? `${t.title} · for ${t.subject.name}` : t.title)),
      hint: "Unchosen, each goes to its onboarding manager.",
    },
    decisions.policies.length > 0 && {
      key: "policiesTo" as const,
      title: `Leave Policies Naming Them (${decisions.policies.length})`,
      items: decisions.policies.map((p) => `${p.policyName ?? "A policy"} · step ${p.approvalOrder}`),
      hint: fallbackDefault(decisions.policies.map((p) => p.fallbackRoleName)),
    },
    // The processes they manage: the tasks held by the onboarding manager follow whoever takes them
    // (WALK_QUESTIONS § 18, decided 2026-10-27).
    (decisions.processes?.length ?? 0) > 0 && {
      key: "processesTo" as const,
      title: `Processes They Manage (${decisions.processes!.length})`,
      items: decisions.processes!.map((p) =>
        p.subject?.name ? `${processLabel(p.type)} of ${p.subject.name}` : processLabel(p.type)),
      hint: decisions.processes![0].defaultManager?.name
        ? `Unchosen, they go to ${decisions.processes![0].defaultManager.name}, their manager, with the tasks that come with them.`
        : "Unchosen, they stay without an onboarding manager until somebody sets one: this person has no manager.",
    },
  ].filter((g): g is Exclude<typeof g, false> => !!g);

  return (
    <div className="space-y-4 rounded-lg border border-brown-200 p-3.5">
      <div>
        <p className="text-sm font-medium text-brown-900">Decisions Waiting on {fullName}</p>
        <p className="text-xs text-muted-foreground">
          Handed on when the termination takes effect, with anything that arrives before then.
        </p>
      </div>
      {groups.map((g) => (
        <div key={g.key} className="space-y-1.5" data-test={`leaver-group-${g.key}`}>
          <Label htmlFor={`reassign-${g.key}`} className="text-sm">{g.title}</Label>
          <ul className="space-y-0.5 text-xs text-brown-700">
            {g.items.slice(0, 5).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
            {g.items.length > 5 && <li className="text-muted-foreground">and {g.items.length - 5} more</li>}
          </ul>
          <UserPickerField
            id={`reassign-${g.key}`}
            value={value[g.key]}
            onChange={(u) => onChange({ ...value, [g.key]: u })}
            placeholder="Reassign To…"
            disabled={disabled}
          />
          {!value[g.key] && <p className="text-xs text-muted-foreground">{g.hint}</p>}
        </div>
      ))}
    </div>
  );
};
