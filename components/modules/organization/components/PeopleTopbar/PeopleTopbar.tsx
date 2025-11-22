"use client";

import React, { useMemo, useState } from "react";
import styles from "./PeopleTopbar.module.css";
import { Filter } from "@/components/models/filters";
import { ColumnItem } from "@/models/userTable";
import { countSelectedColumns } from "./utils/utils";
import { ColumnsMenu } from "./components/ColumnsMenu";
import { FiltersMenu } from "./components/FiltersMenu";
import { ImportMenu } from "./components/ImportMenu";

export type FieldMeta = {
  id: string;               // "sys:*" | "attr:<uuid>"
  key?: string;
  label?: string;
  type: "TEXT" | "EMAIL" | "URL" | "STATUS" | "SELECT" | "MULTI_SELECT" | "NUMBER" | "DATE" | "CHECKBOX" | "PERSON";
  isSystem?: boolean;
  options?: { id: string; value: string }[];
};

const MAX_COLUMNS = 25;

type PeopleTopbarProps = {
  totalCount?: number;
  query: string;
  onQueryChange: (v: string) => void;

  columns: ColumnItem[];
  onColumnsChange?: (next: ColumnItem[]) => void;

  filters: Filter[];
  onFiltersChange: (next: Filter[]) => void;

  fieldsMeta: FieldMeta[];                 // ⬅️ добавили
  onExport?: () => void;
  selectedCount?: number;
};

const PeopleTopbar: React.FC<PeopleTopbarProps> = ({
  totalCount,
  query,
  onQueryChange,
  columns,
  onColumnsChange,
  filters,
  onFiltersChange,
  fieldsMeta,
  onExport,
  selectedCount,
}) => {
  const [openMenu, setOpenMenu] = useState<null | "columns" | "filters" | "add">(null);
  const selectedColumns = useMemo(() => countSelectedColumns(columns), [columns]);

  const toggle = (id: typeof openMenu) => setOpenMenu((cur) => (cur === id ? null : id));
  const closeAll = () => setOpenMenu(null);

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <div className={styles.view}>
          Default
          {selectedCount ? <span className={styles.badge} style={{ marginLeft: 8 }}>{selectedCount} selected</span> : null}
          {filters.length > 0 && (
            <span className={styles.filterBadge} role="status" aria-live="polite">
              ⛛ Filtered by {filters.length} {filters.length === 1 ? "rule" : "rules"}
              <button
                className={styles.filterBadgeClose}
                aria-label="Clear all filters"
                onClick={() => onFiltersChange([])}
              >×</button>
            </span>
          )}
        </div>

        <div className={styles.menu}>
          <button className={styles.btn} onClick={() => toggle("columns")} aria-haspopup="menu" aria-expanded={openMenu === "columns"}>
            Columns
          </button>
          {openMenu === "columns" && (
            <ColumnsMenu
              columns={columns}
              selectedColumns={selectedColumns}
              maxColumns={MAX_COLUMNS}
              onColumnsChange={onColumnsChange}
              trigger={<button className={styles.btn}>Columns ▾</button>}
              placement="bottom-start"
            />
          )}
        </div>

        <div className={styles.menu}>
          <button className={styles.btn} onClick={() => toggle("filters")} aria-haspopup="menu" aria-expanded={openMenu === "filters"}>
            Filter
          </button>
          {openMenu === "filters" && (
            <FiltersMenu
              fields={fieldsMeta}                  // ⬅️ отдаём все поля
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClose={closeAll}
            />
          )}
        </div>

        <span className={styles.counter}>{totalCount ?? 0}</span>
      </div>

      <div className={styles.right}>
        <input
          className={styles.search}
          placeholder="Search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search"
        />
        <button className={styles.btn} onClick={onExport} aria-label="Export">Export</button>

        <div className={styles.menu}>
          <button className={styles.btn} onClick={() => toggle("add")} aria-haspopup="menu" aria-expanded={openMenu === "add"}>
            Add people ▾
          </button>
          {openMenu === "add" && <ImportMenu onClose={closeAll}/>}
        </div>
      </div>
    </div>
  );
};

export default PeopleTopbar;
