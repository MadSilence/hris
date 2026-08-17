"use client";

import { FC, useMemo, useState } from "react";
import { CalendarX2 } from "lucide-react";

import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { cn } from "@/public/desact/src/components/ui/utils";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import type { TimeOffRequest } from "@/models/timeOff";

type Props = { userId: string };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

const STATUS_STYLE: Record<TimeOffRequestStatus, string> = {
  [TimeOffRequestStatus.Pending]: "border-amber-200 bg-amber-50 text-amber-700",
  [TimeOffRequestStatus.Approved]: "border-green-200 bg-green-50 text-green-700",
  [TimeOffRequestStatus.Rejected]: "border-red-200 bg-red-50 text-red-700",
  [TimeOffRequestStatus.Cancelled]: "border-brown-200 bg-brown-50 text-brown-500",
};

const STATUS_LABEL: Record<TimeOffRequestStatus, string> = {
  [TimeOffRequestStatus.Pending]: "Pending",
  [TimeOffRequestStatus.Approved]: "Approved",
  [TimeOffRequestStatus.Rejected]: "Rejected",
  [TimeOffRequestStatus.Cancelled]: "Cancelled",
};

const canCancel = (status: TimeOffRequestStatus) =>
  status === TimeOffRequestStatus.Pending || status === TimeOffRequestStatus.Approved;

// Newest first, by start date.
const byStartDesc = (a: TimeOffRequest, b: TimeOffRequest) => b.startDate.localeCompare(a.startDate);

export const UserTimeOffRequests: FC<Props> = ({ userId }) => {
  const { data: requests, isLoading } = useTimeOffRequestsByUser({ userId });
  const { data: policies } = useTimeOffPolicies();
  const cancelMutation = useCancelTimeOffRequest();
  const approveMutation = useApproveTimeOffRequest();
  const rejectMutation = useRejectTimeOffRequest();

  // Deciding on a request is a manager action on someone else — never on your own request, and the
  // backend re-checks the approver against the policy's approval settings anyway.
  const { userId: currentUserId } = useCurrentUser();
  const canDecide = useCanAccess("PEOPLE.TIME_OFF", "EDIT") && currentUserId !== userId;

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const policyName = useMemo(() => {
    const map = new Map((policies ?? []).map((p) => [p.id, p.displayName]));
    return (id: string) => map.get(id) ?? "Time off";
  }, [policies]);

  const rows = useMemo(() => [...(requests ?? [])].sort(byStartDesc), [requests]);

  const handleCancel = (request: TimeOffRequest) => {
    cancelMutation.mutate({
      requestId: request.id,
      userId,
      cancellationReason: null,
    });
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

  const isDeciding = approveMutation.isPending || rejectMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg border border-brown-200 bg-brown-50" />
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
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="divide-y divide-brown-100 rounded-lg border border-brown-200">
        {rows.map((request) => {
          const isPending = request.status === TimeOffRequestStatus.Pending;
          const isRejecting = rejectingId === request.id;

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
                    {request.startDate} → {request.endDate} · {fmt(request.requestedAmount)} d
                    {request.reason ? <span> · {request.reason}</span> : null}
                  </p>
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

                  {canCancel(request.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleCancel(request)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {isRejecting && (
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.currentTarget.value)}
                    placeholder="Reason for rejection"
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
