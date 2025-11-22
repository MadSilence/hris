"use client";

import React from "react";
import styles from "./UniqueSelect.module.css";

type UniqueSelectProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

export const UniqueSelect: React.FC<UniqueSelectProps> = ({
  checked,
  onChange
}) => {
  return (
    <div className={styles.rowCheckbox}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.currentTarget.checked)}
        />
        <span>Unique</span>
      </label>
    </div>
  );
};
