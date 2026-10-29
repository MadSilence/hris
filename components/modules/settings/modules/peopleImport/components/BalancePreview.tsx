"use client";

import React from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePeopleImportRows } from "@/components/modules/settings/modules/peopleImport/hooks";

const unitOf = (unit: unknown) => (unit === "HOURS" ? "h" : "d");

/**
 * Per row *current → target (difference)* before anything is booked (IMPORT_NEXT_DESIGN.md § 3.3): an
 * up-front grant or an accrual already booked makes a surprising difference visible here, not after.
 */
export const BalancePreview: React.FC<{ importId: string }> = ({ importId }) => {
  const rows = usePeopleImportRows(importId, false);
  if (rows.isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.error) return <ErrorState error={rows.error} compact onRetry={() => void rows.refetch()} />;

  return (
    <div className="max-h-80 overflow-auto rounded-lg border border-brown-200">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Row</TableHead>
            <TableHead>Person</TableHead>
            <TableHead>As Of</TableHead>
            <TableHead className="text-right">Now</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Difference</TableHead>
            <TableHead className="text-right">Carried Over</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(rows.data ?? []).map((row) => {
            const p = row.preview ?? {};
            const u = unitOf(p.unit);
            const difference = String(p.difference ?? "0");
            return (
              <TableRow key={row.rowNumber} className="hover:bg-transparent">
                <TableCell className="tabular-nums text-muted-foreground">{row.rowNumber}</TableCell>
                <TableCell>{row.name ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{String(p.asOf ?? "—")}</TableCell>
                <TableCell className="text-right tabular-nums">{String(p.current ?? "—")} {u}</TableCell>
                <TableCell className="text-right tabular-nums">{String(p.target ?? "—")} {u}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.changes === false ? "No change" : `${difference.startsWith("-") ? "" : "+"}${difference} ${u}`}
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.carriedOver != null ? `${String(p.carriedOver)} ${u}` : "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
