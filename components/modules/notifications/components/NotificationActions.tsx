"use client";

import { FC, useId, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { cn } from "@/public/desact/src/components/ui/utils";
import type { Notification } from "@/models/notifications";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "@/components/modules/notifications/hooks/useNotificationMutations";
import { showError } from "@/lib/errors/errorToast";
import { PublicHolidayDriftActions } from "@/components/modules/notifications/components/PublicHolidayDriftActions";

type Outcome = { label: string; className: string };

const GREEN = "text-success-700";
const RED = "text-danger-600";
const MUTED = "text-brown-500";

/**
 * What a closed question reads as, per question. The same request status means different things to the
 * two: a request back in `APPROVED` after a cancellation was asked is, to the cancellation question,
 * "declined".
 */
const APPROVAL_OUTCOMES: Record<string, Outcome> = {
  APPROVED: { label: "Approved", className: GREEN },
  // This approver has signed; the request still waits for the rest of its chain. The backend answers
  // it per recipient, so the next approver's copy of the same request still offers the buttons.
  APPROVED_BY_YOU: { label: "You approved · waiting for the rest of the chain", className: GREEN },
  CANCELLATION_PENDING: { label: "Approved", className: GREEN },
  REJECTED: { label: "Rejected", className: RED },
  CANCELLED: { label: "Cancelled", className: MUTED },
};

const CANCELLATION_OUTCOMES: Record<string, Outcome> = {
  CANCELLED: { label: "Cancellation approved", className: GREEN },
  APPROVED: { label: "Cancellation declined", className: RED },
};

const ACTIONABLE_TYPES = new Set(["TIMEOFF_APPROVAL_REQUESTED", "TIMEOFF_CANCELLATION_REQUESTED"]);
const PUBLIC_HOLIDAY_DRIFT_TYPE = "PUBLIC_HOLIDAY_CALENDAR_SOURCE_DRIFT";

/**
 * Renders the type-specific action controls for an actionable notification, gated by the live source
 * status (§5). This is the single place the (generic) inbox couples to a domain (time-off approve/
 * reject, the answer to a cancellation, and a holiday source drift to apply or dismiss); new actionable
 * types add a branch here. When the source is
 * no longer open, the resolved outcome is shown instead of buttons.
 *
 * Answering from the inbox also marks the notification read: the question has been dealt with, and
 * leaving it bold made the inbox claim there was still something to do.
 */
export const NotificationActions: FC<{ notification: Notification }> = ({ notification }) => {
  const invalidateNotifications = useInvalidateNotifications();
  const markRead = useMarkNotificationRead();
  const approve = useApproveTimeOffRequest();
  const reject = useRejectTimeOffRequest();
  const decideCancellation = useDecideCancellation();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();

  // A holiday drift asks a different question of a different domain; it has its own controls.
  if (notification.type === PUBLIC_HOLIDAY_DRIFT_TYPE) {
    return <PublicHolidayDriftActions notification={notification} />;
  }

  const source = notification.source;
  if (!ACTIONABLE_TYPES.has(notification.type) || !source) {
    return null;
  }

  const isCancellation = notification.type === "TIMEOFF_CANCELLATION_REQUESTED";

  // Resolved (no longer open) → show the outcome, not the controls.
  if (!source.open) {
    const outcome = (isCancellation ? CANCELLATION_OUTCOMES : APPROVAL_OUTCOMES)[source.status ?? ""];
    if (!outcome) return null;
    return <p className={cn("mt-2 text-xs font-medium", outcome.className)}>{outcome.label}</p>;
  }

  const busy = approve.isPending || reject.isPending || decideCancellation.isPending;

  const answered = () => {
    invalidateNotifications();
    if (!notification.read) markRead.mutate(notification.id);
  };

  const run = async (act: () => Promise<unknown>) => {
    try {
      await act();
      answered();
      return true;
    } catch (error) {
      showError(error);
      // A refusal here nearly always means the question moved on without this copy — somebody else
      // decided first. Re-reading the inbox replaces the stale buttons with what actually happened,
      // instead of leaving Approve on screen to be refused again.
      invalidateNotifications();
      return false;
    }
  };

  if (isCancellation) {
    const userId = String(notification.params?.requesterId ?? "");
    return (
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          disabled={busy}
          onClick={() => run(() => decideCancellation.mutateAsync({ requestId: source.id, userId, decision: "CONFIRM" }))}
        >
          <Check className="h-4 w-4" />
          Approve Cancellation
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => decideCancellation.mutateAsync({ requestId: source.id, userId, decision: "DECLINE" }))}
        >
          <X className="h-4 w-4" />
          Decline
        </Button>
      </div>
    );
  }

  const handleReject = async () => {
    if (!reason.trim()) return;
    const ok = await run(() => reject.mutateAsync({ requestId: source.id, rejectionReason: reason.trim() }));
    if (ok) {
      setRejecting(false);
      setReason("");
    }
  };

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      {rejecting ? (
        <div className="flex flex-col gap-1.5">
          {/* The button is disabled until this is filled, so the field has to say it is required —
              without a label it was an unexplained empty box beside a dead button. */}
          <RequiredLabel htmlFor={reasonId} required>Reason</RequiredLabel>
          <div className="flex items-center gap-2">
            <Input
              id={reasonId}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
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
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => run(() => approve.mutateAsync({ requestId: source.id }))} disabled={busy}>
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
