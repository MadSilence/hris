import React from "react";
import styles from "./ImportMenu.module.css";

type ImportMenuProps = {
  onClose: () => void;
};

export const ImportMenu: React.FC<ImportMenuProps> = ({ onClose }) => {
  return (
    <div className={styles.menuPopup} onMouseLeave={onClose} role="menu" aria-label="Add menu">
      <button className={styles.link} onClick={onClose}>Add a new person</button>
      <button className={styles.link} onClick={onClose}>Import new people data</button>
    </div>
  );
};
