"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/desact/alert-dialog";
import { Button } from "@/components/desact/button";
import { FormError } from "@/components/feedback/FormError";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { useShortDates } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import type { TimeOffPolicy, TimeOffRequest } from "@/models/timeOff";
import { useCancelTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useCancelTimeOffRequest";
import { lengthOf, unitOf } from "@/components/modules/timeOff/lib/leaveWords";

/**
 * "Cancel this request?" (profile-time-off Q31): 440, one column — the policy, the days and their length, what
 * cancelling means; **Keep it** and the red **Cancel request**, no accent button beside it (SPEC § 4.6). For a
 * request still waiting: cancelling an approved one is not in this round and keeps today's flow (a reason, in All
 * requests). The approver is **not named** — who approves is seen only by the people in that approval (the owner,
 * 2026-11-20); the drawn "Meryem won't need to approve it" is put to the designers with AQ-04.
 */
export const CancelLeaveRequestDialog: React.FC<{
  request: Pick<TimeOffRequest, "id" | "userId" | "startDate" | "endDate" | "requestedAmount"> | null;
  policy: TimeOffPolicy | undefined;
  /** The reader's own request — "your balance". */
  own: boolean;
  /** The requester's first name, for somebody else's request. */
  firstName?: string | null;
  workingDays?: boolean;
  onClose: () => void;
  onCanceled?: () => void;
}> = ({ request, policy, own, firstName, workingDays, onClose, onCanceled }) => {
  const t = useTranslations("leave");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const cancel = useCancelTimeOffRequest();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => setError(null), [request?.id]);

  const confirm = async () => {
    if (!request) return;
    setError(null);
    try {
      await cancel.mutateAsync({ requestId: request.id, userId: request.userId, cancellationReason: null });
      showSuccess(t("cancel.done"));
      onCanceled?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : tCalendar("requests.errors.cancel"));
    }
  };

  return (
    <AlertDialog open={request !== null} onOpenChange={(open) => { if (!open && !cancel.isPending) onClose(); }}>
      <AlertDialogContent className="sm:max-w-[440px]">
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle>{t("cancel.title")}</AlertDialogTitle>
          {request ? (
            <p className="flex flex-wrap items-center gap-x-2 text-body text-primary">
              <PolicyMarker color={policy?.color} />
              <span className="font-semibold">{policy?.name ?? tCalendar("balances.fallbackName")}</span>
              <span>
                · {shortDates.range(request.startDate, request.endDate, { weekday: true })} ·{" "}
                {lengthOf(t, request.requestedAmount, unitOf(policy, workingDays) === "hours" ? "hours" : "days")}
              </span>
            </p>
          ) : null}
          <AlertDialogDescription>
            {own || !firstName ? t("cancel.textOwn") : t("cancel.textOther", { name: firstName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FormError message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancel.isPending}>{t("cancel.keep")}</AlertDialogCancel>
          <Button type="button" variant="destructive-confirm" loading={cancel.isPending} onClick={() => void confirm()}>
            {t("cancel.confirm")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
