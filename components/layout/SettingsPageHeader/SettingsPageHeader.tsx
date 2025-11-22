"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./SettingsPageHeader.module.css";

type PageHeaderProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  showBack?: boolean;
  className?: string;
};

export default function SettingsPageHeader({
  title,
  subtitle,
  backHref,
  onBack,
  actions,
  showBack = true,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = React.useCallback(() => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  }, [onBack, backHref, router]);

  return (
    <header className={[styles.header, className ?? ""].join(" ")}>
      <div className={styles.left}>
        {showBack ? (
          backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className={styles.backBtn}
            >
              <ChevronLeft className={styles.chevron} aria-hidden/>
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Go back"
              className={styles.backBtn}
              onClick={handleBack}
            >
              <ChevronLeft className={styles.chevron} aria-hidden/>
            </button>
          )
        ) : null}

        <div className={styles.titles}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
