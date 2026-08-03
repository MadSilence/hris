"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/public/desact/src/components/ui/table";
import { Badge } from "@/public/desact/src/components/ui/badge";
import UserChip from "@/components/modules/settings/shared/UserChip/UserChip";
import { formatUserStatus, isActiveStatus } from "@/models/user/status";
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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
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
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
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
    for (const f of fieldsMeta ?? []) map.set(f.id, f);
    return map;
  }, [fieldsMeta]);

  const pageIds = useMemo(() => data.map((r) => r.id), [data]);

  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someChecked = !allChecked && pageIds.some((id) => selectedIds.has(id));

  // Infinite scroll: load the next page when the sentinel nears the bottom of the scroll area.
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && onLoadMore?.(),
      { root, rootMargin: "300px" },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [hasMore, onLoadMore, data.length]);

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
        [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || row.email;

      return (
        <UserChip
          id={row.id}
          name={name}
          avatarUrl={row.avatarUrl}
          firstName={row.firstName}
          lastName={row.lastName}
        />
      );
    }

    const sysKey = sysKeyFromId(colId);

    if (sysKey) {
      switch (sysKey) {
        case "email":
          return <span>{row.email || "—"}</span>;
        case "status":
          return <StatusBadge status={row.status} />;
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
      case "PERSON":
      case "SELECT":
        return <span>{valueToString(val) ?? "—"}</span>;

      case "CHECKBOX": {
        const checked = typeof val === "boolean" ? val : val === "true";
        return <Checkbox checked={checked} disabled aria-label="checked" />;
      }

      case "NUMBER": {
        const n = typeof val === "number" ? val : Number(val);
        return Number.isNaN(n) ? <span>—</span> : <span>{Intl.NumberFormat().format(n)}</span>;
      }

      case "DATE": {
        const s = typeof val === "string" ? val : null;
        return <span className="text-muted-foreground">{formatDate(s)}</span>;
      }

      case "MULTI_SELECT": {
        const arr = Array.isArray(val) ? val.map(String) : [];
        if (!arr.length) return <span>—</span>;
        return (
          <span className="text-muted-foreground">{arr.join(", ")}</span>
        );
      }

      default:
        return <span>{valueToString(val) ?? "—"}</span>;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-auto bg-background"
    >
      <table className="w-full caption-bottom text-sm table-fixed">
        <TableHeader className="sticky top-0 z-10 bg-background [&_tr]:border-brown-200">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={(checked) => onToggleAllOnPage?.(pageIds, checked === true)}
                aria-label="select all"
                disabled={isLoading || pageIds.length === 0}
              />
            </TableHead>

            {visibleColumns.map((column) => {
              const sysKey = sysKeyFromId(column.id);
              const isSortable = !!sysKey;
              const isActive = !!active && !!sysKey && active.fieldId === sysKey;

              return (
                <TableHead
                  key={column.id}
                  onClick={() => isSortable && toggleSort(column.id)}
                  title={isSortable ? column.label : undefined}
                  className={`truncate ${isSortable ? "cursor-pointer select-none" : ""}`}
                >
                  <span className="inline-flex max-w-full items-center gap-1 align-middle text-foreground">
                    <span className="truncate">{column.label}</span>
                    {isActive ? (
                      <span className="shrink-0 text-muted-foreground" aria-hidden>
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
            ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-brown-200 [&_td]:py-2">
                  <TableCell className="w-12" />
                  {visibleColumns.map((c) => (
                    <TableCell key={c.id}>
                      <div className="h-4 w-2/3 animate-pulse rounded bg-brown-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {!isLoading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 1}>
                <EmptyState />
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
                    className="border-brown-200 hover:bg-brown-50 [&_td]:py-2"
                  >
                    <TableCell className="w-12">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onToggleOne?.(row.id, v === true)}
                        aria-label="select row"
                      />
                    </TableCell>

                    {visibleColumns.map((column) => (
                      <TableCell key={column.id} className="truncate">
                        {renderCell(row, column.id)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            : null}
        </TableBody>
      </table>

      {/* Infinite-scroll sentinel + loading indicator */}
      <div ref={sentinelRef} />
      {isLoadingMore ? (
        <div className="py-3 text-center text-sm text-muted-foreground">Loading more…</div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const label = formatUserStatus(status);
  const active = isActiveStatus(status);
  return (
    <Badge
      variant={active ? "outline" : "secondary"}
      className={active ? "border-green-200 bg-green-50 text-green-700" : ""}
    >
      {label}
    </Badge>
  );
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 py-10 text-center">
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
