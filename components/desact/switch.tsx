"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/cn";

/*
 * A toggle (SPEC § 13.12): a 32 × 20 pill, the accent when on. Whole-pixel geometry on purpose — a 16 px thumb
 * inside 2 px of padding travels exactly 12 px — so it never lands a hair off. The hit area reaches 24 px.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-5 w-8 shrink-0 items-center rounded-pill p-0.5",
        "transition-colors duration-(--duration-hover)",
        "before:absolute before:-inset-y-0.5 before:inset-x-0 before:content-['']",
        "data-[state=checked]:bg-accent data-[state=unchecked]:bg-strong",
        "disabled:cursor-not-allowed disabled:data-[state=checked]:bg-accent-ring disabled:data-[state=unchecked]:bg-field",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-pill bg-card shadow-card transition-transform duration-(--duration-hover) data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
