"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowExpand01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useShortDates } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import type { TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { TimeOffRequestStatus } from "@/api/modules/timeOff/timeOffRequests/dto";
import { useApproveTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useApproveTimeOffRequest";
import { useLeaveStatus } from "@/components/modules/timeOff/LeaveRequestDialog";
import { lengthOf, requestUnitOf } from "@/components/modules/timeOff/lib/leaveWords";

/**
 * The compact card a leave pill opens (profile-time-off Q02, Q03): the policy and its status, ↗ to the request in
 * full; the dates; the length and the day the person is back; their note; and **Decline** · **Approve** for the person
 * it waits on. Decline opens the Decline window, its comment optional (AQ-13); the length says "working days" by the
 * request's counting method (B5).
 */
export const LeaveCard: FC<{
  request: TimeOffRequest;
  policy: TimeOffPolicy | undefined;
  /** "Mon 7 Dec" — the first working day after it. */
  backDate: string;
  awaitingYou: boolean;
  onOpenFull: () => void;
  onDecline: () => void;
  onDone: () => void;
}> = ({ request, policy, backDate, awaitingYou, onOpenFull, onDecline, onDone }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const statusOf = useLeaveStatus();
  const status = statusOf(request.status);
  const approve = useApproveTimeOffRequest();
  const [error, setError] = useState<string | null>(null);
  const decides = awaitingYou && request.status === TimeOffRequestStatus.Pending;

  return (
    <div className="flex w-[300px] flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-2 text-body text-secondary">
          <PolicyMarker color={policy?.color} />
          <span className="truncate">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
        </span>
        <StatusBadge status={status.tone} label={status.label} />
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("month.open")} onClick={onOpenFull}
                className="-mr-1 text-tertiary">
          <Icon icon={ArrowExpand01Icon} size="sm" />
        </Button>
      </div>
      <p className="text-card-title text-primary">{shortDates.range(request.startDate, request.endDate, { weekday: true })}</p>
      <p className="text-body text-secondary">
        {t("lengthBack", { length: lengthOf(t, request.requestedAmount, requestUnitOf(policy, request.countingMode)), date: backDate })}
      </p>
      {request.reason ? <p className="mt-1 text-body text-primary">{request.reason}</p> : null}
      {error ? <FormError message={error} className="mt-2" /> : null}
      {decides ? (
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onDecline} disabled={approve.isPending}>
            {t("full.decline")}
          </Button>
          <Button type="button" variant="approve" size="sm" loading={approve.isPending}
                  onClick={async () => {
                    setError(null);
                    try {
                      await approve.mutateAsync({ requestId: request.id });
                      showSuccess(t("full.approvedToast"));
                      onDone();
                    } catch (e) {
                      setError(messageForError(e));
                    }
                  }}>
            {t("full.approve")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
