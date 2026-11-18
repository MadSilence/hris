"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Cancel01Icon, HourglassIcon } from "@hugeicons/core-free-icons";

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
 * The Expires cell (documents-expiry X01): just the date — amber with an hourglass when it is soon, red with a cross
 * when it is past, grey when valid, "—" with none.
 */
export function ExpiryCell({ document }: { document: Pick<DocumentDTO, "expiresOn" | "expiryState"> }) {
  const formatDate = useDateFormatter();
  if (!document.expiresOn) return <span className="text-tertiary">—</span>;
  const state = document.expiryState;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        state === "EXPIRED" ? "text-status-declined-text" : state === "EXPIRING" ? "text-status-pending-text" : "text-secondary",
      )}
    >
      {state === "EXPIRED" && <Icon icon={Cancel01Icon} size="sm" />}
      {state === "EXPIRING" && <Icon icon={HourglassIcon} size="sm" />}
      {formatDate(document.expiresOn, { style: "medium" })}
    </span>
  );
}

/** Edit expiry date (X04): a date, or Remove date; a category that requires one refuses the removal (D00029). */
export function EditExpiryDialog({
  document,
  personName,
  onCloseAction,
  onSavedAction,
}: {
  document: DocumentDTO;
  personName: string;
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
          <DialogTitle>{t("expiry.edit")}</DialogTitle>
          <DialogDescription>{document.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expiry-date">{t("expiry.validUntil")}</Label>
          <DatePicker id="expiry-date" value={date} onChange={setDate} />
          <p className="text-hint text-tertiary">{t("expiry.reminderHint", { name: personName })}</p>
        </div>
        <FormError message={error} />
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="ghost" disabled={!document.expiresOn} onClick={() => void save(null)}>
            {t("expiry.removeDate")}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onCloseAction}>
              {t("expiry.cancel")}
            </Button>
            <Button type="button" loading={busy} disabled={!date} onClick={() => void save(date)}>
              {t("expiry.save")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
