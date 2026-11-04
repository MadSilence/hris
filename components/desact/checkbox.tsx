"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/*
 * Checkboxes (SPEC § 13.12, § 13.11).
 *
 *   square   row selection: 16 px, a 1.5 px strong border, the 4 px glyph corner
 *   round    tasks and checklists, shaped like the ring
 *
 * Checked: the accent fill with the on-accent check. The hit area reaches 24 px around the 16 px glyph.
 */
type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  shape?: "square" | "round";
};

function Checkbox({ className, checked, shape = "square", ...props }: CheckboxProps) {
  const indeterminate = checked === "indeterminate";
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        "peer relative inline-flex size-4 shrink-0 items-center justify-center border-[1.5px] border-strong bg-card text-on-accent",
        "transition-colors duration-(--duration-hover)",
        "before:absolute before:-inset-1 before:content-['']",
        "hover:border-field-hover data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
        "aria-invalid:border-danger disabled:cursor-not-allowed disabled:border-field disabled:bg-subtle",
        shape === "round" ? "rounded-pill" : "rounded-glyph",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center">
        <Icon icon={indeterminate ? MinusSignIcon : Tick02Icon} size="sm" className="size-3" strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
