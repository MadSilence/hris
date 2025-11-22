"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Popover.module.css";

export type Placement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

type PopoverProps = {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  className?: string;
  placement?: Placement;
  offset?: number;
  portal?: boolean;
  onRequestClose?: () => void;
};

export function Popover({
  open,
  anchorRef,
  children,
  className,
  placement = "bottom-start",
  offset = 8,
  portal = true,
  onRequestClose,
}: PopoverProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const anchorEl = anchorRef.current;
    const contentEl = contentRef.current;
    if (!anchorEl || !contentEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const contentWidth = contentEl.offsetWidth;
    const contentHeight = contentEl.offsetHeight;

    const anchorTop = anchorRect.top;
    const anchorBottom = anchorRect.bottom;
    const anchorLeft = anchorRect.left;
    const anchorRight = anchorRect.right;

    let top = 0;
    let left = 0;

    if (placement === "bottom-start") {
      top = anchorBottom + offset;
      left = anchorLeft;
    } else if (placement === "bottom-end") {
      top = anchorBottom + offset;
      left = anchorRight - contentWidth;
    } else if (placement === "top-start") {
      top = anchorTop - contentHeight - offset;
      left = anchorLeft;
    } else if (placement === "top-end") {
      top = anchorTop - contentHeight - offset;
      left = anchorRight - contentWidth;
    }

    const minGap = 8;
    const maxLeft = window.innerWidth - contentWidth - minGap;
    const maxTop = window.innerHeight - contentHeight - minGap;

    left = Math.max(minGap, Math.min(left, maxLeft));
    top = Math.max(minGap, Math.min(top, maxTop));

    contentEl.style.top = `${top}px`;
    contentEl.style.left = `${left}px`;
  }, [anchorRef, placement, offset]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onResizeOrScroll = () => updatePosition();
    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      onRequestClose?.();
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, anchorRef, onRequestClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onRequestClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onRequestClose]);

  if (!open) return null;

  const positionValue: React.CSSProperties["position"] = portal ? "fixed" : "absolute";

  const node = (
    <div
      ref={contentRef}
      role="menu"
      className={className ?? styles.content}
      style={{ position: positionValue }}
    >
      {children}
    </div>
  );

  return portal ? createPortal(node, document.body) : node;
}
