"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";

/*
 * The single-choice menu (the designers' RC12 and `7-product-wide/MENU.md`, 2026-11-20; drawn from the calendar's
 * N07-GroupMenu): every menu where a person picks ONE option — Group by, Starts when, a sort, a period, a month.
 * A label naming the choice on top (12/16 500, tertiary, 8 10 4), a hairline under it (6 in from each side), then the
 * options one per row (32 high, 0 10, 14/20 Ink); **the picked one is in the accent, 500, with a tick on the right**.
 * No check column on the left, no icons. Action menus (⋯ — Edit, Duplicate, Delete) are `RowActionsMenu`, not this.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 10.
 */

export type ChoiceOption<T> = { value: T; label: React.ReactNode };

type ChoiceMenuContentProps<T> = {
  /** What is being chosen — "Group by", "Starts when", "Sort by". */
  label: React.ReactNode;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  align?: "start" | "center" | "end";
  className?: string;
};

/** A value as the radio group's string; `null` is "none", whatever the caller calls it. */
const keyOf = (value: unknown) => (value === null || value === undefined ? "\u0000none" : String(value));

export function ChoiceMenuContent<T>({ label, options, value, onChange, align = "start", className }: ChoiceMenuContentProps<T>) {
  return (
    <DropdownMenuContent align={align} className={cn("w-60", className)} data-slot="choice-menu">
      <DropdownMenuPrimitive.Label className="shrink-0 px-2.5 pt-2 pb-1 text-hint font-medium text-tertiary">
        {label}
      </DropdownMenuPrimitive.Label>
      <DropdownMenuPrimitive.Separator className="mx-1.5 mb-1 h-px shrink-0 bg-divider" />
      <DropdownMenuPrimitive.RadioGroup
        value={keyOf(value)}
        onValueChange={(key) => {
          const picked = options.find((o) => keyOf(o.value) === key);
          if (picked) onChange(picked.value);
        }}
        className="flex flex-col gap-0.5"
      >
        {options.map((o) => {
          const on = keyOf(o.value) === keyOf(value);
          return (
            <DropdownMenuPrimitive.RadioItem
              key={keyOf(o.value)}
              value={keyOf(o.value)}
              className={cn(
                "relative flex h-8 shrink-0 cursor-default items-center justify-between gap-2.5 rounded-control px-2.5 text-body whitespace-nowrap outline-hidden select-none",
                "focus:bg-accent-subtle data-[highlighted]:bg-accent-subtle",
                on ? "font-medium text-accent-text" : "text-primary",
              )}
            >
              <span className="min-w-0 truncate">{o.label}</span>
              <DropdownMenuPrimitive.ItemIndicator className="flex shrink-0">
                <Icon icon={Tick02Icon} size="sm" className="text-accent-text" />
              </DropdownMenuPrimitive.ItemIndicator>
            </DropdownMenuPrimitive.RadioItem>
          );
        })}
      </DropdownMenuPrimitive.RadioGroup>
    </DropdownMenuContent>
  );
}

/** {@link ChoiceMenuContent} with its trigger: `trigger` is the button that opens it (passed `asChild`). */
export function ChoiceMenu<T>({
  trigger,
  open,
  onOpenChange,
  ...content
}: ChoiceMenuContentProps<T> & {
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <ChoiceMenuContent {...content} />
    </DropdownMenu>
  );
}
