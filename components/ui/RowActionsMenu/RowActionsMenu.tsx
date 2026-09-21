"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/public/desact/src/components/ui/dropdown-menu";
import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * The kebab menu. One icon, one size, one set of rules.
 *
 * The product had **19 of these**, with three trigger icons (`Ellipsis`, `MoreHorizontal`,
 * `MoreVertical` — two of which draw the same glyph and one draws it rotated), three trigger sizes,
 * four menu widths, two item paddings, icons on 8 of them and none on 11, and **four different ways
 * of marking the destructive item** including three menus where Delete looked exactly like Rename.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` §§ 1–3.
 */
export const RowActionsMenu: React.FC<{
  children: React.ReactNode;
  /** Named for what the row is, e.g. "Role actions". Never omitted — see below. */
  label: string;
  align?: "start" | "end";
  className?: string;
  /** A row whose actions are all unavailable — a system section, a preset attribute. */
  disabled?: boolean;
  /** Why it is disabled. Shown natively today; see the open question in the guideline. */
  title?: string;
  /** For a kebab inside a clickable row, where the click must not also open the row. */
  stopPropagation?: boolean;
}> = ({ children, label, align = "end", className, disabled, title, stopPropagation }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild disabled={disabled}>
      {/*
        `aria-label` is a required prop rather than an optional one on purpose: an icon-only button
        without it is an unlabelled button to a screen reader, and two of the nineteen shipped that
        way. A required prop is the only version of this rule that cannot be forgotten.
      */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-brown-500 hover:bg-brown-50 hover:text-brown-700 disabled:opacity-40"
        aria-label={label}
        disabled={disabled}
        title={title}
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align={align} className={cn("w-40 rounded-lg p-1", className)}>
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

const ITEM_CLASS = "gap-2.5 rounded-md px-2.5 py-1.5 cursor-pointer";

/**
 * An ordinary item. The icon is required, because a menu whose icons stop halfway reads as a
 * rendering fault rather than as a style.
 */
export const RowAction: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}> = ({ icon, children, onClick, disabled, title }) => (
  <DropdownMenuItem onClick={onClick} disabled={disabled} title={title} className={ITEM_CLASS}>
    {icon}
    {children}
  </DropdownMenuItem>
);

/**
 * The destructive item: a separator above it, and `variant="destructive"` rather than one of the
 * three hand-written `text-danger-600` spellings the product had.
 *
 * **The separator carries as much meaning as the colour.** It is the pause between "things you do to
 * this row" and "the thing you cannot undo" — which is why one menu putting a separator before
 * *Archive* was a bug: it meant "near the bottom" instead of "past this line it is permanent".
 * Archive is reversible by decision (`DECISIONS.md` § "Every archive is reversible") and is an
 * ordinary {@link RowAction}.
 */
export const RowActionDestructive: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}> = ({ icon, children, onClick, disabled, title }) => (
  <>
    <DropdownMenuSeparator className="my-1 bg-brown-100" />
    <DropdownMenuItem
      variant="destructive"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={ITEM_CLASS}
    >
      {icon}
      {children}
    </DropdownMenuItem>
  </>
);
