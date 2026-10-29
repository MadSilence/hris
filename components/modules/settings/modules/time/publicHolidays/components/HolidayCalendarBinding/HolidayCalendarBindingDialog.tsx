"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { FormError } from "@/components/feedback/FormError";
import { messageForError } from "@/lib/errors/errorMessages";
import { showSuccess } from "@/lib/errors/errorToast";
import {
  usePreviewHolidayCalendarBinding,
  useSetHolidayCalendarBinding,
} from "@/components/modules/settings/modules/time/publicHolidays/hooks/useHolidayCalendarBinding";
import { usePublicHolidayCalendars } from "@/components/modules/settings/modules/time/publicHolidays/hooks/usePublicHolidayCalendars";
import { PublicHolidayCalendarStatus } from "@/api/modules/publicHolidays/calendars/dto";
import type { HolidayCalendarBinding, HolidayCalendarBindingKind } from "@/models/publicHolidays/binding";
import { previewLines } from "./bindingCopy";

type Props = {
  isOpen: boolean;
  onRequestCloseAction: () => void;
  kind: HolidayCalendarBindingKind;
  refId: string | null;
  /** "Berlin", or "the Company" for the default — the dialog's title names it. */
  placeName: string;
  current: HolidayCalendarBinding | undefined;
};

const NONE = "__none__";

/**
 * Choose a calendar, review what it does to the people who work here, apply. Two steps in one dialog: the
 * preview is the owner's requirement (DECISIONS.md, 2026-10-16, item 8) — nobody's calendar changes before
 * the counts have been seen.
 */
export const HolidayCalendarBindingDialog: React.FC<Props> = ({
  isOpen,
  onRequestCloseAction,
  kind,
  refId,
  placeName,
  current,
}) => {
  const calendarList = usePublicHolidayCalendars();
  // An archived calendar takes nobody new; an inactive one may be bound and activated later.
  const calendars = useMemo(
    () => (calendarList.data ?? [])
      .filter((c) => c.status !== PublicHolidayCalendarStatus.Archived)
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [calendarList.data],
  );
  const [choice, setChoice] = useState<string>(NONE);
  const preview = usePreviewHolidayCalendarBinding();
  const apply = useSetHolidayCalendarBinding();
  const { reset: resetPreview } = preview;
  const { reset: resetApply } = apply;

  useEffect(() => {
    if (!isOpen) return;
    setChoice(current?.calendarId ?? NONE);
    resetPreview();
    resetApply();
  }, [isOpen, current?.calendarId, resetPreview, resetApply]);

  const calendarId = choice === NONE ? null : choice;
  // A paused binding (its calendar went away) is repaired by choosing again, even the same one.
  const unchanged = calendarId === (current?.calendarId ?? null) && current?.ruleStatus !== "PAUSED";
  const busy = preview.isPending || apply.isPending;
  const error = preview.error ?? apply.error;

  const onReview = () => preview.mutate({ kind, refId, calendarId });
  const onApply = async () => {
    try {
      await apply.mutateAsync({ kind, refId, calendarId });
      showSuccess(calendarId ? "Holiday calendar set." : "Holiday calendar removed.");
      onRequestCloseAction();
    } catch {
      // Shown in the dialog, which stays open with the choice made.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !busy && onRequestCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Holiday Calendar for {placeName}
          </DialogTitle>
          <DialogDescription>
            Everybody who works here gets this calendar, unless they have one of their own or a more specific
            place gives them another: the office comes before the legal entity, the legal entity before the
            company default. A change applies from today, and leave before today keeps its price.
          </DialogDescription>
        </DialogHeader>

        <FormError message={error ? messageForError(error) : null} />

        {preview.data === undefined ? (
          <div className="max-h-72 space-y-2 overflow-y-auto" role="radiogroup" aria-label="Holiday Calendar">
            {calendars.map((c) => (
              <Choice key={c.id} label={c.name} selected={choice === c.id} onSelect={() => setChoice(c.id)} />
            ))}
            <Choice label="None" selected={choice === NONE} onSelect={() => setChoice(NONE)} muted />
          </div>
        ) : (
          <div className="space-y-2" data-test="binding-preview">
            {previewLines(preview.data, current?.calendarName ?? null).map((line) => (
              <p key={line} className="m-0 text-sm text-foreground">{line}</p>
            ))}
            {preview.data.keepOwnPeople.length > 0 && (
              <p className="m-0 text-xs text-muted-foreground">
                Keeping their own: {preview.data.keepOwnPeople.map((p) => p.name ?? "Unnamed").join(", ")}
                {preview.data.keepOwn > preview.data.keepOwnPeople.length ? ", …" : ""}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {preview.data === undefined ? (
            <>
              <Button type="button" variant="outline" onClick={onRequestCloseAction} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={onReview} disabled={busy || unchanged}>
                {preview.isPending ? "Reviewing…" : "Review"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={resetPreview} disabled={busy}>
                Back
              </Button>
              <Button type="button" onClick={() => void onApply()} disabled={busy}>
                {apply.isPending ? "Applying…" : "Apply"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function Choice({ label, selected, onSelect, muted = false }: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
        selected ? "border-brown-400 bg-brown-50" : "border-brown-200 hover:bg-brown-50"
      }`}
    >
      <span
        className={`flex h-4 w-4 flex-none items-center justify-center rounded-full border ${
          selected ? "border-brown-500" : "border-brown-300"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-brown-500" />}
      </span>
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
    </button>
  );
}
