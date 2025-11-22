"use client";
import React from "react";
import styles from "./PeopleTableToolbar.module.css";

type PeopleTableToolbarProps = {
  query: string;
  onQueryChange: (v: string) => void;
  rowsCount?: number;
  isSearching?: boolean;
};

const PeopleTableToolbar: React.FC<PeopleTableToolbarProps> = ({
  query,
  onQueryChange,
  rowsCount,
  isSearching
}) => {
  return (
    <div className={styles.root}>
      <input
        className={styles.input}
        placeholder="search by name or email"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        inputMode="search"
      />
      <button
        className={styles.clearBtn}
        onClick={() => onQueryChange("")}
        disabled={!query}
        aria-label="clear"
      >
        Clear
      </button>
      <div className={styles.meta}>
        {isSearching ? "searching…" : rowsCount !== undefined ? `${rowsCount} rows` : ""}
      </div>
    </div>
  );
};

export default PeopleTableToolbar;
