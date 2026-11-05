"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarLock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { Button } from "@/components/desact/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/desact/sheet";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { type DateFormatter, useDateFormatter } from "@/lib/date";
import {
  cancelScheduledChangeAction,
  rescheduleScheduledChangeAction,
} from "@/components/modules/organization/modules/profile/actions/scheduledChangeActions";
import { useInvalidateUserScheduledChanges } from "@/components/modules/organization/modules/profile/hooks/useUserScheduledChanges";
import { labelOfChange, rescheduleDateLabelOf } from "./scheduledChangeText";

type Props = {
  userId: string;
  changes: ScheduledChange[];
  /** Re-reads the person after a change was cancelled or moved — the header and the fields show it. */
  onChangedAction: () => void | Promise<unknown>;
};

const medium = (iso: string | null | undefined, formatDisplayDate: DateFormatter) => formatDisplayDate(iso, { style: "medium" });

/**
 * The person's scheduled changes: a quiet entry in the profile header and a side panel listing what
 * will change, when, and who decided it — with Cancel, and Change Date where the kind can move.
 *
 * **Not drawn at all when nothing is scheduled** (or nothing the reader may act on): an entry that
 * opens an empty panel is a control that cannot work (`technical_documentation/ui/README.md`). A change
 * that has applied is no longer listed, so there is nothing left to cancel.
 */
export const ScheduledChangesPanel: React.FC<Props> = ({ userId, changes, onChangedAction }) => {
  const t = useTranslations("organization");
  const formatDisplayDate = useDateFormatter();
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState<ScheduledChange | null>(null);
  const [moving, setMoving] = useState<ScheduledChange | null>(null);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const invalidate = useInvalidateUserScheduledChanges();

  if (changes.length === 0) return null;

  const close = () => {
    setCancelling(null);
    setMoving(null);
    setError(null);
  };

  // The dialog stays open while the action runs and while it fails, and says why (ConfirmActionModal).
  const run = async (pending: Promise<ActionResult<void>>) => {
    setBusy(true);
    setError(null);
    try {
      const res = await pending;
      if (res.status === ActionStatus.SUCCESS) {
        close();
        await invalidate(userId);
        await onChangedAction();
      } else {
        setError(res.errorMessage ?? null);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 px-2 text-tertiary hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Icon icon={CalendarLock01Icon} size="sm" />
        {t("profile.scheduled.entry", { count: changes.length })}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("profile.scheduled.title")}</SheetTitle>
            <SheetDescription>{t("profile.scheduled.description")}</SheetDescription>
          </SheetHeader>

          <ul className="m-0 list-none divide-y divide-divider px-4" aria-label={t("profile.scheduled.title")}>
            {changes.map((change) => (
              <li key={change.id} className="flex items-start justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="m-0 text-body font-medium text-primary">{labelOfChange(t, tCommon, change)}</p>
                  <p className="m-0 mt-0.5 text-body text-tertiary">
                    {change.kind === "TERMINATION" && change.rescheduleDate
                      ? t("profile.scheduled.lastDayAndEffect", { lastDay: medium(change.rescheduleDate, formatDisplayDate), date: medium(change.effectiveAt, formatDisplayDate) })
                      : t("profile.scheduled.takesEffect", { date: medium(change.effectiveAt, formatDisplayDate) })}
                  </p>
                  <p className="m-0 mt-0.5 text-hint text-tertiary">
                    {change.scheduledBy
                      ? t("profile.scheduled.scheduledBy", { name: change.scheduledBy.name })
                      : t("profile.scheduled.scheduledByProcess")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {change.canReschedule && (
                    <Button type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDate(change.rescheduleDate ?? change.effectiveAt);
                        setMoving(change);
                      }}
                    >
                      {t("profile.scheduled.changeDate")}
                    </Button>
                  )}
                  {change.canCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCancelling(change)}>
                      {tCommon("actions.cancel")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <ConfirmActionModal
        isOpen={cancelling !== null}
        title={t("profile.scheduled.cancelTitle")}
        description={
          cancelling
            ? t("profile.scheduled.cancelDescription", { change: labelOfChange(t, tCommon, cancelling), date: medium(cancelling.effectiveAt, formatDisplayDate) })
            : ""
        }
        confirmLabel={t("profile.scheduled.cancelConfirm")}
        isLoading={busy}
        errorMessage={error}
        onCancelAction={close}
        onConfirmAction={() =>
          cancelling ? run(cancelScheduledChangeAction({ userId, changeId: cancelling.id })) : undefined
        }
      />

      <ConfirmActionModal
        isOpen={moving !== null}
        title={t("profile.scheduled.changeDate")}
        description={moving ? labelOfChange(t, tCommon, moving) : ""}
        confirmLabel={tCommon("actions.save")}
        isLoading={busy}
        errorMessage={error}
        onCancelAction={close}
        onConfirmAction={() =>
          moving && date
            ? run(rescheduleScheduledChangeAction({ userId, changeId: moving.id, date }))
            : undefined
        }
      >
        {moving && (
          <div className="grid gap-1.5">
            {/* Pre-filled and cannot be emptied, so no asterisk (FORMS_AND_FIELDS.md § 1). */}
            <RequiredLabel htmlFor="scheduled-change-date">{rescheduleDateLabelOf(t, moving)}</RequiredLabel>
            <DatePicker
              id="scheduled-change-date"
              value={date}
              clearable={false}
              ariaLabel={rescheduleDateLabelOf(t, moving)}
              onChange={setDate}
            />
          </div>
        )}
      </ConfirmActionModal>
    </>
  );
};
