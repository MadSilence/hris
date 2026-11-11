"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { FieldError } from "@/components/desact/field-error";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { messageForError } from "@/lib/errors/errorMessages";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import { dayAmountArgs, type TimeOffDecisionContext, type TimeOffRequest } from "@/models/timeOff";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import type { TimeOffApprovalStepDTO } from "@/api/modules/timeOff/timeOffRequests/dto";
import { DecideAnywayControls } from "./DecideAnywayControls";

export const timeOffDecisionQueryKey = (id: string) => ["TIME_OFF_DECISION_CONTEXT", id] as const;

type TimeOffT = ReturnType<typeof useTranslations<"timeOff">>;

const STATUS_LABELS = {
  PENDING: "requestStatus.pending",
  APPROVED: "requestStatus.approved",
  CANCELLATION_PENDING: "requestStatus.cancellationPending",
  REJECTED: "requestStatus.rejected",
  CANCELLED: "requestStatus.cancelled",
} as const;

const statusLabel = (t: TimeOffT, status: string) =>
  status in STATUS_LABELS ? t(STATUS_LABELS[status as keyof typeof STATUS_LABELS]) : status;
const range = (r: Pick<TimeOffRequest, "startDate" | "endDate">, formatDisplayDate: DateFormatter) =>
  r.startDate === r.endDate
    ? formatDisplayDate(r.startDate)
    : `${formatDisplayDate(r.startDate)} – ${formatDisplayDate(r.endDate)}`;

/**
 * One request and what its decision needs (WALK_QUESTIONS § 7) — where the approval notification
 * leads. The approver it waits on may read this without any role over the requester; the backend
 * derives that from the request and drops it once they have answered.
 */
export const TimeOffDecisionContainer: React.FC<{
  requestId: string;
  /** Opened from Home's Decline (`?decline=1`): the reason field is open and focused at once. */
  startDeclining?: boolean;
}> = ({ requestId, startDeclining = false }) => {
  const t = useTranslations("timeOff");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const days = (n: number) => t("amount.days", dayAmountArgs(n));
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
  const [rejecting, setRejecting] = useState(startDeclining);
  const [reason, setReason] = useState("");
  const [rejectTried, setRejectTried] = useState(false);
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
        <p className="text-body text-tertiary">{statusLabel(t, request.status)}</p>
        <h1 className="text-page-title text-primary">
          <Link href={`/organization/people/${request.userId}`} className="text-accent-text underline-offset-4 hover:underline">
            {requesterName ?? t("decision.anEmployee")}
          </Link>
        </h1>
        <p className="mt-1 text-body text-secondary">
          {range(request, formatDisplayDate)} · {days(request.requestedAmount)}
        </p>
        {request.reason && <p className="mt-2 text-body text-secondary">“{request.reason}”</p>}
        {awaitingYou && answeringAs === "DELEGATE" && answeringOnBehalfOfName && (
          <p className="mt-2 text-body text-tertiary">
            {t("decision.answeringForDelegator", { name: answeringOnBehalfOfName })}
          </p>
        )}
        {awaitingYou && answeringAs === "FALLBACK" && (
          <p className="mt-2 text-body text-tertiary">
            {t("decision.reachedAsFallback")}
          </p>
        )}
        {request.decidedAnyway && (
          <p className="mt-2 text-body text-tertiary">{t("decision.decidedAnyway")}</p>
        )}
      </div>

      {steps.length > 0 && <ApprovalSteps steps={steps} t={t} />}

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">{t("decision.balance.title")}</p>
        {balance ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-body sm:grid-cols-3">
            <dt className="text-tertiary">{t("decision.balance.available")}</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.currentBalance)}</dd>
            <dt className="text-tertiary">{t("decision.balance.reserved")}</dt>
            <dd className="sm:col-span-2 tabular-nums">{days(balance.pendingBalance)}</dd>
            <dt className="text-tertiary">{t("decision.balance.period")}</dt>
            <dd className="sm:col-span-2">
              {balance.periodEnd
                ? t("decision.balance.periodRange", {
                    start: formatDisplayDate(balance.periodStart),
                    end: formatDisplayDate(balance.periodEnd),
                  })
                : t("decision.balance.periodOpen", { start: formatDisplayDate(balance.periodStart) })}
            </dd>
          </dl>
        ) : (
          <p className="mt-1 text-body text-tertiary">{t("decision.balance.none")}</p>
        )}
      </section>

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">{t("decision.otherLeave.title")}</p>
        {otherLeave.length === 0 ? (
          <p className="mt-1 text-body text-tertiary">{t("decision.otherLeave.none")}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-body">
            {otherLeave.map((r) => (
              <li key={r.id}>
                {range(r, formatDisplayDate)} · {days(r.requestedAmount)} ·{" "}
                <span className="text-tertiary">{statusLabel(t, r.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-card border border-divider p-4">
        <p className="text-body font-medium text-primary">{t("decision.peersAway.title")}</p>
        {peersAway.length === 0 ? (
          <p className="mt-1 text-body text-tertiary">{t("decision.peersAway.none")}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-body">
            {peersAway.map((p) => (
              <li key={`${p.userId}-${p.startDate}`}>
                {p.firstName} {p.lastName} · {range(p, formatDisplayDate)}
                {p.status === "PENDING" && <span className="text-tertiary"> · {t("decision.peersAway.notYetApproved")}</span>}
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
              <Button type="button" variant="approve" disabled={busy} onClick={() => void run(() => decideCancellation.mutateAsync({
                requestId, userId: request.userId, decision: "CONFIRM" }))}>
                {t("decision.approveCancellation")}
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void run(() => decideCancellation.mutateAsync({
                requestId, userId: request.userId, decision: "DECLINE" }))}>
                <Icon icon={Cancel01Icon} size="sm" />
                {t("decision.decline")}
              </Button>
            </div>
          ) : rejecting ? (
            <div className="flex max-w-md flex-col gap-1.5">
              <RequiredLabel htmlFor={reasonId} required>{t("decision.reason")}</RequiredLabel>
              <Input id={reasonId} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
              <FieldError>{rejectTried && !reason.trim() ? tCommon("validation.required") : null}</FieldError>
              <div className="mt-1 flex gap-2">
                <Button type="button" variant="destructive" disabled={busy}
                        onClick={() => {
                          setRejectTried(true);
                          if (!reason.trim()) return;
                          void run(() => reject.mutateAsync({ requestId, rejectionReason: reason.trim() }));
                        }}>
                  {t("decision.reject")}
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => setRejecting(false)}>{tCommon("actions.back")}</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button type="button" variant="approve" disabled={busy} onClick={() => void run(() => approve.mutateAsync({ requestId }))}>
                {t("decision.approve")}
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => { setRejectTried(false); setRejecting(true); }}>
                <Icon icon={Cancel01Icon} size="sm" />
                {t("decision.reject")}
              </Button>
            </div>
          )}
        </div>
      )}

      {canDecideAnyway && (
        <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-4">
          <p className="mr-2 text-body text-tertiary">
            {awaitingYou ? t("decision.orDecideOverChain") : t("decision.mayDecideOverChain")}
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
export const approvalStepLine = (
  step: TimeOffApprovalStepDTO,
  t: TimeOffT,
): { asked: string; answered: string | null } => {
  const askedName =
    step.askedReason === "FALLBACK"
      ? step.askedRoleName
        ? step.askedUserName
          ? t("decision.steps.fallbackRoleFor", { role: step.askedRoleName, name: step.askedUserName })
          : t("decision.steps.fallbackRole", { role: step.askedRoleName })
        : t("decision.steps.noFallback")
      : step.askedUserName ??
        (step.approverType === "MANAGER" ? t("decision.steps.managerSeatEmpty") : t("decision.steps.nobody"));
  const asked = step.reassignedToName
    ? t("decision.steps.reassigned", { asked: askedName, name: step.reassignedToName })
    : askedName;
  if (!step.signed) return { asked, answered: null };
  const by = step.decidedByName ?? t("decision.steps.deletedPerson");
  const answered =
    step.via === "DELEGATE" && step.onBehalfOfName
      ? t("decision.steps.onBehalfOf", { by, name: step.onBehalfOfName })
      : step.via === "FALLBACK"
        ? t("decision.steps.asFallback", { by })
        : step.via === "OVERRIDE"
          ? t("decision.steps.approvingAnyway", { by })
          : by;
  return { asked, answered };
};

const ApprovalSteps: React.FC<{ steps: TimeOffApprovalStepDTO[]; t: TimeOffT }> = ({ steps, t }) => (
  <section className="rounded-card border border-divider p-4">
    <p className="text-body font-medium text-primary">{t("decision.steps.title")}</p>
    <ol className="mt-2 space-y-1.5 text-body">
      {steps.map((step) => {
        const line = approvalStepLine(step, t);
        return (
          <li key={step.approvalOrder} className="flex gap-2">
            <span className="text-tertiary tabular-nums">{step.approvalOrder}.</span>
            <span>
              <span className="text-tertiary">{t("decision.steps.asked")}</span> {line.asked}
              {line.answered ? (
                <>
                  {" · "}
                  <span className="text-tertiary">{t("decision.steps.answeredBy")}</span> {line.answered}
                </>
              ) : (
                <span className="text-tertiary"> · {t("decision.steps.notAnswered")}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  </section>
);
