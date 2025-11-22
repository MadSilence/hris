"use client";

import React from "react";
import styles from "./DateSettings.module.css";

type DateSettingsProps = {
  hideYearPublic: boolean;
  onChangeHideYearPublic: (v: boolean) => void;
};

export const DateSettings: React.FC<DateSettingsProps> = ({
  hideYearPublic,
  onChangeHideYearPublic,
}) => {
  const id = React.useId();

  return (
    <div className={styles.rowCheckbox}>
      <label className={styles.checkboxLabel} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={hideYearPublic}
          onChange={(e) => onChangeHideYearPublic(e.currentTarget.checked)}
        />
        <span>Hide year from public</span>
      </label>
    </div>
  );
};
