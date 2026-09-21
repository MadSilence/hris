"use client";

import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { FC, useState } from "react";
import { UserPlus, Users, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PolicyAssignmentWarning } from "./PolicyAssignmentWarning";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";

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
  // The person arrives with the assignment. Fetching them per row meant one request per assignee
  // and the word "Loading…" where a name belongs — on a policy with fifty people, fifty requests.
  const name = assignment.person?.name ?? "Unnamed";

  return (
    <div className="group flex items-center justify-between gap-2 rounded-md py-1 pl-3 pr-1 hover:bg-brown-50">
      <div className="flex min-w-0 items-center gap-3">
        <UserChip
          id={assignment.userId}
          name={name}
          avatarUrl={assignment.person?.avatarUrl}
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
          className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-brown-400 opacity-0 transition hover:bg-brown-100 hover:text-danger-600 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
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
  const [showEnded, setShowEnded] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const { data: assignments, isLoading, error } = useTimeOffPolicyAssignments({ policyId });
  const endMutation = useEndTimeOffPolicyAssignment();

  // Active by default, with the ended ones one click away rather than invisible: "who used to be on
  // this policy" is a question the screen could not answer at all.
  const active = (assignments ?? []).filter(
    (a) => a.status === TimeOffPolicyAssignmentStatus.Active,
  );
  const ended = (assignments ?? []).filter(
    (a) => a.status !== TimeOffPolicyAssignmentStatus.Active,
  );
  const shown = showEnded ? [...active, ...ended] : active;

  const handleEnd = async (assignment: TimeOffPolicyAssignment) => {
    setEndingId(assignment.id);
    setEndError(null);
    try {
      await endMutation.mutateAsync({ assignmentId: assignment.id, policyId, effectiveTo: null });
    } catch (error) {
      // There was no catch at all: ending an assignment that the backend refuses looked exactly
      // like ending one it accepted.
      setEndError(
        error instanceof Error ? error.message : "The assignment could not be ended.",
      );
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
      renderSelectionWarning={(userIds) => <PolicyAssignmentWarning policyId={policyId} userIds={userIds} />}
    />
  );

  const assignButton = !isArchived && (
    <Button size="sm" className="gap-1.5" onClick={() => setAssignOpen(true)}>
      <UserPlus className="h-4 w-4" />
      Assign people
    </Button>
  );

  // "Nobody" means nobody ever, not "nobody right now".
  //
  // Keyed on `active.length` alone, this claimed "No one is assigned yet" for a policy whose only
  // assignment had ended — which is false, someone was assigned and it finished — and it took the
  // "Show N ended" toggle down with it, since that lives in the branch below. The one case where
  // the ended list is the only thing worth reading was the one case that hid it.
  if (!isLoading && !error && active.length === 0 && ended.length === 0) {
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
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {active.length} {active.length === 1 ? "person" : "people"} assigned
          </p>
          {ended.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowEnded((v) => !v)}
            >
              {showEnded ? "Hide" : "Show"} {ended.length} ended
            </Button>
          )}
        </div>
        {assignButton}
      </div>

      {endError && <p className="flex-none text-sm text-destructive">{endError}</p>}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-2">
                <Skeleton className="h-6 w-6 flex-none rounded-full" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-danger-500">Failed to load assignments.</p>
        ) : (
          <div className="flex flex-col">
            {shown.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onEnd={handleEnd}
                ending={endingId === assignment.id}
                disabled={isArchived || assignment.status !== TimeOffPolicyAssignmentStatus.Active}
              />
            ))}
          </div>
        )}
      </div>

      {assignModal}
    </div>
  );
};
