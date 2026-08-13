"use client";

import { FC, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { Notification } from "@/models/notifications";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "text-green-700",
  REJECTED: "text-red-600",
  CANCELLED: "text-brown-500",
};

const STATUS_LABEL: Record<string, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

/**
 * Renders the type-specific action controls for an actionable notification, gated by the live source
 * status (§5). This is the single place the (generic) inbox couples to a domain (time-off approve/
 * reject); new actionable types add a branch here. When the source is no longer open, the resolved
 * outcome is shown instead of buttons.
 */
export const NotificationActions: FC<{ notification: Notification }> = ({ notification }) => {
  const invalidateNotifications = useInvalidateNotifications();
  const approve = useApproveTimeOffRequest();
  const reject = useRejectTimeOffRequest();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const source = notification.source;
  if (notification.type !== "TIMEOFF_APPROVAL_REQUESTED" || !source) {
    return null;
  }

  // Resolved (no longer open) → show the outcome, not the controls.
  if (!source.open) {
    const status = source.status ?? "";
    const label = STATUS_LABEL[status];
    if (!label) return null;
    return (
      <p className={cn("mt-2 text-xs font-medium", STATUS_STYLE[status] ?? "text-muted-foreground")}>
        {label}
      </p>
    );
  }

  const busy = approve.isPending || reject.isPending;

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ requestId: source.id });
      invalidateNotifications();
    } catch {
      // hook surfaces the error; keep the item as-is
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    try {
      await reject.mutateAsync({ requestId: source.id, rejectionReason: reason.trim() });
      invalidateNotifications();
      setRejecting(false);
      setReason("");
    } catch {
      // hook surfaces the error
    }
  };

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      {rejecting ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            placeholder="Reason for rejection"
            className="h-8 flex-1"
            disabled={busy}
          />
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={busy || !reason.trim()}>
            Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRejecting(false)} disabled={busy}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApprove} disabled={busy}>
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejecting(true)} disabled={busy}>
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationActions;
