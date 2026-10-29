"use client";

import React, { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { messageForCode, messageForError } from "@/lib/errors/errorMessages";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import type { PeopleImportCellErrorDTO, PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import {
  PeopleImportActionError,
  useCurrentPeopleImport,
  useEditPeopleImportRows,
  usePeopleImportRows,
} from "@/components/modules/settings/modules/peopleImport/hooks";

/** The error a lead nobody has yet gets (S2-1) — what *Clear Unknown Leads* empties. */
const LEAD_NOT_FOUND = "IMP00229";
/** The import changed since the page was drawn: the editor reloads rather than overwrite it. */
const IMPORT_CHANGED = "IMP00113";

type Props = { anImport: PeopleImportDTO };

const key = (rowNumber: number, column: number) => `${rowNumber}:${column}`;

/**
 * The preview with an editor (IMPORT_NEXT_DESIGN.md § 9, item 6; S2-2): every row the check refused, its
 * mapped cells editable in place, each error under the cell it is about. **Save and Check** sends the
 * changed cells and removed rows with the import's version, and the answer is the file checked again.
 * Nothing is written to the company here — only the import's own rows.
 */
export const PreviewEditor: React.FC<Props> = ({ anImport }) => {
  const [showAll, setShowAll] = useState(false);
  const rows = usePeopleImportRows(anImport.id, !showAll);
  const current = useCurrentPeopleImport();
  const edit = useEditPeopleImportRows();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(
    () => Object.keys(anImport.mapping).map(Number).sort((a, b) => a - b),
    [anImport.mapping],
  );
  const changes = Object.keys(drafts).length + removed.size;

  const send = (edits: { rowNumber: number; column: number; value: string | null }[], removeRows: number[]) => {
    setError(null);
    edit.mutate(
      { id: anImport.id, body: { version: anImport.version, edits, removeRows } },
      {
        onSuccess: () => {
          setDrafts({});
          setRemoved(new Set());
        },
        onError: (e) => {
          setError(messageForError(e));
          // Somebody else's edit or check came first: show theirs, then let this one be made again.
          if (e instanceof PeopleImportActionError && e.result.code === IMPORT_CHANGED) void current.refetch();
        },
      },
    );
  };

  const onSave = () =>
    send(
      Object.entries(drafts).map(([k, value]) => {
        const [rowNumber, column] = k.split(":").map(Number);
        return { rowNumber, column, value: value.trim() === "" ? null : value };
      }),
      [...removed],
    );

  const list = rows.data ?? [];
  const unknownLeads = list.flatMap((row) =>
    row.errors
      .filter((e) => e.code === LEAD_NOT_FOUND && e.column !== null)
      .map((e) => ({ rowNumber: row.rowNumber, column: e.column as number, value: null })),
  );

  if (rows.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
    );
  }
  if (rows.error) return <ErrorState error={rows.error} compact onRetry={() => void rows.refetch()} />;

  const errorsIn = (cellErrors: PeopleImportCellErrorDTO[], column: number) =>
    cellErrors.filter((e) => e.column === column);
  const rowLevel = (cellErrors: PeopleImportCellErrorDTO[]) =>
    cellErrors.filter((e) => e.column === null || !columns.includes(e.column));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-brown-800">
            {anImport.errorRowCount} {anImport.errorRowCount === 1 ? "row has" : "rows have"} errors. Nothing is
            imported until there are none — fix them here, or in the file.
          </p>
          {anImport.lastEditedByName && anImport.lastEditedAt && (
            <p className="text-xs text-muted-foreground">
              Last edited by {anImport.lastEditedByName} · {new Date(anImport.lastEditedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {unknownLeads.length > 0 && (
            <Button type="button" variant="outline" size="sm" disabled={edit.isPending}
              onClick={() => send(unknownLeads, [])}>
              Clear Unknown Leads
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Show Rows with Errors" : "Show All Rows"}
          </Button>
          <Button type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void triggerExportDownload(`/api/people-imports/${anImport.id}/error-file`, "xlsx").catch(() => undefined)}
          >
            <Download className="h-4 w-4" />
            Download File with Errors
          </Button>
        </div>
      </div>

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-brown-200">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Row</TableHead>
              {columns.map((c) => <TableHead key={c} className="min-w-40">{anImport.headers[c]}</TableHead>)}
              <TableHead className="min-w-48">Row Errors</TableHead>
              <TableHead className="w-12"><span className="sr-only">Remove</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => {
              const gone = removed.has(row.rowNumber);
              return (
                <TableRow key={row.rowNumber} className={gone ? "align-top opacity-40" : "align-top hover:bg-transparent"}>
                  <TableCell className="tabular-nums text-muted-foreground">{row.rowNumber}</TableCell>
                  {columns.map((c) => {
                    const k = key(row.rowNumber, c);
                    const cellErrors = errorsIn(row.errors, c);
                    return (
                      <TableCell key={c}>
                        <Input
                          className={cellErrors.length > 0 ? "h-8 border-danger-500" : "h-8"}
                          aria-label={`${anImport.headers[c]}, row ${row.rowNumber}`}
                          aria-invalid={cellErrors.length > 0}
                          maxLength={1000}
                          disabled={gone || edit.isPending}
                          value={drafts[k] ?? row.cells[c] ?? ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}
                        />
                        {cellErrors.map((e, i) => (
                          <p key={i} className="mt-1 text-xs text-danger-700">{messageForCode(e.code, undefined, e.params)}</p>
                        ))}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <ul className="space-y-1 text-xs text-danger-700">
                      {rowLevel(row.errors).map((e, i) => (
                        <li key={i}>
                          {e.columnHeader && <span className="font-medium">{e.columnHeader}: </span>}
                          {messageForCode(e.code, undefined, e.params)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                      aria-label={gone ? `Keep row ${row.rowNumber}` : `Remove row ${row.rowNumber}`}
                      disabled={edit.isPending}
                      onClick={() => setRemoved((s) => {
                        const next = new Set(s);
                        if (next.has(row.rowNumber)) next.delete(row.rowNumber);
                        else next.add(row.rowNumber);
                        return next;
                      })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <FormError message={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={changes === 0 || edit.isPending} onClick={onSave}>
          {edit.isPending ? "Checking every row…" : "Save and Check"}
        </Button>
        {changes > 0 && (
          <Button type="button" variant="ghost" disabled={edit.isPending}
            onClick={() => { setDrafts({}); setRemoved(new Set()); }}>
            Undo Changes
          </Button>
        )}
      </div>
    </div>
  );
};
