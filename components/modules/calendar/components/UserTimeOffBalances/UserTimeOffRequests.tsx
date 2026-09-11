"use client";

import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { formatDayAmount } from "@/models/timeOff/formatDayAmount";
import { FC, useMemo, useState } from "react";
import { CalendarX2 } from "lucide-react";

import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useEditTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useEditTimeOffRequest";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/public/desact/src/components/ui/select";
import { DatePicker } from "@/components/ui/DatePicker";
import { cn } from "@/public/desact/src/components/ui/utils";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import type { TimeOffRequest } from "@/models/timeOff";

type Props = { userId: string };


const STATUS_STYLE: Record<TimeOffRequestStatus, string> = {
  [TimeOffRequestStatus.Pending]: "border-amber-200 bg-amber-50 text-amber-700",
  [TimeOffRequestStatus.Approved]: "border-green-200 bg-green-50 text-green-700",
  [TimeOffRequestStatus.CancellationPending]: "border-amber-200 bg-amber-50 text-amber-700",
  [TimeOffRequestStatus.Rejected]: "border-red-200 bg-red-50 text-red-700",
  [TimeOffRequestStatus.Cancelled]: "border-brown-200 bg-brown-50 text-brown-500",
};

const STATUS_LABEL: Record<TimeOffRequestStatus, string> = {
  [TimeOffRequestStatus.Pending]: "Pending",
  [TimeOffRequestStatus.Approved]: "Approved",
  [TimeOffRequestStatus.CancellationPending]: "Cancellation requested",
  [TimeOffRequestStatus.Rejected]: "Rejected",
  [TimeOffRequestStatus.Cancelled]: "Cancelled",
};

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
  isOwnRequest && status === TimeOffRequestStatus.Approved ? "Request cancellation" : "Cancel";

/** The current year and the four around it — enough for the history anybody actually looks at. */
const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return [current + 1, current, current - 1, current - 2, current - 3];
})();

// Newest first, by start date.
const byStartDesc = (a: TimeOffRequest, b: TimeOffRequest) => b.startDate.localeCompare(a.startDate);

export const UserTimeOffRequests: FC<Props> = ({ userId }) => {
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

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  const policyName = useMemo(() => {
    const map = new Map((policies ?? []).map((p) => [p.id, p.displayName]));
    return (id: string) => map.get(id) ?? "Time off";
  }, [policies]);

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
      setError(e instanceof Error ? e.message : "Failed to cancel the request.");
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
      setError(e instanceof Error ? e.message : "Failed to edit the request.");
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
          : "Failed to answer the cancellation request.",
      );
    }
  };

  const handleApprove = async (request: TimeOffRequest) => {
    setError(null);
    try {
      await approveMutation.mutateAsync({ requestId: request.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve the request.");
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
      setError(e instanceof Error ? e.message : "Failed to reject the request.");
    }
  };

  const isDeciding =
    approveMutation.isPending || rejectMutation.isPending || cancellationMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-brown-200 px-4 py-6 text-sm text-muted-foreground">
        <CalendarX2 className="h-5 w-5 text-brown-400" />
        No time off requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any year</SelectItem>
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
            <SelectItem value="ALL">Any status</SelectItem>
            {Object.values(TimeOffRequestStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="divide-y divide-brown-100 rounded-lg border border-brown-200">
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
                    <p className="truncate text-sm font-medium text-brown-900">
                      {policyName(request.policyId)}
                    </p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none",
                        STATUS_STYLE[request.status],
                      )}
                    >
                      {STATUS_LABEL[request.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {request.startDate} → {request.endDate} · {formatDayAmount(request.requestedAmount)} d
                    {request.reason ? <span> · {request.reason}</span> : null}
                  </p>

                  {/* The reason travelled from the backend all along and nothing rendered it, so a
                      rejection read as a bare red badge and the requester had to go and ask. */}
                  {request.status === TimeOffRequestStatus.Rejected && request.rejectionReason && (
                    <p className="mt-1 text-xs text-red-700">
                      <span className="font-medium">Reason:</span> {request.rejectionReason}
                    </p>
                  )}

                  {request.status === TimeOffRequestStatus.CancellationPending && (
                    <p className="mt-1 text-xs text-amber-700">
                      Waiting for the approver to confirm the cancellation
                      {request.cancellationReason ? ` · ${request.cancellationReason}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex flex-none items-center gap-1">
                  {canDecide && isPending && !isRejecting && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-700 hover:text-green-800"
                        onClick={() => handleApprove(request)}
                        disabled={isDeciding}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setRejectingId(request.id);
                          setRejectReason("");
                        }}
                        disabled={isDeciding}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {/* The dead end: the request reached CANCELLATION_PENDING and nothing in the
                      product could move it out. These are the two answers. */}
                  {canDecide && awaitsCancellationAnswer && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-700 hover:text-green-800"
                        onClick={() => handleCancellationDecision(request, "CONFIRM")}
                        disabled={isDeciding}
                      >
                        Confirm cancellation
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleCancellationDecision(request, "DECLINE")}
                        disabled={isDeciding}
                      >
                        Keep the absence
                      </Button>
                    </>
                  )}

                  {isLive && !isEditing && !isCancelling && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-brown-900"
                      onClick={() => startEditing(request)}
                      disabled={editMutation.isPending}
                    >
                      Edit dates
                    </Button>
                  )}

                  {canCancel(request.status) && !isCancelling && !isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleCancel(request)}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelLabel(request.status, !canDecide)}
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
                  <span className="text-xs text-muted-foreground">to</span>
                  <DatePicker
                    value={editEnd}
                    onChange={setEditEnd}
                    disabled={editMutation.isPending}
                  />
                  <Button
                    size="sm"
                    onClick={() => submitEdit(request)}
                    disabled={editMutation.isPending || !editStart || !editEnd}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    disabled={editMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {isCancelling && (
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    autoFocus
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.currentTarget.value)}
                    disabled={cancelMutation.isPending}
                  />
                  <Button
                    size="sm"
                    onClick={() => submitCancel(request, cancelReason.trim())}
                    disabled={cancelMutation.isPending || !cancelReason.trim()}
                  >
                    Request cancellation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancellingId(null)}
                    disabled={cancelMutation.isPending}
                  >
                    Back
                  </Button>
                </div>
              )}

              {isRejecting && (
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.currentTarget.value)}
                    disabled={isDeciding}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleReject(request)}
                    disabled={isDeciding || !rejectReason.trim()}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectingId(null)}
                    disabled={isDeciding}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserTimeOffRequests;
