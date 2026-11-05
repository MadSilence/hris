"use client";

import { Skeleton } from "@/components/desact/skeleton";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { useDateFormatter } from "@/lib/date";
import { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarRemove01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useEditTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useEditTimeOffRequest";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/desact/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";

import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import type { TimeOffRequest } from "@/models/timeOff";
import { DecideAnywayControls } from "@/components/modules/timeOffDecision";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/feedback/FormError";

type Props = { userId: string };

/** Time off's lifecycle (SPEC § 4.5): Pending → Approved | Declined; cancelled is kept for history. */
const STATUS_TONE: Record<TimeOffRequestStatus, StatusTone> = {
  [TimeOffRequestStatus.Pending]: "pending",
  [TimeOffRequestStatus.Approved]: "approved",
  [TimeOffRequestStatus.CancellationPending]: "pending",
  [TimeOffRequestStatus.Rejected]: "declined",
  [TimeOffRequestStatus.Cancelled]: "archived",
};

const STATUS_LABEL = {
  [TimeOffRequestStatus.Pending]: "requests.status.pending",
  [TimeOffRequestStatus.Approved]: "requests.status.approved",
  [TimeOffRequestStatus.CancellationPending]: "requests.status.cancellationPending",
  [TimeOffRequestStatus.Rejected]: "requests.status.rejected",
  [TimeOffRequestStatus.Cancelled]: "requests.status.cancelled",
} as const satisfies Record<TimeOffRequestStatus, string>;

const canCancel = (status: TimeOffRequestStatus) =>
  status === TimeOffRequestStatus.Pending || status === TimeOffRequestStatus.Approved;

/**
 * Cancelling your own request before anyone has agreed to it needs no justification; asking to undo
 * an agreement does. Same reasoning the Reject button already follows, applied to the half of the
 * flow that was sending `cancellationReason: null` unconditionally with no input on screen.
 */
const needsCancellationReason = (status: TimeOffRequestStatus, isOwnRequest: boolean) =>
  isOwnRequest && status === TimeOffRequestStatus.Approved;

/**
 * Cancelling something already approved is asking to undo an agreement, so the approver answers it —
 * unless the policy says otherwise, which only the server knows. Saying so on the button is the
 * difference between "it did nothing" and "somebody has to look at it".
 */
const cancelLabel = (status: TimeOffRequestStatus, isOwnRequest: boolean) =>
  isOwnRequest && status === TimeOffRequestStatus.Approved ? "requests.requestCancellation" : "requests.cancel";

/** The current year and the four around it — enough for the history anybody actually looks at. */
const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return [current + 1, current, current - 1, current - 2, current - 3];
})();

// Newest first, by start date.
const byStartDesc = (a: TimeOffRequest, b: TimeOffRequest) => b.startDate.localeCompare(a.startDate);

export const UserTimeOffRequests: FC<Props> = ({ userId }) => {
  const formatDisplayDate = useDateFormatter();
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  // Filtered on the server: the list is unbounded, and the reason to filter it is that it is long.
  // The endpoint took no parameters at all and the screen had no controls.
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: requests, isLoading } = useTimeOffRequestsByUser({
    userId,
    year: yearFilter === "ALL" ? null : Number(yearFilter),
    status: statusFilter === "ALL" ? null : statusFilter,
  });
  const { data: policies } = useTimeOffPolicies();
  const cancelMutation = useCancelTimeOffRequest();
  const approveMutation = useApproveTimeOffRequest();
  const rejectMutation = useRejectTimeOffRequest();
  const cancellationMutation = useDecideCancellation();
  const editMutation = useEditTimeOffRequest();

  // Deciding on a request is a manager action on someone else — never on your own request, and the
  // backend re-checks the approver against the policy's approval settings anyway.
  const { userId: currentUserId } = useCurrentUser();
  const canDecide = useCanAccess("PEOPLE.TIME_OFF", "EDIT") && currentUserId !== userId;
  // Deciding over the chain (Approve Anyway) is PEOPLE.TIME_OFF MANAGE on the person — UX only; the
  // backend checks it against this requester and journals it as an override.
  const canDecideAnyway = useCanAccess("PEOPLE.TIME_OFF", "MANAGE") && currentUserId !== userId;

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const policyName = useMemo(() => {
    const map = new Map((policies ?? []).map((p) => [p.id, p.name]));
    const fallback = t("balances.fallbackName");
    return (id: string) => map.get(id) ?? fallback;
  }, [policies, t]);

  const rows = useMemo(() => [...(requests ?? [])].sort(byStartDesc), [requests]);

  // Was fire-and-forget: `mutate` with no `onError`, so a refused cancellation looked exactly like
  // a successful one. Its two neighbours in this file already do it this way.
  const submitCancel = async (request: TimeOffRequest, reason: string | null) => {
    setError(null);
    try {
      await cancelMutation.mutateAsync({
        requestId: request.id,
        userId,
        cancellationReason: reason,
      });
      setCancellingId(null);
      setCancelReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requests.errors.cancel"));
    }
  };

  const handleCancel = (request: TimeOffRequest) => {
    if (needsCancellationReason(request.status, !canDecide)) {
      setCancellingId(request.id);
      setCancelReason("");
      return;
    }
    void submitCancel(request, null);
  };

  // Whether an edit is allowed at all is the policy's edit_rules, and only the server holds those —
  // so the affordance is offered on any live request and the refusal, when it comes, names the rule.
  const startEditing = (request: TimeOffRequest) => {
    setEditingId(request.id);
    setEditStart(request.startDate);
    setEditEnd(request.endDate);
    setError(null);
  };

  const submitEdit = async (request: TimeOffRequest) => {
    setError(null);
    try {
      await editMutation.mutateAsync({
        requestId: request.id,
        userId,
        startDate: editStart,
        endDate: editEnd,
        reason: null,
      });
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requests.errors.edit"));
    }
  };

  const handleCancellationDecision = async (
    request: TimeOffRequest,
    decision: "CONFIRM" | "DECLINE",
  ) => {
    setError(null);
    try {
      await cancellationMutation.mutateAsync({ requestId: request.id, userId, decision });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("requests.errors.answerCancellation"),
      );
    }
  };

  const handleApprove = async (request: TimeOffRequest) => {
    setError(null);
    try {
      await approveMutation.mutateAsync({ requestId: request.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requests.errors.approve"));
    }
  };

  const handleReject = async (request: TimeOffRequest) => {
    // The API takes the reason as a required string — a rejection without one tells the person
    // nothing, so the button stays disabled until it is filled in.
    const reason = rejectReason.trim();
    if (!reason) return;

    setError(null);
    try {
      await rejectMutation.mutateAsync({ requestId: request.id, rejectionReason: reason });
      setRejectingId(null);
      setRejectReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requests.errors.reject"));
    }
  };

  const isDeciding =
    approveMutation.isPending || rejectMutation.isPending || cancellationMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-control" />
        ))}
      </div>
    );
  }

  /*
   * The empty state used to `return` from here, above the filter row — so filtering to a year with
   * no requests removed the filters along with the list, and the only way back was to close the
   * sheet. Nothing is filtered out of the controls that do the filtering.
   */
  const filtered = yearFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("requests.anyYear")}</SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("requests.anyStatus")}</SelectItem>
            {Object.values(TimeOffRequestStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {t(STATUS_LABEL[s])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <FormError message={error} />}

      {rows.length === 0 ? (
        <div className="flex items-center gap-3 rounded-card border border-dashed border-divider px-4 py-6 text-body text-tertiary">
          <Icon icon={CalendarRemove01Icon} className="text-tertiary" />
          {filtered
            ? t("requests.emptyFiltered")
            : t("requests.empty")}
        </div>
      ) : (
      <div className="divide-y divide-divider rounded-control border border-divider">
        {rows.map((request) => {
          const isPending = request.status === TimeOffRequestStatus.Pending;
          const isRejecting = rejectingId === request.id;
          const isCancelling = cancellingId === request.id;
          const isEditing = editingId === request.id;
          const isLive =
            request.status === TimeOffRequestStatus.Pending ||
            request.status === TimeOffRequestStatus.Approved;
          const awaitsCancellationAnswer =
            request.status === TimeOffRequestStatus.CancellationPending;

          return (
            <div key={request.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body font-medium text-primary">
                      {policyName(request.policyId)}
                    </p>
                    <StatusBadge status={STATUS_TONE[request.status]} label={t(STATUS_LABEL[request.status])} size="sm" />
                  </div>
                  <p className="mt-0.5 text-hint text-tertiary">
                    {t("requests.line", {
                      start: formatDisplayDate(request.startDate),
                      end: formatDisplayDate(request.endDate),
                      amount: formatDayAmount(request.requestedAmount),
                      unit: t("units.daysShort"),
                    })}
                    {request.reason ? <span> · {request.reason}</span> : null}
                  </p>

                  {/* The reason travelled from the backend all along and nothing rendered it, so a
                      rejection read as a bare red badge and the requester had to go and ask. */}
                  {request.status === TimeOffRequestStatus.Rejected && request.rejectionReason && (
                    <p className="mt-1 text-hint text-status-declined-text">
                      {t.rich("requests.rejectionReason", {
                        reason: request.rejectionReason,
                        b: (chunks) => <span className="font-medium">{chunks}</span>,
                      })}
                    </p>
                  )}

                  {request.status === TimeOffRequestStatus.CancellationPending && (
                    <p className="mt-1 text-hint text-status-pending-text">
                      {t("requests.awaitingCancellation")}
                      {request.cancellationReason ? ` · ${request.cancellationReason}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-none items-center gap-1">
                  {canDecide && isPending && !isRejecting && (
                    <>
                      <Button type="button"
                        variant="approve"
                        size="sm"
                        onClick={() => handleApprove(request)}
                        disabled={isDeciding}
                      >
                        {t("requests.approve")}
                      </Button>
                      <Button type="button"
                        variant="ghost"
                        size="sm"
                        className="text-tertiary hover:text-danger-text"
                        onClick={() => {
                          setRejectingId(request.id);
                          setRejectReason("");
                        }}
                        disabled={isDeciding}
                      >
                        {t("requests.reject")}
                      </Button>
                    </>
                  )}

                  {canDecideAnyway && isPending && !isRejecting && (
                    <DecideAnywayControls requestId={request.id} />
                  )}

                  {/* The dead end: the request reached CANCELLATION_PENDING and nothing in the
                      product could move it out. These are the two answers. */}
                  {canDecide && awaitsCancellationAnswer && (
                    <>
                      <Button type="button"
                        variant="ghost"
                        size="sm"
                        className="text-status-approved-text hover:text-status-approved-text"
                        onClick={() => handleCancellationDecision(request, "CONFIRM")}
                        disabled={isDeciding}
                      >
                        {t("requests.confirmCancellation")}
                      </Button>
                      <Button type="button"
                        variant="ghost"
                        size="sm"
                        className="text-tertiary hover:text-danger-text"
                        onClick={() => handleCancellationDecision(request, "DECLINE")}
                        disabled={isDeciding}
                      >
                        {t("requests.keepAbsence")}
                      </Button>
                    </>
                  )}

                  {isLive && !isEditing && !isCancelling && (
                    <Button type="button"
                      variant="ghost"
                      size="sm"
                      className="text-tertiary hover:text-primary"
                      onClick={() => startEditing(request)}
                      disabled={editMutation.isPending}
                    >
                      {t("requests.editDates")}
                    </Button>
                  )}

                  {canCancel(request.status) && !isCancelling && !isEditing && (
                    <Button type="button"
                      variant="ghost"
                      size="sm"
                      className="text-tertiary hover:text-danger-text"
                      onClick={() => handleCancel(request)}
                      disabled={cancelMutation.isPending}
                    >
                      {t(cancelLabel(request.status, !canDecide))}
                    </Button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <DatePicker
                    value={editStart}
                    onChange={setEditStart}
                    disabled={editMutation.isPending}
                  />
                  <span className="text-hint text-tertiary">{t("requests.to")}</span>
                  <DatePicker
                    value={editEnd}
                    onChange={setEditEnd}
                    disabled={editMutation.isPending}
                  />
                  <Button type="button"
                    size="sm"
                    onClick={() => submitEdit(request)}
                    disabled={editMutation.isPending || !editStart || !editEnd}
                  >
                    {tCommon("actions.save")}
                  </Button>
                  <Button type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    disabled={editMutation.isPending}
                  >
                    {tCommon("actions.cancel")}
                  </Button>
                </div>
              )}

              {isCancelling && (
                <div className="mt-3 flex flex-col gap-1.5">
                  <RequiredLabel htmlFor={`cancel-reason-${request.id}`} required>{t("requests.reason")}</RequiredLabel>
                  <div className="flex items-center gap-2">
                  <Input
                    id={`cancel-reason-${request.id}`}
                    autoFocus
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.currentTarget.value)}
                    disabled={cancelMutation.isPending}
                  />
                  <Button type="button"
                    size="sm"
                    onClick={() => submitCancel(request, cancelReason.trim())}
                    disabled={cancelMutation.isPending || !cancelReason.trim()}
                  >
                    {t("requests.requestCancellation")}
                  </Button>
                  <Button type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCancellingId(null)}
                    disabled={cancelMutation.isPending}
                  >
                    {tCommon("actions.back")}
                  </Button>
                  </div>
                </div>
              )}

              {isRejecting && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {/* Confirm stays disabled until this is filled: say so, rather than leaving an
                      unexplained box beside a dead button. */}
                  <RequiredLabel htmlFor={`reject-reason-${request.id}`} required>{t("requests.reason")}</RequiredLabel>
                  <div className="flex items-center gap-2">
                  <Input
                    id={`reject-reason-${request.id}`}
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.currentTarget.value)}
                    disabled={isDeciding}
                  />
                  <Button type="button"
                    size="sm"
                    onClick={() => handleReject(request)}
                    disabled={isDeciding || !rejectReason.trim()}
                  >
                    {tCommon("actions.confirm")}
                  </Button>
                  <Button type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setRejectingId(null)}
                    disabled={isDeciding}
                  >
                    {tCommon("actions.cancel")}
                  </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default UserTimeOffRequests;
