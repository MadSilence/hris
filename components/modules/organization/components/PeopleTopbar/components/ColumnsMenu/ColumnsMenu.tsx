import React, { useMemo, useState } from "react";
import styles from "./ColumnsMenu.module.css";
import { ColumnRow } from "@/components/modules/organization/components/PeopleTopbar/components/ColumnRow";
import { ColumnItem } from "@/models/userTable";

type ColumnsMenuProps = {
  columns: ColumnItem[];
  selectedColumns: number;
  maxColumns: number;
  onColumnsChange?: (next: ColumnItem[]) => void;
  onClose: () => void;
}

export const ColumnsMenu: React.FC<ColumnsMenuProps> = ({
  columns,
  selectedColumns,
  maxColumns,
  onColumnsChange,
  onClose
}) => {
  const [colSearch, setColSearch] = useState("");

  const filtered = useMemo(() => {
    const q = colSearch.trim().toLowerCase();
    if (!q) return columns;
    return columns.filter((c) => c.label.toLowerCase().includes(q));
  }, [columns, colSearch]);

  const visibleSystem = filtered.filter((c) => (c.group ?? "other") === "system");
  const visibleOther = filtered.filter((c) => (c.group ?? "other") === "other");

  const limitReached = (c: ColumnItem) => selectedColumns >= maxColumns && !c.checked;

  const toggleItem = (id: string, checked: boolean) => {
    if (!onColumnsChange) return;
    const next = columns.map((x) => (x.id === id ? { ...x, checked } : x));
    onColumnsChange(next);
  };

  return (
    <div className={styles.menuPopup} onMouseLeave={onClose} role="menu" aria-label="Columns menu">
      <div className={styles.popupHeader}>
        <input
          className={styles.searchInput}
          placeholder="Search for attributes"
          value={colSearch}
          onChange={(e) => setColSearch(e.target.value)}
        />
        <span className={styles.badge} aria-live="polite">
          {selectedColumns} / {maxColumns}
        </span>
      </div>

      <div className={styles.popupBody}>
        <div className={styles.sectionTitle}>Columns</div>
        {visibleSystem.map((c) => (
          <ColumnRow
            key={c.id}
            item={c}
            limitReached={limitReached(c)}
            onToggle={(checked) => toggleItem(c.id, checked)}
          />
        ))}

        <div className={styles.sectionTitle}>Other attributes</div>
        {visibleOther.length === 0 && (
          <div className={styles.emptyNote}>No attributes found</div>
        )}
        {visibleOther.map((c) => (
          <ColumnRow
            key={c.id}
            item={c}
            limitReached={limitReached(c)}
            onToggle={(checked) => toggleItem(c.id, checked)}
          />
        ))}

        <div className={styles.spacer8}/>
        <button className={styles.link} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
