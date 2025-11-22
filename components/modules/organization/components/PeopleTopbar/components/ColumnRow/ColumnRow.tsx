import React from "react";
import styles from "./ColumnRow.module.css";
import { ColumnItem } from "@/models/userTable";

type ColumnRowProps = {
  item: ColumnItem;
  limitReached: boolean;
  onToggle: (checked: boolean) => void;
};

export const ColumnRow: React.FC<ColumnRowProps> = ({
  item,
  limitReached,
  onToggle
}) => {
  const disabled = item.disabled || (limitReached && !item.checked);

  return (
    <div className={`${styles.itemRow} ${disabled ? styles.disabled : ""}`}>
      <div className={styles.itemLabel}>
        {item.icon ?? <span>•</span>}
        <span title={item.label}>{item.label}</span>
      </div>
      <label className={styles.switch} aria-disabled={disabled}>
        <input
          type="checkbox"
          checked={item.checked}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className={styles.knob}/>
      </label>
    </div>
  );
};
