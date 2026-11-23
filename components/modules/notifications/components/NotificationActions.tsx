"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

import { Button } from "@/components/desact/button";
import { cn } from "@/lib/cn";
import type { Notification } from "@/models/notifications";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useDecideCancellation } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useDecideCancellation";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";
import { useMarkNotificationRead } from "@/components/modules/notifications/hooks/useNotificationMutations";
import { showError } from "@/lib/errors/errorToast";
import { PublicHolidayDriftActions } from "@/components/modules/notifications/components/PublicHolidayDriftActions";
import { TASK_SOURCE_TYPES, TaskSourceActions } from "@/components/modules/notifications/components/TaskSourceActions";
import { DeclineLeaveDialog } from "@/components/modules/timeOff/DeclineLeaveDialog";

type OutcomeKey =
  | "actions.outcomes.approved"
  | "actions.outcomes.approvedByYou"
  | "actions.outcomes.rejected"
  | "actions.outcomes.cancelled"
  | "actions.outcomes.cancellationApproved"
  | "actions.outcomes.cancellationDeclined";

type Outcome = { labelKey: OutcomeKey; className: string };

const GREEN = "text-status-approved-text";
const RED = "text-danger-text";
const MUTED = "text-tertiary";

/**
 * What a closed question reads as, per question. The same request status means different things to the
 * two: a request back in `APPROVED` after a cancellation was asked is, to the cancellation question,
 * "declined".
 */
const APPROVAL_OUTCOMES: Record<string, Outcome> = {
  APPROVED: { labelKey: "actions.outcomes.approved", className: GREEN },
  // This approver has signed; the request still waits for the rest of its chain. The backend answers
  // it per recipient, so the next approver's copy of the same request still offers the buttons.
  APPROVED_BY_YOU: { labelKey: "actions.outcomes.approvedByYou", className: GREEN },
  CANCELLATION_PENDING: { labelKey: "actions.outcomes.approved", className: GREEN },
  REJECTED: { labelKey: "actions.outcomes.rejected", className: RED },
  CANCELLED: { labelKey: "actions.outcomes.cancelled", className: MUTED },
};

const CANCELLATION_OUTCOMES: Record<string, Outcome> = {
  CANCELLED: { labelKey: "actions.outcomes.cancellationApproved", className: GREEN },
  APPROVED: { labelKey: "actions.outcomes.cancellationDeclined", className: RED },
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
  const t = useTranslations("notifications");
  const invalidateNotifications = useInvalidateNotifications();
  const markRead = useMarkNotificationRead();
  const approve = useApproveTimeOffRequest();
  const decideCancellation = useDecideCancellation();

  const [declining, setDeclining] = useState(false);

  // A holiday drift asks a different question of a different domain; it has its own controls.
  if (notification.type === PUBLIC_HOLIDAY_DRIFT_TYPE) {
    return <PublicHolidayDriftActions notification={notification} />;
  }

  // A task, a signing, a review step: the line goes quiet when done, and one-click answers are given in place.
  if (notification.source && TASK_SOURCE_TYPES.has(notification.source.type)) {
    return <TaskSourceActions notification={notification} />;
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
    return <p className={cn("mt-2 text-hint font-medium", outcome.className)}>{t(outcome.labelKey)}</p>;
  }

  const busy = approve.isPending || decideCancellation.isPending;

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
        <Button type="button"
          variant="approve"
          size="sm"
          disabled={busy}
          onClick={() => run(() => decideCancellation.mutateAsync({ requestId: source.id, userId, decision: "CONFIRM" }))}
        >
          {t("actions.approveCancellation")}
        </Button>
        <Button type="button"
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => run(() => decideCancellation.mutateAsync({ requestId: source.id, userId, decision: "DECLINE" }))}
        >
          <Icon icon={Cancel01Icon} size="sm" />
          {t("actions.decline")}
        </Button>
      </div>
    );
  }

  // Decline is the shared window (AQ-13), as on the leave cards and Home: an optional comment, the toast
  // "Time off declined". It answers the notification only once the decline went through.
  const params = notification.params ?? {};
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

  return (
    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2">
        <Button type="button" variant="approve" size="sm" onClick={() => run(() => approve.mutateAsync({ requestId: source.id }))} disabled={busy}>
          {t("actions.approve")}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => setDeclining(true)} disabled={busy}>
          <Icon icon={Cancel01Icon} size="sm" />
          {t("actions.decline")}
        </Button>
      </div>
      <DeclineLeaveDialog
        target={declining
          ? {
              requestId: source.id,
              startDate: text(params.startDate) ?? "",
              endDate: text(params.endDate) ?? text(params.startDate) ?? "",
              policyName: text(params.policyName),
              firstName: text(params.requesterName)?.split(/\s+/)[0] ?? null,
            }
          : null}
        onClose={() => setDeclining(false)}
        onDeclined={answered}
      />
    </div>
  );
};

export default NotificationActions;
