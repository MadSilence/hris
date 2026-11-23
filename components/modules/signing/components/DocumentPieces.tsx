"use client";

import * as React from "react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Doc01Icon,
  File01Icon,
  Image01Icon,
  Pdf01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Xls01Icon,
  Zip01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * The pieces every Documents list draws the same way (the designers' package of 2026-11-19: the file-type tile, the
 * view switch's labels, a clickable name, the Who can see cell, a sorted header). One place, so the tab, the section
 * and the pickers cannot drift apart.
 */

type FileKind = "pdf" | "doc" | "xls" | "img" | "zip" | "file";

export const fileKindOf = (mimeType: string | null | undefined, name?: string | null): FileKind => {
  const m = (mimeType ?? "").toLowerCase();
  const ext = (name ?? "").toLowerCase().split(".").pop() ?? "";
  if (m.includes("pdf") || ext === "pdf") return "pdf";
  if (m.startsWith("image/")) return "img";
  if (m.includes("sheet") || m.includes("excel") || m.includes("csv") || ["xls", "xlsx", "csv"].includes(ext)) return "xls";
  if (m.includes("zip") || m.includes("compressed") || ["zip", "rar", "7z"].includes(ext)) return "zip";
  if (m.includes("word") || m.includes("msword") || m.includes("document") || ["doc", "docx", "odt", "rtf"].includes(ext)) return "doc";
  return "file";
};

/** The tag colour per type (DT9): pdf Berry, doc Indigo, xls Teal, image Ocean, zip Bronze; anything else Mist. */
const TILE: Record<FileKind, { icon: IconSvgElement; className: string }> = {
  pdf: { icon: Pdf01Icon, className: "bg-tag-berry-bg text-tag-berry-bar" },
  doc: { icon: Doc01Icon, className: "bg-tag-indigo-bg text-tag-indigo-bar" },
  xls: { icon: Xls01Icon, className: "bg-tag-teal-bg text-tag-teal-bar" },
  img: { icon: Image01Icon, className: "bg-tag-ocean-bg text-tag-ocean-bar" },
  zip: { icon: Zip01Icon, className: "bg-tag-bronze-bg text-tag-bronze-bar" },
  file: { icon: File01Icon, className: "bg-mist text-secondary" },
};

/** The file-type tile (DT9, D01): 28 × 28, radius 8, the type's tag colour, an 18 icon. `sm` is 24 with a 16 icon. */
export function FileTypeTile({
  mimeType,
  name,
  size = "md",
  className,
}: {
  mimeType: string | null | undefined;
  name?: string | null;
  size?: "md" | "sm";
  className?: string;
}) {
  const tile = TILE[fileKindOf(mimeType, name)];
  return (
    <span
      aria-hidden
      className={cn(
        "grid flex-none place-items-center",
        size === "sm" ? "size-6 rounded-tag [&_svg]:size-4" : "size-7 rounded-control [&_svg]:size-[18px]",
        tile.className,
        className,
      )}
    >
      <Icon icon={tile.icon} />
    </span>
  );
}

/**
 * A view switch's label (DT8, DS1): an optional 16 icon, the word, and the count in its own pill — Mist, radius 6,
 * 20 high, 13/18 500.
 */
export function ViewLabel({ icon, label, count }: { icon?: IconSvgElement; label: string; count?: number | null }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon && <Icon icon={icon} size="sm" />}
      <span>{label}</span>
      {count !== undefined && count !== null && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-tag bg-mist px-1.5 text-label font-medium tabular-nums text-secondary">
          {count.toLocaleString()}
        </span>
      )}
    </span>
  );
}

/**
 * A document's name in a row (the owner's A11, 2026-11-20): one click opens it, and while the row is hovered the name
 * lifts the way a person chip's does — a white pill with the level-1 shadow — so the row reads as clickable. A long
 * name ends in … and says itself in full on hover (DS10).
 */
export function DocumentName({ name, className }: { name: string; className?: string }) {
  return (
    <span
      title={name}
      className={cn(
        "-mx-1.5 min-w-0 truncate rounded-control px-1.5 py-0.5 text-body font-medium text-primary transition-colors",
        "group-hover/row:bg-card group-hover/row:shadow-card",
        className,
      )}
    >
      {name}
    </span>
  );
}

/** Who can see a file (DT, D01): an eye or a crossed eye, 14, and the word. */
export function VisibilityCell({ hidden, label }: { hidden: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-body text-secondary">
      <Icon icon={hidden ? ViewOffSlashIcon : ViewIcon} size="sm" className="size-3.5 text-tertiary" />
      {label}
    </span>
  );
}

/**
 * A header that sorts (T19–T21, D01): 12/16 500 grey; the sorted one in Ink with its chevron 14, the others show it on
 * hover.
 */
export function SortHeader({
  label,
  active,
  ascending,
  onClick,
}: {
  label: string;
  active: boolean;
  ascending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group/sort inline-flex items-center gap-1 hover:text-primary", active && "text-primary")}
    >
      {label}
      <Icon
        icon={active && !ascending ? ArrowDown01Icon : ArrowUp01Icon}
        size="sm"
        className={cn("size-3.5", !active && "opacity-0 group-hover/sort:opacity-60")}
      />
    </button>
  );
}

/**
 * A row opens on one click (A11) — but not when the click came from a control inside it, or from a menu portalled
 * out of it (React bubbles a portal's clicks through the row).
 */
export const isRowClick = (event: React.MouseEvent<HTMLElement>) => {
  const target = event.target as HTMLElement | null;
  if (!target || !event.currentTarget.contains(target)) return false;
  return !target.closest("button, a, input, label, [role='checkbox'], [role='menuitem'], [data-row-control]");
};
