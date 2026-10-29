"use client";

import React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { messageForCode } from "@/lib/errors/errorMessages";
import type { PeopleImportDTO } from "@/api/modules/peopleImport/dto";
import { usePeopleImportRows } from "@/components/modules/settings/modules/peopleImport/hooks";

type Props = { anImport: PeopleImportDTO };

/** The report's failures: every row Apply could not write, and why. The Check step's list is {@link PreviewEditor}. */
export const CheckErrors: React.FC<Props> = ({ anImport }) => {
  const rows = usePeopleImportRows(anImport.id, true);

  if (rows.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
    );
  }
  if (rows.error) return <ErrorState error={rows.error} compact onRetry={() => void rows.refetch()} />;

  const list = rows.data ?? [];
  if (list.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-brown-800">
          {`${list.length} ${list.length === 1 ? "row needs" : "rows need"} attention.`}
        </p>
      </div>

      <div className="max-h-[28rem] overflow-auto rounded-lg border border-brown-200">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Row</TableHead>
              <TableHead className="w-48">Name</TableHead>
              <TableHead>What Is Wrong</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.rowNumber} className="align-top hover:bg-transparent">
                <TableCell className="tabular-nums text-muted-foreground">{row.rowNumber}</TableCell>
                <TableCell className="truncate">{row.name ?? "—"}</TableCell>
                <TableCell>
                  <ul className="space-y-1">
                    {row.errors.map((error, index) => (
                      <li key={index}>
                        {error.columnHeader && <span className="font-medium text-brown-800">{error.columnHeader}: </span>}
                        {messageForCode(error.code, undefined, error.params)}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
