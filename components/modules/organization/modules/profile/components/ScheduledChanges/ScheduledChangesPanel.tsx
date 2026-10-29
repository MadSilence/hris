"use client";

import * as React from "react";
import { useState } from "react";
import { CalendarClock } from "lucide-react";
import type { ScheduledChange } from "@/models/user/ScheduledChange";
import { ActionStatus } from "@/components/models/ActionStatus";
import type { ActionResult } from "@/lib/errors/withActionError";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/public/desact/src/components/ui/sheet";
import { ConfirmActionModal } from "@/components/ui/ConfirmActionModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { formatDisplayDate } from "@/lib/date";
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

const medium = (iso: string | null | undefined) => formatDisplayDate(iso, { style: "medium" });

/**
 * The person's scheduled changes: a quiet entry in the profile header and a side panel listing what
 * will change, when, and who decided it — with Cancel, and Change Date where the kind can move.
 *
 * **Not drawn at all when nothing is scheduled** (or nothing the reader may act on): an entry that
 * opens an empty panel is a control that cannot work (`technical_documentation/ui/README.md`). A change
 * that has applied is no longer listed, so there is nothing left to cancel.
 */
export const ScheduledChangesPanel: React.FC<Props> = ({ userId, changes, onChangedAction }) => {
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
        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        <CalendarClock className="h-4 w-4" />
        Scheduled Changes ({changes.length})
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Scheduled Changes</SheetTitle>
            <SheetDescription>What is going to change for this person, and when.</SheetDescription>
          </SheetHeader>

          <ul className="m-0 list-none divide-y divide-brown-100 px-4" aria-label="Scheduled changes">
            {changes.map((change) => (
              <li key={change.id} className="flex items-start justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="m-0 text-sm font-medium text-foreground">{labelOfChange(change)}</p>
                  <p className="m-0 mt-0.5 text-sm text-muted-foreground">
                    {change.kind === "TERMINATION" && change.rescheduleDate
                      ? `Last working day ${medium(change.rescheduleDate)}, takes effect ${medium(change.effectiveAt)}`
                      : `Takes effect ${medium(change.effectiveAt)}`}
                  </p>
                  <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                    {change.scheduledBy ? `Scheduled by ${change.scheduledBy.name}` : "Scheduled by a process"}
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
                      Change Date
                    </Button>
                  )}
                  {change.canCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCancelling(change)}>
                      Cancel
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
        title="Cancel Scheduled Change"
        description={
          cancelling ? `${labelOfChange(cancelling)} on ${medium(cancelling.effectiveAt)} will not happen.` : ""
        }
        confirmLabel="Cancel Change"
        isLoading={busy}
        errorMessage={error}
        onCancelAction={close}
        onConfirmAction={() =>
          cancelling ? run(cancelScheduledChangeAction({ userId, changeId: cancelling.id })) : undefined
        }
      />

      <ConfirmActionModal
        isOpen={moving !== null}
        title="Change Date"
        description={moving ? labelOfChange(moving) : ""}
        confirmLabel="Save"
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
            <RequiredLabel htmlFor="scheduled-change-date">{rescheduleDateLabelOf(moving)}</RequiredLabel>
            <DatePicker
              id="scheduled-change-date"
              value={date}
              clearable={false}
              ariaLabel={rescheduleDateLabelOf(moving)}
              onChange={setDate}
            />
          </div>
        )}
      </ConfirmActionModal>
    </>
  );
};
