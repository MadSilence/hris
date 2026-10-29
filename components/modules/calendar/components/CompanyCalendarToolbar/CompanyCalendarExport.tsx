"use client";

import { FC, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
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
        variant="outline"
        size="icon"
        className="h-9 w-9 print:hidden"
        aria-label="Print the calendar"
        title="Print"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4" />
      </Button>
      <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 print:hidden"
          aria-label="Export the calendar"
          title="Export"
          onClick={() => setOpen(true)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
          <DialogContent hideClose className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Export calendar</DialogTitle>
              <DialogDescription>
                The people in the current view, one column per day of the period shown. Leave appears as you see
                it on the board.
              </DialogDescription>
            </DialogHeader>
            <FormError message={errorMessage} />
            <ExportDataForm
              isLoading={busy}
              includedText={`Included: ${from} – ${to}, with public holidays and time off.`}
              onCancelAction={close}
              onSubmitAction={onConfirm}
            />
          </DialogContent>
        </Dialog>
      </PermissionGate>
    </>
  );
};
