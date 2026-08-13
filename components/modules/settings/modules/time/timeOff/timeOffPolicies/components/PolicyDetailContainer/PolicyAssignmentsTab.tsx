"use client";

import { FC, useState } from "react";
import { UserPlus, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import { useUser } from "@/components/hooks/useUser/useUser";

import { useTimeOffPolicyAssignments } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments";
import { useEndTimeOffPolicyAssignment } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useEndTimeOffPolicyAssignment";
import { getTimeOffPolicyAssignmentsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto/TimeOffPolicyAssignmentStatus";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";

type Props = {
  policyId: string;
  policyName: string;
  isArchived: boolean;
};

function AssignmentRow({
  assignment,
  onEnd,
  ending,
  disabled,
}: {
  assignment: TimeOffPolicyAssignment;
  onEnd: (assignment: TimeOffPolicyAssignment) => void;
  ending: boolean;
  disabled: boolean;
}) {
  const { data: user } = useUser(assignment.userId);
  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
    : "Loading…";

  return (
    <div className="group flex items-center justify-between gap-2 rounded-md py-1 pl-3 pr-1 hover:bg-brown-50">
      <div className="flex min-w-0 items-center gap-3">
        <UserChip
          id={assignment.userId}
          name={name}
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
          avatarUrl={user?.avatarUrl}
        />
        <span className="hidden text-xs text-muted-foreground sm:inline">
          from {assignment.effectiveFrom}
          {assignment.effectiveTo ? ` to ${assignment.effectiveTo}` : ""}
        </span>
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={() => onEnd(assignment)}
          disabled={ending}
          aria-label="End assignment"
          title="End assignment"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-brown-400 opacity-0 transition hover:bg-brown-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export const PolicyAssignmentsTab: FC<Props> = ({ policyId, policyName, isArchived }) => {
  const [assignOpen, setAssignOpen] = useState(false);
  const [endingId, setEndingId] = useState<string | null>(null);

  const { data: assignments, isLoading, error } = useTimeOffPolicyAssignments({ policyId });
  const endMutation = useEndTimeOffPolicyAssignment();

  const active = (assignments ?? []).filter(
    (a) => a.status === TimeOffPolicyAssignmentStatus.Active,
  );

  const handleEnd = async (assignment: TimeOffPolicyAssignment) => {
    setEndingId(assignment.id);
    try {
      await endMutation.mutateAsync({ assignmentId: assignment.id, policyId, effectiveTo: null });
    } finally {
      setEndingId(null);
    }
  };

  const assignModal = (
    <AssignPeopleModal
      isOpen={assignOpen}
      onCloseAction={() => setAssignOpen(false)}
      basePath="/time-off/policies"
      assignableId={policyId}
      assignableName={policyName}
      noun="policy"
      semantics="add"
      temporal
      invalidateKeys={[getTimeOffPolicyAssignmentsQueryKey(policyId)]}
    />
  );

  const assignButton = !isArchived && (
    <Button size="sm" className="gap-1.5" onClick={() => setAssignOpen(true)}>
      <UserPlus className="h-4 w-4" />
      Assign people
    </Button>
  );

  if (!isLoading && !error && active.length === 0) {
    return (
      <>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
          <div className="mb-4 rounded-2xl bg-brown-50 p-4">
            <Users className="h-7 w-7 text-brown-600" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No one is assigned yet</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Assign this policy to people — individually or by segment — to give them this time off.
          </p>
          {assignButton && <div className="mt-5">{assignButton}</div>}
        </div>
        {assignModal}
      </>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-none items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {active.length} {active.length === 1 ? "person" : "people"} assigned
        </p>
        {assignButton}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-2">
                <div className="h-6 w-6 flex-none animate-pulse rounded-full bg-brown-100" />
                <div className="h-3.5 w-32 animate-pulse rounded bg-brown-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-red-500">Failed to load assignments.</p>
        ) : (
          <div className="flex flex-col">
            {active.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onEnd={handleEnd}
                ending={endingId === assignment.id}
                disabled={isArchived}
              />
            ))}
          </div>
        )}
      </div>

      {assignModal}
    </div>
  );
};
