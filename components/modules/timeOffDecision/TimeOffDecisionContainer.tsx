"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { formatDisplayDate } from "@/lib/date";
import { formatDayAmount, type TimeOffDecisionContext, type TimeOffRequest } from "@/models/timeOff";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import type { TimeOffApprovalStepDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { DecideAnywayControls } from "./DecideAnywayControls";

export const timeOffDecisionQueryKey = (id: string) => ["TIME_OFF_DECISION_CONTEXT", id] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Waiting for approval",
  APPROVED: "Approved",
  CANCELLATION_PENDING: "Cancellation requested",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const days = (n: number) => `${formatDayAmount(n)} ${n === 1 ? "day" : "days"}`;
const range = (r: Pick<TimeOffRequest, "startDate" | "endDate">) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate)
    : `${formatDisplayDate(r.startDate)} – ${formatDisplayDate(r.endDate)}`;

/**
 * One request and what its decision needs (WALK_QUESTIONS § 7) — where the approval notification
 * leads. The approver it waits on may read this without any role over the requester; the backend
 * derives that from the request and drops it once they have answered.
 */
export const TimeOffDecisionContainer: React.FC<{ requestId: string }> = ({ requestId }) => {
  const { internalApiClient } = useAppDataContext();
  const queryClient = useQueryClient();
  const invalidateNotifications = useInvalidateNotifications();
  const context = useQuery<TimeOffDecisionContext>({
    queryKey: timeOffDecisionQueryKey(requestId),
    queryFn: () => internalApiClient.get<TimeOffDecisionContext>(`/time-off/requests/${requestId}/decision-context`),
  });

  const approve = useApproveTimeOffRequest();
  const reject = useRejectTimeOffRequest();
  const decideCancellation = useDecideCancellation();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reasonId = useId();

  if (context.isLoading) {
    return (
      <div className="flex max-w-3xl flex-col gap-3 px-8 py-6">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }
  if (context.error || !context.data) {
    return (
      <div className="px-8 py-6">
        <ErrorState error={context.error} onRetry={() => void context.refetch()} />
      </div>
    );
  }

  const {
    request,
    requesterName,
    balance,
    otherLeave,
    peersAway,
    awaitingYou,
    answeringAs,
    answeringOnBehalfOfName,
    canDecideAnyway,
    steps,
  } = context.data;
  const busy = approve.isPending || reject.isPending || decideCancellation.isPending;
  const isCancellation = request.status === "CANCELLATION_PENDING";

  const run = async (act: () => Promise<unknown>) => {
    setError(null);
    try {
      await act();
      invalidateNotifications();
      await queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
      setRejecting(false);
      setReason("");
    } catch (e) {
      setError(messageForError(e));
      await queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
    }
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6 px-8 py-6">
      <div>
        <p className="text-body text-tertiary">{STATUS_LABELS[request.status] ?? request.status}</p>
        <h1 className="text-page-title text-primary">
          <Link href={`/organization/people/${request.userId}`} className="text-accent-text underline-offset-4 hover:underline">
            {requesterName ?? "An employee"}
          </Link>
        </h1>
        <p className="mt-1 text-body text-secondary">
          {range(request)} · {days(request.requestedAmount)}
        </p>
        {request.reason && <p className="mt-2 text-body text-secondary">“{request.reason}”</p>}
        {awaitingYou && answeringAs === "DELEGATE" && answeringOnBehalfOfName && (
          <p className="mt-2 text-body text-tertiary">
            You are answering for {answeringOnBehalfOfName}, who delegated their approvals to you.
          </p>
        )}
        {awaitingYou && answeringAs === "FALLBACK" && (
          <p className="mt-2 text-body text-tertiary">
            This reached you because nobody in the approval chain can answer it.
          </p>
        )}
        {request.decidedAnyway && (
          <p className="mt-2 text-body text-tertiary">Decided over the approval chain by an administrator.</p>
        )}
      </div>

      {steps.length > 0 && <ApprovalSteps steps={steps} />}

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">Balance on this policy</p>
        {balance ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-body sm:grid-cols-3">
            <dt className="text-tertiary">Available</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.currentBalance)}</dd>
            <dt className="text-tertiary">Reserved by requests awaiting an answer</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.pendingBalance)}</dd>
            <dt className="text-tertiary">Period</dt>
            <dd className="sm:col-span-2">
              {formatDisplayDate(balance.periodStart)}
              {balance.periodEnd ? ` – ${formatDisplayDate(balance.periodEnd)}` : " onwards"}
            </dd>
          </dl>
        ) : (
          <p className="mt-1 text-body text-tertiary">No balance for the period this request falls in.</p>
        )}
      </section>

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">Their other leave around these dates</p>
        {otherLeave.length === 0 ? (
          <p className="mt-1 text-body text-tertiary">None within a month either side.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-body">
            {otherLeave.map((r) => (
              <li key={r.id}>
                {range(r)} · {days(r.requestedAmount)} ·{" "}
                <span className="text-tertiary">{STATUS_LABELS[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">Also away over these dates</p>
        {peersAway.length === 0 ? (
          <p className="mt-1 text-body text-tertiary">Nobody they work with.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-body">
            {peersAway.map((p) => (
              <li key={`${p.userId}-${p.startDate}`}>
                {p.firstName} {p.lastName} · {range(p)}
                {p.status === "PENDING" && <span className="text-tertiary"> · not yet approved</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <FormError message={error} />

      {awaitingYou && (
        <div>
          {isCancellation ? (
            <div className="flex gap-2">
              <Button type="button" disabled={busy} onClick={() => void run(() => decideCancellation.mutateAsync({
                requestId, userId: request.userId, decision: "CONFIRM" }))}>
                <Icon icon={Tick02Icon} size="sm" />
                Approve cancellation
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void run(() => decideCancellation.mutateAsync({
                requestId, userId: request.userId, decision: "DECLINE" }))}>
                <Icon icon={Cancel01Icon} size="sm" />
                Decline
              </Button>
            </div>
          ) : rejecting ? (
            <div className="flex max-w-md flex-col gap-1.5">
              <RequiredLabel htmlFor={reasonId} required>Reason</RequiredLabel>
              <Input id={reasonId} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
              <div className="mt-1 flex gap-2">
                <Button type="button" variant="destructive" disabled={busy || !reason.trim()}
                        onClick={() => void run(() => reject.mutateAsync({ requestId, rejectionReason: reason.trim() }))}>
                  Reject
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => setRejecting(false)}>Back</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" disabled={busy} onClick={() => void run(() => approve.mutateAsync({ requestId }))}>
                <Icon icon={Tick02Icon} size="sm" />
                Approve
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => setRejecting(true)}>
                <Icon icon={Cancel01Icon} size="sm" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      {canDecideAnyway && (
        <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-4">
          <p className="mr-2 text-body text-tertiary">
            {awaitingYou ? "Or decide over the chain:" : "You may decide over the approval chain."}
          </p>
          <DecideAnywayControls
            requestId={requestId}
            requesterName={requesterName}
            onDecided={async () => {
              invalidateNotifications();
              await queryClient.invalidateQueries({ queryKey: timeOffDecisionQueryKey(requestId) });
            }}
          />
        </div>
      )}
    </div>
  );
};

/** "Asked: Anna · Answered by Maria on behalf of Anna" — one line per step of the chain. */
export const approvalStepLine = (step: TimeOffApprovalStepDTO): { asked: string; answered: string | null } => {
  const askedName =
    step.askedReason === "FALLBACK"
      ? step.askedRoleName
        ? `the ${step.askedRoleName} role${step.askedUserName ? ` (for ${step.askedUserName})` : ""}`
        : "nobody — no fallback is set"
      : step.askedUserName ?? (step.approverType === "MANAGER" ? "the manager — nobody in that seat" : "nobody");
  const asked = step.reassignedToName ? `${askedName}, reassigned to ${step.reassignedToName}` : askedName;
  if (!step.signed) return { asked, answered: null };
  const by = step.decidedByName ?? "somebody since deleted";
  const answered =
    step.via === "DELEGATE" && step.onBehalfOfName
      ? `${by} on behalf of ${step.onBehalfOfName}`
      : step.via === "FALLBACK"
        ? `${by}, as the fallback`
        : step.via === "OVERRIDE"
          ? `${by}, approving anyway`
          : by;
  return { asked, answered };
};

const ApprovalSteps: React.FC<{ steps: TimeOffApprovalStepDTO[] }> = ({ steps }) => (
  <section className="rounded-card border border-divider p-4">
    <p className="text-body font-medium text-primary">Approval</p>
    <ol className="mt-2 space-y-1.5 text-body">
      {steps.map((step) => {
        const line = approvalStepLine(step);
        return (
          <li key={step.approvalOrder} className="flex gap-2">
            <span className="text-tertiary tabular-nums">{step.approvalOrder}.</span>
            <span>
              <span className="text-tertiary">Asked:</span> {line.asked}
              {line.answered ? (
                <>
                  {" · "}
                  <span className="text-tertiary">Answered by</span> {line.answered}
                </>
              ) : (
                <span className="text-tertiary"> · Not answered yet</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  </section>
);
