"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type ModalProps = {
  isLoading?: boolean;
  isOpen: boolean;
  title?: string;
  onRequestClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function Modal({
  isLoading = false,
  isOpen,
  title,
  onRequestClose,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const headingId = React.useId();

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!isOpen || isLoading) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, isLoading, onRequestClose]);

  React.useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // автофокус внутрь
  React.useEffect(() => {
    if (isOpen) dialogRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className={styles.backdrop}
      onMouseDown={(e) => {
        if (!isLoading && e.target === e.currentTarget) onRequestClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? headingId : undefined}
    >
      <div
        ref={dialogRef}
        className={`${styles.panel} ${styles[size]}`}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className="flex items-center justify-between">
            <h3 id={headingId} className={styles.title}>{title}</h3>
          </div>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}

        {isLoading && <div className={styles.loadingOverlay}/>}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
