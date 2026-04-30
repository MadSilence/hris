"use client";

import React, { useMemo } from "react";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage, } from "@/public/desact/src/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/public/desact/src/components/ui/badge";
import { FieldMeta } from "@/components/modules/organization/components/PeopleTopbar";

type SortDir = "asc" | "desc";
type SortState = { fieldId: string; dir: SortDir } | null;

type Row = {
  id: string;
  companyId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string | null;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  avatarUrl: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  custom?: Record<string, unknown>;
};

type ColumnItem = {
  id: string;
  label: string;
  checked: boolean;
  group?: "system" | "other";
};

type PeopleTableProps = {
  data?: Row[];
  isLoading?: boolean;
  pageInfo?: { pageSize: number; hasNext: boolean; hasPrev: boolean };
  onNextPage?: () => void;
  onPrevPage?: () => void;
  sort?: SortState;
  onSortChange?: (next: SortState) => void;
  selectedIds?: Set<string>;
  onToggleOne?: (id: string, checked: boolean) => void;
  onToggleAllOnPage?: (ids: string[], checked: boolean) => void;
  fieldsMeta?: FieldMeta[];
  visibleColumns: ColumnItem[];
};

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "—";

export default function PeopleTable({
  data = [],
  isLoading = false,
  pageInfo,
  onNextPage,
  onPrevPage,
  sort = { fieldId: "last_name", dir: "asc" },
  onSortChange,
  selectedIds = new Set(),
  onToggleOne,
  onToggleAllOnPage,
  fieldsMeta,
  visibleColumns,
}: PeopleTableProps) {
  const active = sort;

  const metaById = useMemo(() => {
    const map = new Map<string, FieldMeta>();
    // @ts-ignore
    for (const f of fieldsMeta) map.set(f.id, f);
    return map;
  }, [fieldsMeta]);

  const pageIds = useMemo(() => data.map((r) => r.id), [data]);

  const allChecked =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const someChecked =
    !allChecked && pageIds.some((id) => selectedIds.has(id));

  const toggleSort = (fieldId: string) => {
    if (!onSortChange) return;

    const sysKey = sysKeyFromId(fieldId);
    if (!sysKey) return;

    if (!active || active.fieldId !== sysKey) {
      onSortChange({ fieldId: sysKey, dir: "asc" });
      return;
    }

    if (active.dir === "asc") {
      onSortChange({ fieldId: sysKey, dir: "desc" });
      return;
    }

    onSortChange(null);
  };

  const renderCell = (row: Row, colId: string) => {
    if (colId === "sys:first_name") {
      const name =
        [row.firstName, row.lastName].filter(Boolean).join(" ").trim() ||
        row.email;

      return (
        <div className="flex min-w-[260px] items-center gap-3">
          <Avatar className="size-8 shrink-0">
            {row.avatarUrl ? (
              <AvatarImage src={row.avatarUrl} alt={name}/>
            ) : null}
            <AvatarFallback className="text-xs font-medium">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <Link
              href={`/organization/people/${row.id}/personal`}
              className="block truncate font-medium text-foreground no-underline"
            >
              {name}
            </Link>
            <div className="truncate text-sm text-muted-foreground">
              {row.email || "—"}
            </div>
          </div>
        </div>
      );
    }

    const sysKey = sysKeyFromId(colId);

    if (sysKey) {
      switch (sysKey) {
        case "email":
          return <span>{row.email || "—"}</span>;
        case "status":
          return row.status ? <Badge variant="secondary">{String(row.status).toLowerCase()}</Badge> : <span>"—"</span>;
        case "created_at":
          return (
            <span className="text-muted-foreground">
              {formatDate(row.createdAt)}
            </span>
          );
        case "updated_at":
          return (
            <span className="text-muted-foreground">
              {formatDate(row.updatedAt)}
            </span>
          );
        case "last_name":
          return <span>{row.lastName || "—"}</span>;
        case "first_name":
          return <span>{row.firstName || "—"}</span>;
        default:
          return <span>—</span>;
      }
    }

    const val = row.custom?.[colId];
    const meta = metaById.get(colId);

    if (!meta) return <span>—</span>;

    switch (meta.type) {
      case "TEXT":
      case "EMAIL":
      case "URL":
      case "STATUS":
      case "PERSON":
      case "SELECT":
        return <span>{valueToString(val) ?? "—"}</span>;

      case "CHECKBOX": {
        const checked = typeof val === "boolean" ? val : val === "true";
        return <Checkbox checked={checked} disabled aria-label="checked"/>;
      }

      case "NUMBER": {
        const n = typeof val === "number" ? val : Number(val);
        return Number.isNaN(n) ? (
          <span>—</span>
        ) : (
          <span>{Intl.NumberFormat().format(n)}</span>
        );
      }

      case "DATE": {
        const s = typeof val === "string" ? val : null;
        return (
          <span className="text-muted-foreground">
            {formatDate(s)}
          </span>
        );
      }

      case "MULTI_SELECT": {
        const arr = Array.isArray(val) ? val.map(String) : [];

        if (!arr.length) return <span>—</span>;

        return (
          <div className="flex flex-wrap gap-1.5">
            {arr.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        );
      }

      default:
        return <span>{valueToString(val) ?? "—"}</span>;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(checked) =>
                    onToggleAllOnPage?.(pageIds, checked === true)
                  }
                  aria-label="select all"
                  disabled={isLoading || pageIds.length === 0}
                />
              </TableHead>

              {visibleColumns.map((column) => {
                const sysKey = sysKeyFromId(column.id);
                const isSortable = !!sysKey;
                const isActive =
                  !!active && !!sysKey && active.fieldId === sysKey;

                return (
                  <TableHead
                    key={column.id}
                    onClick={() => isSortable && toggleSort(column.id)}
                    title={isSortable ? "Sort" : undefined}
                    className={isSortable ? "cursor-pointer select-none" : undefined}
                  >
                    <span className="inline-flex items-center gap-2 text-foreground underline-offset-4 hover:underline">
                      {column.label}
                      {isActive ? (
                        <span className="text-muted-foreground" aria-hidden>
                          {active.dir === "asc" ? "↑" : "↓"}
                        </span>
                      ) : null}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell className="text-muted-foreground">
                    Loading…
                  </TableCell>
                  <TableCell/>
                  <TableCell/>
                  <TableCell/>
                </TableRow>
              ))
              : null}

            {!isLoading && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + 1}
                >
                  <EmptyState/>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? data.map((row) => {
                const checked = selectedIds.has(row.id);

                return (
                  <TableRow
                    key={row.id}
                    data-state={checked ? "selected" : undefined}
                  >
                    <TableCell className="w-12">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          onToggleOne?.(row.id, v === true)
                        }
                        aria-label="select row"
                      />
                    </TableCell>

                    {visibleColumns.map((column) => (
                      <TableCell key={column.id}>
                        {renderCell(row, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Page size: {pageInfo?.pageSize ?? 100}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!pageInfo?.hasPrev || isLoading}
            onClick={onPrevPage}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!pageInfo?.hasNext || isLoading}
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="font-medium">No people to show</div>
    <div className="text-sm text-muted-foreground">
      Try changing filters or come back later.
    </div>
  </div>
);

function sysKeyFromId(id: string): string | null {
  if (!id.startsWith("sys:")) return null;
  return id.slice(4) || null;
}

function valueToString(v: unknown): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map(String).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function initialsOf(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return initials || "?";
}
