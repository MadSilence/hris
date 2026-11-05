"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Button } from "@/components/desact/button";
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
  const t = useTranslations("timeOff");
  const tCommon = useTranslations("common");
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
      showSuccess(calendarId ? t("binding.dialog.set") : t("binding.dialog.removed"));
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
            <Icon icon={Calendar03Icon} />
            {t("binding.dialog.title", { place: placeName })}
          </DialogTitle>
          <DialogDescription>
            {t("binding.dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <FormError message={error ? messageForError(error) : null} />

        {preview.data === undefined ? (
          <div className="max-h-72 space-y-2 overflow-y-auto" role="radiogroup" aria-label={t("binding.dialog.choiceAria")}>
            {calendars.map((c) => (
              <Choice key={c.id} label={c.name} selected={choice === c.id} onSelect={() => setChoice(c.id)} />
            ))}
            <Choice label={tCommon("values.none")} selected={choice === NONE} onSelect={() => setChoice(NONE)} muted />
          </div>
        ) : (
          <div className="space-y-2" data-test="binding-preview">
            {previewLines(preview.data, current?.calendarName ?? null, t).map((line) => (
              <p key={line} className="m-0 text-body text-primary">{line}</p>
            ))}
            {preview.data.keepOwnPeople.length > 0 && (
              <p className="m-0 text-hint text-tertiary">
                {t(
                  preview.data.keepOwn > preview.data.keepOwnPeople.length
                    ? "binding.dialog.keepingOwnMore"
                    : "binding.dialog.keepingOwn",
                  { names: preview.data.keepOwnPeople.map((p) => p.name ?? t("binding.dialog.unnamed")).join(", ") },
                )}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {preview.data === undefined ? (
            <>
              <Button type="button" variant="secondary" onClick={onRequestCloseAction} disabled={busy}>
                {tCommon("actions.cancel")}
              </Button>
              <Button type="button" onClick={onReview} disabled={busy || unchanged}>
                {preview.isPending ? t("binding.dialog.reviewing") : t("binding.dialog.review")}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={resetPreview} disabled={busy}>
                {tCommon("actions.back")}
              </Button>
              <Button type="button" onClick={() => void onApply()} disabled={busy}>
                {apply.isPending ? t("binding.dialog.applying") : tCommon("actions.apply")}
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
      className={`flex w-full items-center gap-3 rounded-control border p-3 text-left text-body transition-colors ${
        selected ? "border-accent-ring bg-accent-subtle" : "border-divider hover:bg-subtle"
      }`}
    >
      <span
        className={`flex h-4 w-4 flex-none items-center justify-center rounded-pill border ${
          selected ? "border-accent" : "border-field"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-pill bg-accent" />}
      </span>
      <span className={muted ? "text-tertiary" : "text-primary"}>{label}</span>
    </button>
  );
}
