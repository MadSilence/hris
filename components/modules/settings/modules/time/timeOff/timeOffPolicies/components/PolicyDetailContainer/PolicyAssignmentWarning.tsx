"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { useTimeOffAssignmentImpact } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffAssignmentImpact/useTimeOffAssignmentImpact";

type Props = {
  policyId: string;
  userIds: string[];
};

const NAMES_SHOWN = 5;

const names = (people: { firstName?: string | null; lastName?: string | null }[]): string => {
  const shown = people
    .slice(0, NAMES_SHOWN)
    .map((p) => `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim())
    .filter(Boolean);
  const rest = people.length - shown.length;
  return rest > 0 ? `${shown.join(", ")} and ${rest} more` : shown.join(", ");
};

/**
 * Before a policy is assigned by hand: who it cannot work for.
 *
 * The submission edge already refuses a request whose approval chain resolves to nobody. Without this
 * the problem is found by the employee, one refused request at a time — the worst place to find it.
 * The decision was to refuse at both edges; this is the assignment edge, as a warning the administrator
 * reads before pressing Add.
 */
export const PolicyAssignmentWarning: React.FC<Props> = ({ policyId, userIds }) => {
  const { data: impact } = useTimeOffAssignmentImpact({ policyId, userIds });
  if (!impact) return null;

  const noApprover = impact.withoutApprover;
  const noHireDate = impact.withoutHireDate;
  if (noApprover.length === 0 && noHireDate.length === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-md bg-warning-50 px-4 py-3 text-sm text-warning-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
      <div className="space-y-1">
        {noApprover.length > 0 ? (
          <p className="m-0">
            {noApprover.length} of {impact.selected} selected {impact.selected === 1 ? "person has" : "people have"} nobody
            the approval chain can reach — usually no manager — so their requests could not be approved:{" "}
            {names(noApprover)}.
          </p>
        ) : null}
        {noHireDate.length > 0 ? (
          <p className="m-0">
            {noHireDate.length} of {impact.selected} selected {impact.selected === 1 ? "person has" : "people have"} no hire
            date, and this policy renews on the hire anniversary, so they will not be assigned: {names(noHireDate)}.
          </p>
        ) : null}
      </div>
    </div>
  );
};
