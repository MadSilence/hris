"use client";

import React, { useMemo } from "react";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Button } from "@/public/desact/src/components/ui/button";

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
  avatarColor: string;
  avatarUrl: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  custom?: Record<string, unknown>;
};

type FieldMeta = {
  id: string;
  key: string;
  label: string;
  type: string;
  isSystem: boolean;
  options?: { id: string; value: string }[];
};

type ColumnItem = { id: string; label: string; checked: boolean; group?: "system" | "other" };

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

  fieldsMeta: FieldMeta[];
  visibleColumns: ColumnItem[];
};

const formatDate = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "—");

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
    for (const f of fieldsMeta) map.set(f.id, f);
    return map;
  }, [fieldsMeta]);

  const pageIds = useMemo(() => data.map((r) => r.id), [data]);

  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someChecked = !allChecked && pageIds.some((id) => selectedIds.has(id));

  const toggleSort = (fieldId: string) => {
    if (!onSortChange) return;
    const sysKey = sysKeyFromId(fieldId);
    if (!sysKey) return;
    if (!active || active.fieldId !== sysKey) return onSortChange({ fieldId: sysKey, dir: "asc" });
    if (active.dir === "asc") return onSortChange({ fieldId: sysKey, dir: "desc" });
    return onSortChange(null);
  };

  const renderCell = (row: Row, colId: string) => {
    if (colId === "sys:first_name") {
      const name = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || row.email;
      return (
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium text-white"
            style={{ background: row.avatarColor }}
            aria-hidden
          >
            {(name[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <a className="font-medium truncate block hover:underline underline-offset-4" href={`/organization/people/${row.id}`}>
              {name}
            </a>
            <div className="text-sm text-muted-foreground truncate">{row.email || "—"}</div>
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
          return <span>{row.status || "—"}</span>;
        case "created_at":
          return <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>;
        case "updated_at":
          return <span className="text-muted-foreground">{formatDate(row.updatedAt)}</span>;
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
      case "PERSON": {
        const s = valueToString(val);
        return <span>{s ?? "—"}</span>;
      }
      case "CHECKBOX": {
        const b = typeof val === "boolean" ? val : val === "true";
        return <Checkbox checked={!!b} disabled aria-label="checked"/>;
      }
      case "NUMBER": {
        const n = typeof val === "number" ? val : Number(val);
        return isNaN(n) ? <span>—</span> : <span>{Intl.NumberFormat().format(n)}</span>;
      }
      case "DATE": {
        const s = typeof val === "string" ? val : null;
        return <span className="text-muted-foreground">{formatDate(s)}</span>;
      }
      case "SELECT": {
        const s = valueToString(val);
        return <span>{s ?? "—"}</span>;
      }
      case "MULTI_SELECT": {
        const arr = Array.isArray(val) ? (val as unknown[]).map(String) : [];
        if (!arr.length) return <span>—</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {arr.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="inline-flex items-center rounded-md border border-brown-200 bg-brown-50 px-2 py-0.5 text-xs text-muted-foreground"
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
    <div className="w-full">
      <Table className="bg-background">
        <TableHeader className="[&_tr]:border-brown-200">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={(checked) => onToggleAllOnPage?.(pageIds, checked === true)}
                aria-label="select all"
                disabled={isLoading || pageIds.length === 0}
              />
            </TableHead>

            {visibleColumns.map((c, idx) => {
              const isSortable = !!sysKeyFromId(c.id);
              const sysKey = sysKeyFromId(c.id);
              const isActive = !!active && !!sysKey && active.fieldId === sysKey;

              return (
                <TableHead
                  key={c.id}
                  className={[
                    "align-middle",
                    isSortable ? "cursor-pointer select-none" : "",
                    idx === 0 ? "min-w-[280px]" : "",
                  ].join(" ")}
                  onClick={() => isSortable && toggleSort(c.id)}
                  title={isSortable ? "Sort" : undefined}
                >
                  <span className="inline-flex items-center gap-2 text-foreground hover:underline underline-offset-4">
                    {c.label}
                    {isActive ? <span aria-hidden className="text-muted-foreground">{active!.dir === "asc" ? "↑" : "↓"}</span> : null}
                  </span>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="border-brown-200">
                <TableCell className="text-muted-foreground">Loading…</TableCell>
                <TableCell/>
                <TableCell/>
                <TableCell/>
              </TableRow>
            ))}

          {!isLoading && data.length === 0 && (
            <TableRow className="border-brown-200">
              <TableCell colSpan={visibleColumns.length + 1} className="py-10">
                <EmptyState/>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            data.length > 0 &&
            data.map((u) => {
              const checked = selectedIds.has(u.id);
              return (
                <TableRow
                  key={u.id}
                  className="border-brown-200 hover:bg-brown-50"
                  data-state={checked ? "selected" : undefined}
                >
                  <TableCell className="w-12 align-middle">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => onToggleOne?.(u.id, v === true)}
                      aria-label="select row"
                    />
                  </TableCell>

                  {visibleColumns.map((c, idx) => (
                    <TableCell key={c.id} className={idx === 0 ? "py-3 align-middle" : "align-middle"}>
                      {renderCell(u, c.id)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">page size: {pageInfo?.pageSize ?? 100}</div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" disabled={!pageInfo?.hasPrev || isLoading} onClick={onPrevPage}>
            Prev
          </Button>
          <Button size="sm" disabled={!pageInfo?.hasNext || isLoading} onClick={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col gap-2 items-center text-center">
    <div className="font-medium">No people to show</div>
    <div className="text-sm text-muted-foreground">Try changing filters or come back later.</div>
  </div>
);

function sysKeyFromId(id: string): string | null {
  if (!id.startsWith("sys:")) return null;
  const key = id.slice(4);
  return key || null;
}

function valueToString(v: unknown): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map(String).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
