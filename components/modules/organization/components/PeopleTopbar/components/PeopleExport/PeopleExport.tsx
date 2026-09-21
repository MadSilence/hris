"use client";

import { FC, useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/public/desact/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { FormError } from "@/components/feedback/FormError";
import { ForbiddenError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";
import {
  ExportDataForm,
  type ExportDataFormValues,
} from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { triggerExportPostDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import type { ColumnItem } from "@/models/userTable";
import type { FilterDTO } from "@/models/user/fields";
import type { PeopleExportRequest } from "@/models/user/peopleExport";

export type PeopleExportSort = { fieldId: string; dir: "asc" | "desc" } | null;

export type PeopleExportProps = {
  /** The table's columns, in the table's order; `checked` is what the view shows. */
  columns: ColumnItem[];
  filters: FilterDTO[];
  query: string;
  /** Whether the Drafts segment is the one open. */
  showingDrafts: boolean;
  /**
   * The table's sort. Optional only because the topbar does not own it; without it the file is in
   * the table's default order (first name, ascending).
   */
  sort?: PeopleExportSort;
};

const DEFAULT_SORT: NonNullable<PeopleExportSort> = { fieldId: "first_name", dir: "asc" };

/** The same two-character floor the table applies before it sends a search term. */
const searchTermOf = (query: string): string | null => {
  const q = query.trim();
  return q.length >= 2 ? q : null;
};

/**
 * What the file is asked to contain: the view, exactly as the table has it.
 *
 * With "all columns" every column the table offers goes, in the table's order, and the backend adds
 * any it may read that the table does not list. Either way the backend is the one that decides — a
 * column the caller may not read is dropped there, not here.
 */
export const buildPeopleExportRequest = (
  props: PeopleExportProps,
  allColumns: boolean,
  format: PeopleExportRequest["format"],
): PeopleExportRequest => {
  const sort = props.sort ?? DEFAULT_SORT;
  const ids = (allColumns ? props.columns : props.columns.filter((c) => c.checked)).map((c) => c.id);
  return {
    q: searchTermOf(props.query),
    sortField: sort.fieldId,
    sortDir: sort.dir,
    filters: props.filters.length ? props.filters : null,
    drafts: props.showingDrafts ? "ONLY" : null,
    columns: ids,
    allColumns,
    format,
  };
};

/**
 * Export in the People toolbar: an icon button, then the format dialog every other export uses, with
 * one addition — the "all columns" switch.
 *
 * Offered only to a caller holding `PEOPLE.PROFILE EDIT`, because that is what the backend demands
 * (DECISIONS.md § "Carrying data out of the building is an EDIT") and a control that can only be
 * refused is not offered (EXPORT.md). The gate is UX; the refusal is the server's.
 */
export const PeopleExport: FC<PeopleExportProps> = (props) => {
  const [open, setOpen] = useState(false);
  const [allColumns, setAllColumns] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const includedText = useMemo(() => {
    if (allColumns) {
      return "Included: every column you are allowed to see, including the ones hidden in the table.";
    }
    const shown = props.columns.filter((c) => c.checked).map((c) => c.label);
    const list = shown.length ? shown.join(", ") : "Name";
    return `Included: ${list}. Status is added when the view leaves it out, so a former employee is never mistaken for a current one.`;
  }, [allColumns, props.columns]);

  const close = () => {
    if (busy) return;
    setOpen(false);
    setErrorMessage(null);
  };

  const onConfirm = async ({ format }: ExportDataFormValues) => {
    setBusy(true);
    setErrorMessage(null);
    try {
      await triggerExportPostDownload(
        "/api/users/export",
        format,
        buildPeopleExportRequest(props, allColumns, format),
      );
      setOpen(false);
    } catch (error) {
      // A refusal has already been put on screen by the client (`hris:forbidden`), and there is
      // nothing to retry in this dialog; anything else stays next to the button that was pressed.
      if (error instanceof ForbiddenError) {
        setOpen(false);
      } else {
        setErrorMessage(messageForError(error));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PermissionGate resource="PEOPLE.PROFILE" action="EDIT">
      <Button
        size="icon"
        variant="outline"
        aria-label="Export people"
        onClick={() => setOpen(true)}
      >
        <Download className="h-4 w-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <DialogContent hideClose className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Export people</DialogTitle>
            <DialogDescription>
              The people in the current view — the same search, filters, segment and order as the table.
            </DialogDescription>
          </DialogHeader>

          <FormError message={errorMessage} />

          <label className="flex items-start justify-between gap-4 rounded-md border border-brown-200 px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Export all columns</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Every column you are allowed to see, not only the ones shown.
              </span>
            </span>
            <Switch
              className="mt-0.5"
              checked={allColumns}
              disabled={busy}
              onCheckedChange={setAllColumns}
              aria-label="Export all columns"
            />
          </label>

          <ExportDataForm
            isLoading={busy}
            includedText={includedText}
            onCancelAction={close}
            onSubmitAction={onConfirm}
          />
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
};
