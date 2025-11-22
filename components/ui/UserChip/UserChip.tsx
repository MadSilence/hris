"use client";

import Link from "next/link";
import styles from "./UserChip.module.css";

export type UserChipProps = {
  name: string;
  href: string;
  initials?: string;
  subtitle?: string;
  className?: string;
  color?: string;
};

const UserChip: React.FC<UserChipProps> = ({ name, href, initials, subtitle, className, color }) => {
  const inits = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <Link href={href} className={[styles.chip, className].filter(Boolean).join(" ")}>
      <span className={styles.avatar} aria-hidden style={{ background: color}}>{inits}</span>
      <span className={styles.meta}>
        <span className={styles.name}>{name}</span>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </span>
    </Link>
  );
};

export default UserChip;
