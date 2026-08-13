"use client";

import { FC, useMemo } from "react";
import { CalendarX2 } from "lucide-react";

import { useTimeOffRequestsByUser } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useTimeOffRequestsByUser";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { useTimeOffPolicies } from "@/components/modules/settings/modules/time/timeOff/timeOffPolicies/hooks/useTimeOffPolicies";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { Button } from "@/public/desact/src/components/ui/button";
import { cn } from "@/public/desact/src/components/ui/utils";
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
    <div className="divide-y divide-brown-100 rounded-lg border border-brown-200">
      {rows.map((request) => (
        <div key={request.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-brown-900">{policyName(request.policyId)}</p>
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
      ))}
    </div>
  );
};

export default UserTimeOffRequests;
