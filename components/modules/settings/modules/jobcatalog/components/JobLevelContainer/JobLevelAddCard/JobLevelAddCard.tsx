"use client";

import React from "react";
import styles from "./JobLevelAddCard.module.css";

type Props = {
  onClick: () => void;
};

export const JobLevelAddCard: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label="Add job level group"
    >
      <div className={styles.inner}>
        <div className={styles.circle}>
          <span className={styles.plus}>+</span>
        </div>
      </div>
    </button>
  );
};
