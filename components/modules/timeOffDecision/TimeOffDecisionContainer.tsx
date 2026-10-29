"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
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
        <p className="text-sm text-muted-foreground">{STATUS_LABELS[request.status] ?? request.status}</p>
        <h1 className="text-2xl font-semibold text-brown-900">
          <Link href={`/organization/people/${request.userId}`} className="hover:underline">
            {requesterName ?? "An employee"}
          </Link>
        </h1>
        <p className="mt-1 text-sm text-brown-700">
          {range(request)} · {days(request.requestedAmount)}
        </p>
        {request.reason && <p className="mt-2 text-sm text-brown-700">“{request.reason}”</p>}
        {awaitingYou && answeringAs === "DELEGATE" && answeringOnBehalfOfName && (
          <p className="mt-2 text-sm text-muted-foreground">
            You are answering for {answeringOnBehalfOfName}, who delegated their approvals to you.
          </p>
        )}
        {awaitingYou && answeringAs === "FALLBACK" && (
          <p className="mt-2 text-sm text-muted-foreground">
            This reached you because nobody in the approval chain can answer it.
          </p>
        )}
        {request.decidedAnyway && (
          <p className="mt-2 text-sm text-muted-foreground">Decided over the approval chain by an administrator.</p>
        )}
      </div>

      {steps.length > 0 && <ApprovalSteps steps={steps} />}

      <section className="rounded-lg border border-brown-200 p-4">
        <p className="text-sm font-medium text-brown-800">Balance on this policy</p>
        {balance ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <dt className="text-muted-foreground">Available</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.currentBalance)}</dd>
            <dt className="text-muted-foreground">Reserved by requests awaiting an answer</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.pendingBalance)}</dd>
            <dt className="text-muted-foreground">Period</dt>
            <dd className="sm:col-span-2">
              {formatDisplayDate(balance.periodStart)}
              {balance.periodEnd ? ` – ${formatDisplayDate(balance.periodEnd)}` : " onwards"}
            </dd>
          </dl>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">No balance for the period this request falls in.</p>
        )}
      </section>

      <section className="rounded-lg border border-brown-200 p-4">
        <p className="text-sm font-medium text-brown-800">Their other leave around these dates</p>
        {otherLeave.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">None within a month either side.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {otherLeave.map((r) => (
              <li key={r.id}>
                {range(r)} · {days(r.requestedAmount)} ·{" "}
                <span className="text-muted-foreground">{STATUS_LABELS[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-brown-200 p-4">
        <p className="text-sm font-medium text-brown-800">Also away over these dates</p>
        {peersAway.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">Nobody they work with.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {peersAway.map((p) => (
              <li key={`${p.userId}-${p.startDate}`}>
                {p.firstName} {p.lastName} · {range(p)}
                {p.status === "PENDING" && <span className="text-muted-foreground"> · not yet approved</span>}
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
                <Check className="h-4 w-4" />
                Approve Cancellation
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void run(() => decideCancellation.mutateAsync({
                requestId, userId: request.userId, decision: "DECLINE" }))}>
                <X className="h-4 w-4" />
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
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      {canDecideAnyway && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brown-100 pt-4">
          <p className="mr-2 text-sm text-muted-foreground">
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
  <section className="rounded-lg border border-brown-200 p-4">
    <p className="text-sm font-medium text-brown-800">Approval</p>
    <ol className="mt-2 space-y-1.5 text-sm">
      {steps.map((step) => {
        const line = approvalStepLine(step);
        return (
          <li key={step.approvalOrder} className="flex gap-2">
            <span className="text-muted-foreground tabular-nums">{step.approvalOrder}.</span>
            <span>
              <span className="text-muted-foreground">Asked:</span> {line.asked}
              {line.answered ? (
                <>
                  {" · "}
                  <span className="text-muted-foreground">Answered by</span> {line.answered}
                </>
              ) : (
                <span className="text-muted-foreground"> · Not answered yet</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  </section>
);
