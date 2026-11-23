"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CancelCircleIcon, HourglassIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/desact/dialog";
import { Icon } from "@/components/desact/icon";
import { Label } from "@/components/desact/label";
import { FormError } from "@/components/feedback/FormError";
import { DatePicker } from "@/components/ui/DatePicker";
import { ActionStatus } from "@/components/models/ActionStatus";
import { showSuccess } from "@/lib/errors/errorToast";
import { useDateFormatter } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { DocumentDTO } from "@/api/modules/documents/dto";
import { updateDocumentExpiryAction } from "../actions";

/**
 * The Expires cell (documents-expiry X01, X1): just the date — 14/20 500 amber with an hourglass 14 when it is soon,
 * red with a crossed circle 14 when it is past; grey 400 when valid; "—" with none.
 */
export function ExpiryCell({ document }: { document: Pick<DocumentDTO, "expiresOn" | "expiryState"> }) {
  const formatDate = useDateFormatter();
  if (!document.expiresOn) return <span className="text-tertiary">—</span>;
  const state = document.expiryState;
  const flagged = state === "EXPIRED" || state === "EXPIRING";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-body tabular-nums",
        flagged ? "font-medium" : "font-normal text-tertiary",
        state === "EXPIRED" && "text-status-declined-text",
        state === "EXPIRING" && "text-status-pending-text",
      )}
    >
      {state === "EXPIRED" && <Icon icon={CancelCircleIcon} size="sm" className="size-3.5 text-status-declined-icon" />}
      {state === "EXPIRING" && <Icon icon={HourglassIcon} size="sm" className="size-3.5 text-status-pending-icon" />}
      {formatDate(document.expiresOn, { style: "medium" })}
    </span>
  );
}

/**
 * Expiry date (X04, X3): a date, or Remove date; a category that requires one refuses the removal (D00029). The hint
 * names the person by first name and the days from the category (30 without one, X11). Neither button is ever greyed:
 * Remove date shows only while there is a date, and Save with the field cleared removes it.
 */
export function EditExpiryDialog({
  document,
  personName,
  remindDaysBefore,
  onCloseAction,
  onSavedAction,
}: {
  document: DocumentDTO;
  /** The person's first name ("Reza and whoever manages their documents…"). */
  personName: string;
  /** The category's reminder; null or absent is the default 30. */
  remindDaysBefore?: number | null;
  onCloseAction: () => void;
  onSavedAction: () => void;
}) {
  const t = useTranslations("signing");
  const [date, setDate] = React.useState(document.expiresOn ?? "");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async (next: string | null) => {
    setBusy(true);
    const r = await updateDocumentExpiryAction(document.id, next);
    setBusy(false);
    if (r.status !== ActionStatus.SUCCESS) {
      setError(r.errorMessage ?? null);
      return;
    }
    showSuccess(t("expiry.saved"));
    onSavedAction();
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onCloseAction()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{t("expiry.title")}</DialogTitle>
          <DialogDescription>{document.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expiry-date">
            {t("expiry.validUntil")} <span className="font-normal text-tertiary">{t("expiry.optional")}</span>
          </Label>
          <DatePicker id="expiry-date" value={date} onChange={setDate} />
          <p className="text-hint text-tertiary">
            {t("expiry.reminderHintDays", { name: personName, days: remindDaysBefore && remindDaysBefore > 0 ? remindDaysBefore : 30 })}
          </p>
        </div>
        <FormError message={error} />
        <DialogFooter className="sm:justify-between">
          {document.expiresOn ? (
            <Button type="button" variant="ghost" className="text-secondary" onClick={() => void save(null)}>
              {t("expiry.removeDate")}
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {t("expiry.cancel")}
            </Button>
            <Button
              type="button"
              loading={busy}
              onClick={() => (date ? void save(date) : document.expiresOn ? void save(null) : onCloseAction())}
            >
              {t("expiry.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
