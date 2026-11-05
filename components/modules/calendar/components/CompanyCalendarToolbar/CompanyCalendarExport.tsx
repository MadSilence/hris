"use client";

import { FC, useState } from "react";
import { useTranslations } from "next-intl";
import { Download01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { FormError } from "@/components/feedback/FormError";
import { ForbiddenError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";
import {
  ExportDataForm,
  type ExportDataFormValues,
} from "@/components/modules/settings/shared/ExportDataModal";
import { triggerExportPostDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import type { FilterDTO } from "@/models/user/fields";

type Props = {
  from: string;
  to: string;
  q?: string;
  filters: FilterDTO[];
};

/**
 * Export and print of the board (sitting 2, C9).
 *
 * **Export** is the board's window, search and filters as a file — one row per person, one column per
 * day, each cell what the board shows this reader. Offered with `PEOPLE.PROFILE` EDIT, the right the server
 * asks for it besides the board's own (EXPORT.md: carrying people out of the building is an EDIT; a control
 * that can only be refused is not offered).
 *
 * **Print** prints what is on screen: the browser's own print, with the app's chrome left out by the print
 * styles. It carries nothing the reader cannot already see, so it asks for nothing.
 */
export const CompanyCalendarExport: FC<Props> = ({ from, to, q, filters }) => {
  const t = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setOpen(false);
    setErrorMessage(null);
  };

  const onConfirm = async ({ format }: ExportDataFormValues) => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await triggerExportPostDownload("/api/calendar/company/export", format, {
        from,
        to,
        q: q ?? null,
        filters: filters.length ? filters : null,
        format,
      });
      setOpen(false);
    } catch (error) {
      // A refusal is already on screen (`hris:forbidden`); anything else stays beside the button.
      if (error instanceof ForbiddenError) setOpen(false);
      else setErrorMessage(messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon" className="print:hidden"
        aria-label={t("export.printAria")}
        title={t("export.print")}
        onClick={() => window.print()}
      >
        <Icon icon={PrinterIcon} size="sm" />
      </Button>
      <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
        <Button
          type="button"
          variant="secondary"
          size="icon" className="print:hidden"
          aria-label={t("export.exportAria")}
          title={tCommon("actions.export")}
          onClick={() => setOpen(true)}
        >
          <Icon icon={Download01Icon} size="sm" />
        </Button>
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
          <DialogContent hideClose className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("export.title")}</DialogTitle>
              <DialogDescription>
                {t("export.description")}
              </DialogDescription>
            </DialogHeader>
            <FormError message={errorMessage} />
            <ExportDataForm
              isLoading={busy}
              includedText={t("export.included", { from, to })}
              onCancelAction={close}
              onSubmitAction={onConfirm}
            />
          </DialogContent>
        </Dialog>
      </PermissionGate>
    </>
  );
};
