import React, { useMemo } from "react";
import Button from "@/components/ui/Button/Button";
import UserChip from "@/components/ui/UserChip/UserChip";
import UserStatus from "@/components/ui/UserStatus/UserStatus";
import styles from "./PeopleTable.module.css";

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

const PeopleTable: React.FC<PeopleTableProps> = ({
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
}) => {
  const active = sort;

  const metaById = useMemo(() => {
    const map = new Map<string, FieldMeta>();
    for (const f of fieldsMeta) map.set(f.id, f);
    return map;
  }, [fieldsMeta]);

  // список id на странице (для чекбокса "выбрать все")
  const pageIds = useMemo(() => data.map((r) => r.id), [data]);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someChecked = !allChecked && pageIds.some((id) => selectedIds.has(id));

  const toggleSort = (fieldId: string) => {
    if (!onSortChange) return;
    const sysKey = sysKeyFromId(fieldId);
    if (!sysKey) return; // attr:* пока не сортируем
    if (!active || active.fieldId !== sysKey) return onSortChange({ fieldId: sysKey, dir: "asc" });
    if (active.dir === "asc") return onSortChange({ fieldId: sysKey, dir: "desc" });
    return onSortChange(null);
  };

  const renderCell = (row: Row, colId: string) => {
    if (colId === "sys:first_name") {
      const name = [row.firstName, row.lastName].filter(Boolean).join(" ").trim() || row.email;
      return <UserChip name={name} href={`/organization/people/${row.id}`} color={row.avatarColor}/>;
    }

    // системные поля
    const sysKey = sysKeyFromId(colId);
    if (sysKey) {
      switch (sysKey) {
        case "email":
          return <span>{row.email || "—"}</span>;
        case "status":
          return <UserStatus status={row.status ?? ""}/>;
        case "created_at":
          return <span>{formatDate(row.createdAt)}</span>;
        case "updated_at":
          return <span>{formatDate(row.updatedAt)}</span>;
        case "last_name":
          return <span>{row.lastName || "—"}</span>;
        case "first_name":
          return <span>{row.firstName || "—"}</span>;
        default:
          return <span>—</span>;
      }
    }

    // кастомные attr:*
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
        const b = typeof val === "boolean" ? val : (val === "true");
        return <input type="checkbox" checked={!!b} readOnly aria-label="checked"/>;
      }
      case "NUMBER": {
        const n = typeof val === "number" ? val : Number(val);
        return isNaN(n) ? <span>—</span> : <span>{Intl.NumberFormat().format(n)}</span>;
      }
      case "DATE": {
        const s = typeof val === "string" ? val : null;
        return <span>{formatDate(s)}</span>;
      }
      case "SELECT": {
        const s = valueToString(val);
        return <span>{s ?? "—"}</span>;
      }
      case "MULTI_SELECT": {
        const arr = Array.isArray(val) ? (val as unknown[]).map(String) : [];
        if (!arr.length) return <span>—</span>;
        return (
          <div className={styles.tagsCell}>
            {arr.map((t, i) => (
              <span key={i} className={styles.tagChip}>{t}</span>
            ))}
          </div>
        );
      }
      default:
        return <span>{valueToString(val) ?? "—"}</span>;
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.tableWrapper}>
        <table className={styles.table} role="table">
          <thead className={styles.thead}>
          <tr>
            {/* селектор "все" */}
            <th className={`${styles.th} ${styles.thCheckbox}`}>
              <input
                type="checkbox"
                aria-label="select all"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={(e) => onToggleAllOnPage?.(pageIds, e.target.checked)}
              />
            </th>

            {visibleColumns.map((c, idx) => {
              const isSortable = !!sysKeyFromId(c.id);
              const isActive = active && sysKeyFromId(c.id) === active.fieldId;
              const arrow = isActive ? (active!.dir === "asc" ? "▲" : "▼") : "";
              return (
                <th
                  key={c.id}
                  className={`${styles.th} ${isSortable ? styles.thSortable : ""} ${idx === 0 ? styles.firstCol : ""}`}
                  onClick={() => isSortable && toggleSort(c.id)}
                  title={isSortable ? "Sort" : undefined}
                >
                  {c.label}
                  {arrow && <span className={styles.sortIcon}>{arrow}</span>}
                </th>
              );
            })}
          </tr>
          </thead>

          <tbody>
          {isLoading ? (
            <tr>
              <td className={styles.td} colSpan={visibleColumns.length + 1}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "2.5rem 0" }}>
                  {/*<Loader />*/}
                  <span>Loading…</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td className={styles.td} colSpan={visibleColumns.length + 1}>
                <EmptyState/>
              </td>
            </tr>
          ) : (
            data.map((u) => {
              const checked = selectedIds.has(u.id);
              return (
                <tr key={u.id} className={`${styles.tbodyRow} ${checked ? styles.rowSelected : ""}`}>
                  <td className={`${styles.td} ${styles.tdCheckbox}`}>
                    <input
                      type="checkbox"
                      aria-label="select row"
                      checked={checked}
                      onChange={(e) => onToggleOne?.(u.id, e.target.checked)}
                    />
                  </td>
                  {visibleColumns.map((c, idx) => (
                    <td key={c.id} className={`${styles.td} ${idx === 0 ? styles.firstCol : ""}`}>
                      {renderCell(u, c.id)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerMeta}>page size: {pageInfo?.pageSize ?? 100}</div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button size="sm" variant="secondary" disabled={!pageInfo?.hasPrev || isLoading} onClick={onPrevPage}>Prev</Button>
          <Button size="sm" disabled={!pageInfo?.hasNext || isLoading} onClick={onNextPage}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default PeopleTable;

const EmptyState: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", textAlign: "center", padding: "2.5rem 0" }}>
    <div style={{ fontWeight: 500 }}>No people to show</div>
    <div style={{ color: "var(--text-disabled)", fontSize: "var(--font-size-sm)" }}>
      Try changing filters or come back later.
    </div>
  </div>
);

// helpers
function sysKeyFromId(id: string): string | null {
  if (!id.startsWith("sys:")) return null;
  const key = id.slice(4); // first_name | last_name | email | ...
  return key || null;
}

function valueToString(v: unknown): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v.map(String).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
