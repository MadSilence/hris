"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./TabItem.module.css";

type TabItemProps = {
  href: string;
  label: string;
  badge?: React.ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  prefetch?: boolean;
  className?: string;
};

export const TabItem = React.forwardRef<HTMLAnchorElement, TabItemProps>(({
    href,
    label,
    badge,
    disabled,
    isActive,
    prefetch = false,
    className
  }, ref) => {
    return (
      <Link
        href={href}
        prefetch={prefetch}
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={[
          styles.tab,
          isActive ? styles.tabActive : "",
          disabled ? styles.tabDisabled : "",
          className ?? "",
        ].join(" ")}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <span className={styles.tabLabel}>{label}</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </Link>
    );
  }
);

TabItem.displayName = "TabItem";
