"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./RolesTable.module.css";
import { Role } from "@/models/role/Role";

export type RoleRow = {
    id: string;
    name: string;
    membersCount: number;
    updatedAt: string;              // ISO date
    updatedBy: { id: string; name: string };
};

type SortKey = "name" | "active" | "createdAt" | "updatedAt";
type SortDir = "asc" | "desc";
type SortState = { key: SortKey; dir: SortDir } | null;

export interface RolesTableProps {
  /** Data from useRoles() */
  rows: Role[] | undefined;
  /** Loading state from useRoles() */
  isLoading?: boolean;
  /** Optional action area (e.g., “Create role”) */
  actions?: React.ReactNode;
  /** Initial sort (default: name asc) */
  initialSort?: SortState;
  /** Build hrefs for role name cells */
  buildRoleHref?: (roleId: string) => string;
  /** Called when the user clears sorting */
  onClearSort?: () => void;
}

const headerLabels: Record<SortKey, string> = {
  name: "Role",
  active: "Active",
  createdAt: "Created",
  updatedAt: "Last updated",
};

export default function RolesTable({
                                     rows,
                                     isLoading = false,
                                     actions,
                                     initialSort = { key: "name", dir: "asc" },
                                     buildRoleHref = (id) => `/settings/roles/${id}`,
                                     onClearSort,
                                   }: RolesTableProps) {
  const [sort, setSort] = React.useState<SortState>(initialSort);
  const [openMenu, setOpenMenu] = React.useState<SortKey | null>(null);

  // close menu on outside click
  React.useEffect(() => {
    if (!openMenu) return;
    const onDocClick = () => setOpenMenu(null);
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openMenu]);

  const onHeaderClick = (key: SortKey) => {
    setOpenMenu((k) => (k === key ? null : key));
  };

  const sorted = React.useMemo(() => {
    const data = rows ?? [];
    if (!sort) return data;
    const { key, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;

    return [...data].sort((a, b) => {
      switch (key) {
        case "name":
          return a.name.localeCompare(b.name) * mul;
        case "active":
          // true > false for asc
          return ((a.active ? 1 : 0) - (b.active ? 1 : 0)) * mul;
        case "createdAt":
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
            mul
          );
        case "updatedAt":
          return (
            (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
            mul
          );
      }
    });
  }, [rows, sort]);

  const hasData = (rows?.length ?? 0) > 0;

  return (
    <div className={styles.block}>
      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>Roles</div>

        {sort && (
          <button
            className={styles.sortChip}
            onClick={() => {
              setSort(null);
              onClearSort?.();
            }}
            aria-label="Clear sorting"
          >
            ↑ Sorted by {headerLabels[sort.key]}
            <span className={styles.sortChipClose} aria-hidden>
              ×
            </span>
          </button>
        )}

        <div className={styles.toolbarActions}>{actions}</div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
          <tr>
            {(["name", "active", "createdAt", "updatedAt"] as SortKey[]).map(
              (key) => {
                const isActive = sort?.key === key;
                return (
                  <th key={key} className={styles.th}>
                    <button
                      type="button"
                      className={`${styles.sortBtn} ${
                        isActive ? styles.sortBtnActive : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHeaderClick(key);
                      }}
                      aria-haspopup="menu"
                      aria-expanded={openMenu === key}
                    >
                      {headerLabels[key]}
                      {isActive && (
                        <span className={styles.sortGlyph} aria-hidden>
                            {sort!.dir === "asc" ? "↑" : "↓"}
                          </span>
                      )}
                    </button>

                    {openMenu === key && (
                      <div
                        role="menu"
                        className={styles.sortMenu}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.sortItem}
                          onClick={() => {
                            setSort({ key, dir: "asc" });
                            setOpenMenu(null);
                          }}
                        >
                          Sort ascending
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className={styles.sortItem}
                          onClick={() => {
                            setSort({ key, dir: "desc" });
                            setOpenMenu(null);
                          }}
                        >
                          Sort descending
                        </button>
                      </div>
                    )}
                  </th>
                );
              }
            )}
          </tr>
          </thead>

          <tbody>
          {/* loading: skeleton rows */}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className={styles.tr}>
                <td className={`${styles.td} ${styles.skeleton}`} />
                <td className={`${styles.td} ${styles.skeleton}`} />
                <td className={`${styles.td} ${styles.skeleton}`} />
                <td className={`${styles.td} ${styles.skeleton}`} />
              </tr>
            ))}

          {/* data */}
          {!isLoading &&
            hasData &&
            sorted.map((r) => (
              <tr key={r.id} className={styles.tr}>
                <td className={styles.td}>
                  <Link href={buildRoleHref(r.id)} className={styles.cellLink}>
                    {r.name}
                  </Link>
                  {r.systemOwner && (
                    <span className={styles.badge} aria-label="System role">
                        System
                      </span>
                  )}
                </td>
                <td className={styles.td}>
                    <span
                      className={`${styles.statusDot} ${
                        r.active ? styles.statusOn : styles.statusOff
                      }`}
                      aria-hidden
                    />
                  {r.active ? "Active" : "Inactive"}
                </td>
                <td className={styles.td}>{formatDate(r.createdAt)}</td>
                <td className={styles.td}>{formatDate(r.updatedAt)}</td>
              </tr>
            ))}

          {/* empty */}
          {!isLoading && !hasData && (
            <tr className={styles.tr}>
              <td className={styles.td} colSpan={4}>
                <div className={styles.empty}>
                  <div className={styles.emptyTitle}>No roles yet</div>
                  <div className={styles.emptySub}>
                    Create your first role to get started.
                  </div>
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* helpers */
function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
