"use client";

import { Skeleton } from "@/components/desact/skeleton";
import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { PolicyAssignmentWarning } from "./PolicyAssignmentWarning";
import { AssignPeopleModal } from "@/components/audience/assignment/AssignPeopleModal";
import { AssignmentHistoryList, HistoryToggle } from "@/components/audience/assignment/history/AssignmentHistory";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { messageForError } from "@/lib/errors/errorMessages";

import { useTimeOffPolicyAssignments } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useTimeOffPolicyAssignments";
import { useEndTimeOffPolicyAssignment } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicyAssignments/hooks/useEndTimeOffPolicyAssignment";
import { getTimeOffPolicyAssignmentsQueryKey } from "@/components/modules/settings/modules/time/timeOff/utils";
import { TimeOffPolicyAssignmentStatus } from "@/api/modules/timeOff/timeOffPolicyAssignments/dto/TimeOffPolicyAssignmentStatus";
import type { TimeOffPolicyAssignment } from "@/models/timeOff";
import { FieldError } from "@/components/desact/field-error";
import { Illustration } from "@/components/illustrations";

type Props = {
  policyId: string;
  policyName: string;
  isArchived: boolean;
};

function AssignmentRow({
  assignment,
  onEnd,
  disabled,
}: {
  assignment: TimeOffPolicyAssignment;
  onEnd: (assignment: TimeOffPolicyAssignment) => void;
  disabled: boolean;
}) {
  // The person arrives with the assignment. Fetching them per row meant one request per assignee
  // and the word "Loading…" where a name belongs — on a policy with fifty people, fifty requests.
  const t = useTranslations("timeOff");
  const name = assignment.person?.name ?? t("policies.assignments.unnamed");

  return (
    <div className="group flex items-center justify-between gap-2 rounded-control py-1 pl-3 pr-1 hover:bg-subtle">
      <div className="flex min-w-0 items-center gap-3">
        <UserChip
          id={assignment.userId}
          name={name}
          avatarUrl={assignment.person?.avatarUrl}
        />
        <span className="hidden text-hint text-tertiary sm:inline">
          {assignment.effectiveTo
            ? t("policies.assignments.fromTo", { from: assignment.effectiveFrom, to: assignment.effectiveTo })
            : t("policies.assignments.from", { from: assignment.effectiveFrom })}
        </span>
      </div>

      {/*
        Always visible: at `opacity-0` until hover it could not be reached on a touch screen at all.
        Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 7.
      */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onEnd(assignment)}
          aria-label={t("policies.assignments.end")}
          title={t("policies.assignments.end")}
          className="flex h-7 w-7 flex-none items-center justify-center rounded-tag text-tertiary transition hover:bg-mist hover:text-danger-text"
        >
          <Icon icon={Cancel01Icon} size="sm" />
        </button>
      )}
    </div>
  );
}

export const PolicyAssignmentsTab: FC<Props> = ({ policyId, policyName, isArchived }) => {
  const t = useTranslations("timeOff");
  const [assignOpen, setAssignOpen] = useState(false);
  /** The assignment whose ending is being confirmed. */
  const [ending, setEnding] = useState<TimeOffPolicyAssignment | null>(null);
  const [showEnded, setShowEnded] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  /** Who was given the policy, by which rule or by hand, and when. */
  const [showHistory, setShowHistory] = useState(false);

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

  const askEnd = (assignment: TimeOffPolicyAssignment) => {
    setEndError(null);
    setEnding(assignment);
  };

  // Ending is an Unassign, and an Unassign always confirms. The dialog stays open while it runs and
  // while it fails, so a refusal is written inside the dialog that asked — it used to be a line above
  // the list, and before that there was no catch at all.
  const handleEnd = async () => {
    if (!ending) return;
    setEndError(null);
    try {
      await endMutation.mutateAsync({ assignmentId: ending.id, policyId, effectiveTo: null });
      setEnding(null);
    } catch (error) {
      setEndError(messageForError(error));
    }
  };

  const endModal = (
    <ConfirmActionModal
      isOpen={ending !== null}
      title={t("policies.assignments.endTitle")}
      description={t("policies.assignments.endDescription", {
        name: ending?.person?.name ?? t("policies.assignments.thisPerson"),
        policy: policyName,
      })}
      confirmLabel={t("policies.assignments.end")}
      isLoading={endMutation.isPending}
      errorMessage={endError}
      onConfirmAction={handleEnd}
      onCancelAction={() => setEnding(null)}
    />
  );

  const assignModal = (
    <AssignPeopleModal
      isOpen={assignOpen}
      onCloseAction={() => setAssignOpen(false)}
      basePath="/time-off/policies"
      assignableId={policyId}
      assignableName={policyName}
      kind="policy"
      semantics="add"
      temporal
      invalidateKeys={[getTimeOffPolicyAssignmentsQueryKey(policyId)]}
      renderSelectionWarning={(userIds) => <PolicyAssignmentWarning policyId={policyId} userIds={userIds} />}
      currentHolderIds={active.map((a) => a.userId)}
    />
  );

  const assignButton = !isArchived && (
    <Button type="button" size="sm" className="gap-1.5" onClick={() => setAssignOpen(true)}>
      <Icon icon={UserAdd01Icon} size="sm" />
      {t("policies.assignments.assign")}
    </Button>
  );

  // "Nobody" means nobody ever, not "nobody right now".
  //
  // Keyed on `active.length` alone, this claimed "No one is assigned yet" for a policy whose only
  // assignment had ended — which is false, someone was assigned and it finished — and it took the
  // "Show N ended" toggle down with it, since that lives in the branch below. The one case where
  // the ended list is the only thing worth reading was the one case that hid it.
  if (showHistory) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-none items-center justify-end">
          <HistoryToggle showing={showHistory} onChange={setShowHistory} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AssignmentHistoryList assignableType="TIME_OFF_POLICY" assignableId={policyId} />
        </div>
      </div>
    );
  }

  if (!isLoading && !error && active.length === 0 && ended.length === 0) {
    return (
      <>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-card border border-dashed px-6 py-12 text-center">
          <Illustration scene="people-s" size="s" className="mb-4" />
          <h3 className="text-body font-semibold text-primary">{t("policies.assignments.emptyTitle")}</h3>
          <p className="mt-2 max-w-md text-body text-tertiary">
            {t("policies.assignments.emptyHint")}
          </p>
          {assignButton && <div className="mt-5">{assignButton}</div>}
          <HistoryToggle showing={showHistory} onChange={setShowHistory} className="mt-3" />
        </div>
        {assignModal}
      </>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-none items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* A count while the list is still loading claimed "0 people assigned" for seconds. */}
          {isLoading ? (
            <Skeleton className="h-4 w-28" />
          ) : error ? null : (
            <p className="text-body text-tertiary">
              {t("policies.assignments.assignedCount", { count: active.length })}
            </p>
          )}
          {ended.length > 0 && (
            <Button type="button"
              variant="ghost"
              size="sm"
              className="text-hint text-tertiary"
              onClick={() => setShowEnded((v) => !v)}
            >
              {showEnded
                ? t("policies.assignments.hideEnded", { count: ended.length })
                : t("policies.assignments.showEnded", { count: ended.length })}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <HistoryToggle showing={showHistory} onChange={setShowHistory} />
          {assignButton}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-1 py-2">
                <Skeleton className="h-6 w-6 flex-none rounded-pill" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        ) : error ? (
          <FieldError className="py-6 text-center">{t("policies.assignments.loadFailed")}</FieldError>
        ) : (
          <div className="flex flex-col">
            {shown.map((assignment) => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onEnd={askEnd}
                disabled={isArchived || assignment.status !== TimeOffPolicyAssignmentStatus.Active}
              />
            ))}
          </div>
        )}
      </div>

      {assignModal}
      {endModal}
    </div>
  );
};
