"use client";

import React, { useState } from "react";
import { Badge } from "@/components/desact/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/desact/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { FormError } from "@/components/feedback/FormError";
import { ForbiddenError } from "@/components/clients/exceptions";
import { messageForError } from "@/lib/errors/errorMessages";
import { formatDisplayDate } from "@/lib/date";
import {
  ExportDataForm,
  type ExportDataFormValues,
} from "@/components/modules/settings/shared/ExportDataModal/ExportDataForm";
import { triggerExportPostDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import type { AttendanceExportRequest, AttendanceReportRow } from "@/models/attendance";
import type { FieldDTO } from "@/models/user/fields";
import type { AttendanceView } from "./useAttendanceView";
import { ATTENDANCE_COLUMNS, personName } from "./AttendanceTable";
import { FilterBadge } from "./FilterBadge";

const PREVIEW_ROWS = 5;

type FileColumn = { key: string; label: string; value: (r: AttendanceReportRow) => string; numeric?: boolean };

/** The file's word for a status — `AttendanceExportService.statusLabel`, which is not the directory's. */
const fileStatus = (status: string | null) => {
  switch (status) {
    case "ACTIVE": return "Active";
    case "ARCHIVED": return "Archived";
    case "PROSPECTIVE": return "Prospective";
    default: return status ?? "";
  }
};

/**
 * The summary sheet's columns, in the file's order — `AttendanceExportService.summaryColumns`. The
 * table's columns are not these: the file adds Email and Status, and splits the amount from its
 * currency so a spreadsheet can sum it. The preview promises the file, so it prints the file.
 */
const fileColumns = (money: boolean): FileColumn[] => [
  { key: "email", label: "Email", value: (r) => r.person.email ?? "" },
  { key: "status", label: "Status", value: (r) => fileStatus(r.person.status) },
  ...ATTENDANCE_COLUMNS.map((column) => ({ ...column, numeric: true })),
  ...(money
    ? [
      {
        key: "amount",
        label: "Amount",
        value: (r: AttendanceReportRow) => (r.totals.amounts ?? []).map((a) => String(a.amount)).join(" + "),
        numeric: true,
      },
      {
        key: "currency",
        label: "Currency",
        value: (r: AttendanceReportRow) => (r.totals.amounts ?? []).map((a) => a.currency).join(" + "),
      },
    ]
    : []),
];

type Props = {
  open: boolean;
  onClose: () => void;
  view: AttendanceView;
  fields: FieldDTO[];
  /** How many people the file will carry — the report's own count. */
  total: number | null;
  /** The first rows the table already holds: the file's summary sheet starts with exactly these. */
  rows: AttendanceReportRow[];
};

const periodLabel = (from: string, to: string) =>
  `${formatDisplayDate(from, { style: "medium" })} – ${formatDisplayDate(to, { style: "medium" })}`;

/**
 * Export what the overview shows. Before the file is made, the dialog says what it will be made from
 * (the owner, 2026-09-28): the period, the search and every filter as read-only chips, how many
 * people, and the first rows of the summary exactly as the file will have them. A filtered list and
 * an unfiltered one look identical from inside an ordinary export dialog; this one does not.
 */
export const AttendanceExportDialog: React.FC<Props> = ({ open, onClose, view, fields, total, rows }) => {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setErrorMessage(null);
    onClose();
  };

  const onConfirm = async ({ format: fileFormat }: ExportDataFormValues) => {
    setBusy(true);
    setErrorMessage(null);
    try {
      const body: AttendanceExportRequest = {
        ...view.period,
        q: view.query.trim().length >= 2 ? view.query.trim() : null,
        filters: view.filters.length ? view.filters : null,
      };
      await triggerExportPostDownload("/api/attendance/export", fileFormat, body);
      onClose();
    } catch (error) {
      // A refusal is already on screen (`hris:forbidden`); anything else stays beside the button.
      if (error instanceof ForbiddenError) onClose();
      else setErrorMessage(messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  const search = view.query.trim().length >= 2 ? view.query.trim() : null;
  const preview = rows.slice(0, PREVIEW_ROWS);
  // The server sends money only to a reader who may see the rate, and only when time is priced — the
  // same condition that puts Amount and Currency into the file.
  const money = rows.some((row) => row.totals.amounts != null);
  const columns = fileColumns(money);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <DialogContent hideClose className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Export attendance</DialogTitle>
          <DialogDescription>
            The people in the current view, over the current period. Two sheets: a summary, one row a person,
            and every logged entry.
          </DialogDescription>
        </DialogHeader>

        <FormError message={errorMessage}/>

        <dl className="space-y-2 text-body">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="w-20 text-tertiary">Period</dt>
            <dd><Badge variant="neutral">{periodLabel(view.period.from, view.period.to)}</Badge></dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="w-20 text-tertiary">Search</dt>
            <dd>{search ? <Badge variant="neutral">{search}</Badge> : <span className="text-tertiary">None</span>}</dd>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <dt className="w-20 pt-0.5 text-tertiary">Filters</dt>
            <dd className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {view.filters.length
                ? view.filters.map((filter, index) => (
                  <FilterBadge key={index} filter={filter} fields={fields} />
                ))
                : <span className="text-tertiary">None — everyone in your reach</span>}
            </dd>
          </div>
        </dl>

        {preview.length > 0 && (
          <div className="overflow-x-auto rounded-control border border-divider">
            <Table className="text-hint">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.numeric ? "text-right" : undefined}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row) => (
                  <TableRow key={row.person.id} className="hover:bg-transparent">
                    <TableCell className="whitespace-nowrap">{personName(row.person)}</TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={column.numeric ? "whitespace-nowrap text-right tabular-nums" : "whitespace-nowrap"}
                      >
                        {column.value(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {total !== null && total > preview.length && (
              <p className="border-t border-divider px-3 py-2 text-hint text-tertiary">
                and {total - preview.length} more
              </p>
            )}
          </div>
        )}

        <ExportDataForm
          isLoading={busy}
          includedText={money
            ? "Included: the summary — name, email, status, the five numbers and the amount owed with its currency — and every logged entry with its date, times, hours, description, a note on days without a norm, and the rate it was logged at."
            : "Included: the summary — name, email, status and the five numbers — and every logged entry with its date, times, hours, description and a note on days without a norm."}
          rowCount={total ?? undefined}
          rowNoun={total === 1 ? "person" : "people"}
          onCancelAction={close}
          onSubmitAction={onConfirm}
        />
      </DialogContent>
    </Dialog>
  );
};
