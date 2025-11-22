"use client";

import * as React from "react";
import styles from "./InputGroup.module.css";

export const InputGroup: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className={styles.group}>{children}</div>
);

export const InputAddon: React.FC<React.PropsWithChildren> = ({ children }) => (
    <div className={styles.addon}>{children}</div>
);
