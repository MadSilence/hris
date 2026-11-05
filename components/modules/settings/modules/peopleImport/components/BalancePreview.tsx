"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/desact/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/desact/table";
import { ErrorState } from "@/components/feedback/ErrorState";
import { usePeopleImportRows } from "@/components/modules/settings/modules/peopleImport/hooks";


/**
 * Per row *current → target (difference)* before anything is booked (IMPORT_NEXT_DESIGN.md § 3.3): an
 * up-front grant or an accrual already booked makes a surprising difference visible here, not after.
 */
export const BalancePreview: React.FC<{ importId: string }> = ({ importId }) => {
  const t = useTranslations("peopleImport");
  const rows = usePeopleImportRows(importId, false);
  if (rows.isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.error) return <ErrorState error={rows.error} compact onRetry={() => void rows.refetch()} />;

  return (
    <div className="max-h-80 overflow-auto rounded-control border border-divider">
      <Table className="text-body">
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">{t("balancePreview.row")}</TableHead>
            <TableHead>{t("balancePreview.person")}</TableHead>
            <TableHead>{t("balancePreview.asOf")}</TableHead>
            <TableHead className="text-right">{t("balancePreview.now")}</TableHead>
            <TableHead className="text-right">{t("balancePreview.target")}</TableHead>
            <TableHead className="text-right">{t("balancePreview.difference")}</TableHead>
            <TableHead className="text-right">{t("balancePreview.carriedOver")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(rows.data ?? []).map((row) => {
            const p = row.preview ?? {};
            const unit = t(p.unit === "HOURS" ? "balancePreview.unitHours" : "balancePreview.unitDays");
            const amount = (value: unknown) => t("balancePreview.amount", { value: String(value ?? "—"), unit });
            const difference = String(p.difference ?? "0");
            return (
              <TableRow key={row.rowNumber} className="hover:bg-transparent">
                <TableCell className="tabular-nums text-tertiary">{row.rowNumber}</TableCell>
                <TableCell>{row.name ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{String(p.asOf ?? "—")}</TableCell>
                <TableCell className="text-right tabular-nums">{amount(p.current)}</TableCell>
                <TableCell className="text-right tabular-nums">{amount(p.target)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {p.changes === false ? t("balancePreview.noChange") : amount(`${difference.startsWith("-") ? "" : "+"}${difference}`)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{p.carriedOver != null ? amount(p.carriedOver) : "—"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
