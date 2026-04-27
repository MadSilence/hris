"use client";

import React, { useState } from "react";
import styles from "./JobLevelCard.module.css";
import Kebab from "@/components/ui/Kebab/Kebab";
import { JobLevelGroup } from "@/models/job";
import { Button } from "@/public/desact/src/components/ui/button";

type Props = {
  group: JobLevelGroup;
};

export const JobLevelCard: React.FC<Props> = ({ group }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const sortedLevels = [...group.levels].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return (
    <article className={styles.card}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{group.name}</h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Kebab
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Job level group actions"
          />
        </Button>

        {menuOpen && (
          <div
            className={styles.menu}
            role="menu"
            aria-label="Job level group actions"
          >
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              Edit
            </button>

            <button
              type="button"
              className={`${styles.menuItem} ${styles.danger}`}
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </header>

      <ul className={styles.levelsList}>
        {sortedLevels.map((level, index) => (
          <li key={level.id} className={styles.levelItem}>
            <span className={styles.levelIndex}>{index + 1}.</span>
            <span className={styles.levelName}>{level.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};
