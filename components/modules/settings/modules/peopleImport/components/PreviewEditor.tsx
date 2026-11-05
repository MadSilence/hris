"use client";

import { useDisplayLocale } from "@/lib/date";
import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Delete02Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { Input } from "@/components/desact/input";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FormError } from "@/components/feedback/FormError";
import { messageForCode, messageForError } from "@/lib/errors/errorMessages";
import { triggerExportDownload } from "@/components/modules/settings/shared/ExportDataModal/triggerExportDownload";
import type { PeopleImportCellErrorDTO, PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import {
  useEditPeopleImportRows,
  usePeopleImportRows,
} from "@/components/modules/settings/modules/peopleImport/hooks";

/** The error a lead nobody has yet gets (S2-1) — what *Clear Unknown Leads* empties. */
const LEAD_NOT_FOUND = "IMP00229";

type Props = { anImport: PeopleImportDTO };

const key = (rowNumber: number, column: number) => `${rowNumber}:${column}`;

/**
 * The preview with an editor (IMPORT_NEXT_DESIGN.md § 9, item 6; S2-2): every row the check refused, its
 * mapped cells editable in place, each error under the cell it is about. **Save and Check** sends the
 * changed cells and removed rows with the import's version, and the answer is the file checked again.
 * Nothing is written to the company here — only the import's own rows.
 */
export const PreviewEditor: React.FC<Props> = ({ anImport }) => {
  const t = useTranslations("peopleImport");
  const locale = useDisplayLocale();
  const tCommon = useTranslations("common");
  const [showAll, setShowAll] = useState(false);
  const rows = usePeopleImportRows(anImport.id, !showAll);
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
        // A stale page is reloaded by the hook; the message says to make the change again.
        onError: (e) => setError(messageForError(e)),
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
          <p className="text-body font-medium text-primary">
            {t("preview.errorRows", { count: anImport.errorRowCount })}
          </p>
          {anImport.lastEditedByName && anImport.lastEditedAt && (
            <p className="text-hint text-tertiary">
              {t("preview.lastEdited", {
                name: anImport.lastEditedByName,
                when: new Date(anImport.lastEditedAt).toLocaleString(locale),
              })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {unknownLeads.length > 0 && (
            <Button type="button" variant="secondary" size="sm" disabled={edit.isPending}
              onClick={() => send(unknownLeads, [])}>
              {t("preview.clearUnknownLeads")}
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? t("preview.showErrorRows") : t("preview.showAllRows")}
          </Button>
          <Button type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => void triggerExportDownload(`/api/people-imports/${anImport.id}/error-file`, "xlsx").catch(() => undefined)}
          >
            <Icon icon={Download01Icon} size="sm" />
            {t("preview.downloadErrors")}
          </Button>
        </div>
      </div>

      <div className="max-h-[32rem] overflow-auto rounded-control border border-divider">
        <Table className="text-body">
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">{t("preview.row")}</TableHead>
              {columns.map((c) => <TableHead key={c} className="min-w-40">{anImport.headers[c]}</TableHead>)}
              <TableHead className="min-w-48">{t("preview.rowErrors")}</TableHead>
              <TableHead className="w-12"><span className="sr-only">{tCommon("actions.remove")}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => {
              const gone = removed.has(row.rowNumber);
              const rowClass = gone ? "align-top opacity-40" : "align-top hover:bg-transparent";
              return (
                <TableRow key={row.rowNumber} className={rowClass}>
                  <TableCell className="tabular-nums text-tertiary">{row.rowNumber}</TableCell>
                  {columns.map((c) => {
                    const k = key(row.rowNumber, c);
                    const cellErrors = errorsIn(row.errors, c);
                    return (
                      <TableCell key={c}>
                        <Input
                          className={cellErrors.length > 0 ? "h-8 border-status-declined-fill" : "h-8"}
                          aria-label={t("preview.cellAria", { header: anImport.headers[c], row: row.rowNumber })}
                          aria-invalid={cellErrors.length > 0}
                          maxLength={1000}
                          disabled={gone || edit.isPending}
                          value={drafts[k] ?? row.cells[c] ?? ""}
                          onChange={(e) => setDrafts((d) => ({ ...d, [k]: e.target.value }))}
                        />
                        {cellErrors.map((e, i) => (
                          <p key={i} className="mt-1 text-hint text-status-declined-text">{messageForCode(e.code, undefined, e.params)}</p>
                        ))}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <ul className="space-y-1 text-hint text-status-declined-text">
                      {rowLevel(row.errors).map((e, i) => (
                        <li key={i}>
                          {e.columnHeader && <span className="font-medium">{t("checkErrors.columnPrefix", { header: e.columnHeader })}</span>}
                          {messageForCode(e.code, undefined, e.params)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon-sm"
                      aria-label={gone ? t("preview.keepRow", { row: row.rowNumber }) : t("preview.removeRow", { row: row.rowNumber })}
                      disabled={edit.isPending}
                      onClick={() => setRemoved((s) => {
                        const next = new Set(s);
                        if (next.has(row.rowNumber)) next.delete(row.rowNumber);
                        else next.add(row.rowNumber);
                        return next;
                      })}
                    >
                      <Icon icon={Delete02Icon} size="sm" />
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
          {edit.isPending ? t("preview.checking") : t("preview.saveAndCheck")}
        </Button>
        {changes > 0 && (
          <Button type="button" variant="ghost" disabled={edit.isPending}
            onClick={() => { setDrafts({}); setRemoved(new Set()); }}>
            {t("preview.undoChanges")}
          </Button>
        )}
      </div>
    </div>
  );
};
