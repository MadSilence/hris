import * as React from "react";
import { AttributeGroup } from "@/models/attribute/AttributeGroup";
import styles from "./PersonalInfoSidebar.module.css";

type Props = {
  groups: AttributeGroup[];
  activeId?: string | null;
  onSelect: (id: string) => void;
};

export const PersonalInfoSidebar: React.FC<Props> = ({ groups, activeId, onSelect }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.inner}>
        {groups.map((g) => {
          const isActive = g.id === activeId;
          return (
            <button
              key={g.id}
              className={`${styles.groupBtn} ${isActive ? styles.active : ""}`}
              onClick={() => onSelect(g.id)}
            >
              <span className={styles.dot} data-active={isActive} />
              <span className={styles.label}>{g.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
