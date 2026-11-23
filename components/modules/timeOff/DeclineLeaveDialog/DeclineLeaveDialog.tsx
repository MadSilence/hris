"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/desact/dialog";
import { Label } from "@/components/desact/label";
import { Textarea } from "@/components/desact/textarea";
import { FormError } from "@/components/feedback/FormError";
import { PolicyMarker } from "@/components/ui/PolicyMarker";
import { useShortDates } from "@/lib/date";
import { showSuccess } from "@/lib/errors/errorToast";
import { messageForError } from "@/lib/errors/errorMessages";
import { useRejectTimeOffRequest } from "@/components/modules/settings/modules/time/timeOff/timeOffRequests/hooks/useRejectTimeOffRequest";
import { useInvalidateNotifications } from "@/components/modules/notifications/hooks/useNotifications";

export type DeclineTarget = {
  requestId: string;
  startDate: string;
  endDate: string;
  /** The policy as the reader sees it; absent, "Time off". */
  policyName?: string | null;
  policyColor?: string | null;
  /** The requester's first name: "Decline Rūta’s time off?", "Rūta sees this". */
  firstName?: string | null;
};

/**
 * **Decline** (profile-time-off-answers AQ13): one small window, 400. "Decline Rūta’s time off?", the policy and the
 * dates under it, an optional **Comment** the person is shown, Cancel · the red **Decline**. The window is the
 * confirm; it stays open while it runs and while it fails. Toast "Time off declined".
 *
 * One window for every place a request is declined: the leave cards (the profile's and the board's), the request in
 * full (Q30) and Home's deck.
 */
export const DeclineLeaveDialog: React.FC<{
  target: DeclineTarget | null;
  onClose: () => void;
  /** After the decline went through, for the caller to refresh or close what it shows. */
  onDeclined?: () => void | Promise<unknown>;
}> = ({ target, onClose, onDeclined }) => {
  const t = useTranslations("leave");
  const tCommon = useTranslations("common");
  const tCalendar = useTranslations("calendar");
  const shortDates = useShortDates();
  const reject = useRejectTimeOffRequest();
  const invalidateNotifications = useInvalidateNotifications();
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const commentId = React.useId();

  React.useEffect(() => {
    setComment("");
    setError(null);
  }, [target?.requestId]);

  const decline = async () => {
    if (!target) return;
    setError(null);
    try {
      const text = comment.trim();
      await reject.mutateAsync({ requestId: target.requestId, ...(text ? { comment: text } : {}) });
      invalidateNotifications();
      showSuccess(t("full.declinedToast"));
      await onDeclined?.();
      onClose();
    } catch (e) {
      setError(messageForError(e));
    }
  };

  const name = target?.firstName?.trim() || null;

  return (
    <Dialog open={target !== null} onOpenChange={(open) => { if (!open && !reject.isPending) onClose(); }}>
      <DialogContent size="sm" aria-describedby={undefined} className="gap-5">
        <DialogHeader className="gap-3">
          <DialogTitle className="font-heading">
            {name ? t("decline.title", { name }) : t("decline.titlePlain")}
          </DialogTitle>
          {target ? (
            <p className="flex min-w-0 items-center gap-2 text-body text-secondary">
              <PolicyMarker color={target.policyName ? target.policyColor : null} />
              <span className="truncate">
                {t("decline.subline", {
                  policy: target.policyName || tCalendar("balances.fallbackName"),
                  dates: shortDates.range(target.startDate, target.endDate, { weekday: true }),
                })}
              </span>
            </p>
          ) : null}
        </DialogHeader>

        <div>
          <Label htmlFor={commentId} className="mb-1.5 gap-1.5 text-label font-medium text-secondary">
            {t("decline.comment")}
            {" "}<span className="font-normal text-tertiary">{t("request.optional")}</span>
          </Label>
          <Textarea
            id={commentId}
            autoFocus
            className="min-h-14"
            rows={2}
            placeholder={name ? t("decline.placeholder", { name }) : t("decline.placeholderPlain")}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            disabled={reject.isPending}
          />
        </div>

        <FormError message={error} />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={reject.isPending}>
            {tCommon("actions.cancel")}
          </Button>
          <Button type="button" variant="destructive-confirm" loading={reject.isPending} onClick={() => void decline()}>
            {t("full.decline")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
