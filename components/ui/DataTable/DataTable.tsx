"use client";

import React, { ReactNode, useEffect, useMemo, useRef, useState, } from "react";
import styles from "./DataTable.module.css";

export type SortDirection = "asc" | "desc";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  icon?: ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;

  onFilterClick?: () => void;
  onAddClick?: () => void;
  addLabel?: string;

  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;

  defaultSort?: {
    columnId: string;
    direction: SortDirection;
  };
  onSortChange?: (
    sort:
      | {
      columnId: string;
      direction: SortDirection;
    }
      | null
  ) => void;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  onFilterClick,
  onAddClick,
  addLabel = "Add",
  enableSearch = true,
  searchPlaceholder = "Search",
  onSearchChange,
  defaultSort,
  onSortChange,
}: DataTableProps<T>) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState<{
    columnId: string;
    direction: SortDirection;
  } | null>(defaultSort ?? null);
  const [openSortColumn, setOpenSortColumn] = useState<string | null>(null);

  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openSortColumn) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setOpenSortColumn(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSortColumn]);

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return data;
    const q = searchValue.toLowerCase();

    return data.filter((row) => {
      const values = Object.values(row as any);
      return values.some((v) =>
        typeof v === "string"
          ? v.toLowerCase().includes(q)
          : typeof v === "number"
            ? String(v).includes(q)
            : false
      );
    });
  }, [data, searchValue]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    const col = columns.find((c) => c.id === sort.columnId);
    if (!col || !col.sortable) return filteredData;

    const getVal = col.sortValue ?? ((row: any) => (row as any)[col.id]);

    const dir = sort.direction === "asc" ? 1 : -1;

    return [...filteredData].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);

      if (va == null && vb == null) return 0;
      if (va == null) return -1 * dir;
      if (vb == null) return 1 * dir;

      if (typeof va === "number" && typeof vb === "number") {
        return va === vb ? 0 : va > vb ? dir : -dir;
      }

      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa === sb) return 0;
      return sa > sb ? dir : -dir;
    });
  }, [filteredData, sort, columns]);

  const handleSortChange = (columnId: string, direction: SortDirection) => {
    const next = { columnId, direction };
    setSort(next);
    setOpenSortColumn(null);
    onSortChange?.(next);
  };

  const clearSort = () => {
    setSort(null);
    setOpenSortColumn(null);
    onSortChange?.(null);
  };

  const handleSearchToggle = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    if (!next) {
      setSearchValue("");
      onSearchChange?.("");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.filterButton}
          onClick={onFilterClick}
        >
          <span className={styles.filterIcon}>⚲</span>
          <span>Filter</span>
        </button>

        <div className={styles.toolbarRight}>
          {enableSearch && (
            <div
              className={styles.searchWrap}
              data-open={searchOpen ? "true" : "false"}
            >
              <button
                type="button"
                className={styles.searchIconButton}
                onClick={handleSearchToggle}
                aria-label="Toggle search"
              >
                <span className={styles.searchIcon}>🔍</span>
              </button>
              <input
                className={styles.searchInput}
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
              />
            </div>
          )}

          <button
            type="button"
            className={styles.addButton}
            onClick={onAddClick}
          >
            <span className={styles.addPlus}>＋</span>
            <span>{addLabel}</span>
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
          <tr>
            {columns.map((col) => {
              const isSorted =
                sort && sort.columnId === col.id ? sort.direction : null;
              const isSortable = !!col.sortable;

              return (
                <th
                  key={col.id}
                  className={`${styles.th} ${
                    isSortable ? styles.thSortable : ""
                  }`}
                >
                  <button
                    type="button"
                    className={styles.thButton}
                    onClick={
                      isSortable
                        ? () =>
                          setOpenSortColumn((prev) =>
                            prev === col.id ? null : col.id
                          )
                        : undefined
                    }
                  >
                      <span className={styles.thInner}>
                        {col.icon && (
                          <span className={styles.thIcon}>{col.icon}</span>
                        )}
                        <span className={styles.thLabel}>{col.header}</span>
                        {isSorted && (
                          <span className={styles.sortArrow}>
                            {isSorted === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </span>
                  </button>

                  {isSortable && openSortColumn === col.id && (
                    <div
                      className={styles.sortMenu}
                      ref={sortMenuRef}
                    >
                      <button
                        type="button"
                        className={styles.sortMenuItem}
                        onClick={() => handleSortChange(col.id, "asc")}
                      >
                        ↑ Sort ascending
                      </button>
                      <button
                        type="button"
                        className={styles.sortMenuItem}
                        onClick={() => handleSortChange(col.id, "desc")}
                      >
                        ↓ Sort descending
                      </button>
                      {sort && sort.columnId === col.id && (
                        <button
                          type="button"
                          className={`${styles.sortMenuItem} ${styles.sortMenuClear}`}
                          onClick={clearSort}
                        >
                          ✕ Clear sort
                        </button>
                      )}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
          </thead>

          <tbody>
          {sortedData.map((row) => {
            const rowId = getRowId(row);

            return (
              <tr key={rowId} className={styles.tr}>
                {columns.map((col) => (
                  <td key={col.id} className={styles.td}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            );
          })}

          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className={styles.empty}
              >
                No data to display.
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
