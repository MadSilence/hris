"use client";

import * as React from"react";
import * as SwitchPrimitive from"@radix-ui/react-switch";

import { cn } from"./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Whole-pixel geometry, deliberately: 20px track, 2px padding, 16px thumb. Fractional
        // heights leave a sub-pixel gap and the thumb renders a hair off depending on where the
        // switch lands on screen. It also makes the checked travel exact — 30px inner − 16px thumb
        // = 14px, the translate on the thumb below.
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent p-0.5 transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
