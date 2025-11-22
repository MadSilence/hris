"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import styles from "./SettingsCard.module.css";
import React from "react";

export type SettingsLinkItem = {
  label: string;
  href: string;
  external?: boolean
};

export interface SettingsCardProps {
  title: string;
  icon?: React.ReactNode;
  items: SettingsLinkItem[];
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  icon,
  items
}) => {
  const headingId = React.useId();

  return (
    <Card className={styles.card} role="region" aria-labelledby={headingId}>
      <div className={styles.header}>
        {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
        <h2 id={headingId} className={styles.title}>{title}</h2>
      </div>

      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.href} className={styles.item}>
            {it.external ? (
              <a className={styles.link} href={it.href} target="_blank" rel="noopener noreferrer">
                {it.label}
              </a>
            ) : (
              <Link className={styles.link} href={it.href}>
                {it.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default SettingsCard;
