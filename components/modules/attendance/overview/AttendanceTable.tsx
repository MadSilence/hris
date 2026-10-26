"use client";

import React, { useEffect, useRef } from "react";
import { Skeleton } from "@/public/desact/src/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public/desact/src/components/ui/table";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { formatMinutes, type AttendanceReportRow } from "@/models/attendance";
import { formatAmounts } from "@/components/modules/attendance/lib";

type Props = {
  rows: AttendanceReportRow[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onOpen: (row: AttendanceReportRow) => void;
  /** Shown in the body instead of rows when there are none — the empty state belongs inside the card. */
  empty?: React.ReactNode;
};

export const personName = (p: AttendanceReportRow["person"]) =>
  `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.email || "";

type AttendanceColumn = { key: string; label: string; value: (r: AttendanceReportRow) => string };

/** The columns, in order — the table and the export preview print the same ones. */
export const ATTENDANCE_COLUMNS: readonly AttendanceColumn[] = [
  { key: "expectedDays", label: "Expected Days", value: (r) => String(r.totals.expectedDays) },
  { key: "loggedDays", label: "Logged Days", value: (r) => String(r.totals.loggedDays) },
  { key: "expectedHours", label: "Expected Hours", value: (r) => formatMinutes(r.totals.expectedMinutes) },
  { key: "loggedHours", label: "Logged Hours", value: (r) => formatMinutes(r.totals.loggedMinutes) },
  { key: "overtimeHours", label: "Overtime Hours", value: (r) => formatMinutes(r.totals.overtimeMinutes) },
];

const AMOUNT_COLUMN: AttendanceColumn = {
  key: "amount",
  label: "Amount",
  value: (r) => formatAmounts(r.totals.amounts) ?? "",
};

/**
 * The columns for these rows: the five numbers, and "Amount" only when the server sent money — it
 * sends none to a reader who may not see the rate field, or when the company prices no time. The
 * server decides; this only leaves out a column that would be blank in every row.
 */
export const attendanceColumns = (rows: AttendanceReportRow[]): readonly AttendanceColumn[] =>
  rows.some((row) => row.totals.amounts != null) ? [...ATTENDANCE_COLUMNS, AMOUNT_COLUMN] : ATTENDANCE_COLUMNS;

/**
 * The overview: one row a person, sorted by name, the numbers in `H:MM`. A row opens the person's log
 * for the same period. Paged by scrolling, like the People table.
 */
export const AttendanceTable: React.FC<Props> = ({
  rows,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onOpen,
  empty,
}) => {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const columns = attendanceColumns(rows);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) onLoadMore();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-brown-200 bg-white">
      <Table className="table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead className="w-[32%]">Name</TableHead>
            {columns.map((column) => (
              <TableHead key={column.key} className="text-right">{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }, (_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-44"/></TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}><Skeleton className="ml-auto h-4 w-12"/></TableCell>
                ))}
              </TableRow>
            ))
            : rows.length === 0 && empty
              ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length + 1}>{empty}</TableCell>
                </TableRow>
              )
              : rows.map((row) => (
                <TableRow
                  key={row.person.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  onClick={() => onOpen(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onOpen(row);
                  }}
                >
                  <TableCell>
                    <UserChip
                      name={personName(row.person)}
                      firstName={row.person.firstName}
                      lastName={row.person.lastName}
                      email={row.person.email}
                      avatarUrl={row.person.avatarUrl}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-right tabular-nums">{column.value(row)}</TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {hasNextPage && (
        <div ref={sentinel} className="py-3 text-center text-sm text-muted-foreground">
          {isFetchingNextPage ? "Loading more…" : ""}
        </div>
      )}
    </div>
  );
};
