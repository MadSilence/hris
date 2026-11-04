"use client";

import * as React from "react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/desact/icon";
import { cn } from "@/lib/cn";

/*
 * A filter chip (SPEC § 13.4): a white 32 px pill with a hairline above a table or a list. Selected, it turns
 * Ink with a check — "Archived (4)", "Drafts", a narrowed field. One that opens a picker carries the
 * arrow (`withArrow`). It is a toggle, so it says whether it is pressed.
 */
type FilterChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & {
  selected?: boolean;
  withArrow?: boolean;
};

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ selected = false, withArrow = false, className, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={withArrow ? undefined : selected}
      data-selected={selected || undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill border px-3 text-body font-medium whitespace-nowrap",
        "transition-colors duration-(--duration-hover)",
        selected
          ? "border-inverse bg-inverse text-on-inverse hover:bg-inverse/90"
          : "border-field bg-card text-primary hover:border-strong hover:bg-subtle",
        "disabled:pointer-events-none disabled:border-field disabled:bg-subtle disabled:text-disabled",
        className,
      )}
      {...props}
    >
      {selected && !withArrow && <Icon icon={Tick02Icon} size="sm" />}
      {children}
      {withArrow && <Icon icon={ArrowDown01Icon} size="sm" className={selected ? undefined : "text-tertiary"} />}
    </button>
  ),
);
FilterChip.displayName = "FilterChip";
