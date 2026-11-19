"use client";

import * as React from "react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * A filter chip (SPEC § 13.4): a white 32 px pill with a hairline above a table or a list, 13/18 500, padding 0 12,
 * 6 between its parts. Selected, it turns Ink with a 14 px check — "Drafts", a narrowed field. One that opens a picker
 * carries the 14 px arrow (`withArrow`). It is a toggle, so it says whether it is pressed.
 *
 * A chip that carries a **count** ("Waiting 3") has no check: the word, then the count in 13/18 400 tertiary — on the
 * picked chip the field grey (the designers' Automations fixes A6 and H2, 2026-11-18). `noCheck` drops the check from
 * a chip without a count ("All" among the template categories, G4).
 */
type FilterChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selected?: boolean;
  withArrow?: boolean;
  /** A number after the word, already formatted. A chip with a count has no check. */
  count?: React.ReactNode;
  noCheck?: boolean;
};

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ selected = false, withArrow = false, count, noCheck = false, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={withArrow ? undefined : selected}
      data-selected={selected || undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill border px-3 text-label whitespace-nowrap",
        "transition-colors duration-(--duration-hover)",
        selected
          ? "border-inverse bg-inverse text-on-inverse hover:bg-inverse/90"
          : "border-field bg-card text-primary hover:border-strong hover:bg-subtle",
        "disabled:pointer-events-none disabled:border-field disabled:bg-subtle disabled:text-disabled",
        className,
      )}
      {...props}
    >
      {selected && !withArrow && count === undefined && !noCheck && <Icon icon={Tick02Icon} size="sm" className="size-3.5" />}
      {children}
      {count !== undefined && (
        <span data-slot="filter-chip-count" className={cn("font-normal", selected ? "text-field" : "text-tertiary")}>
          {count}
        </span>
      )}
      {withArrow && <Icon icon={ArrowDown01Icon} size="sm" className="size-3.5" />}
    </button>
  ),
);
FilterChip.displayName = "FilterChip";
