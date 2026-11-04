"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/cn";

/* Radios (SPEC § 13.12): a 16 px circle; selected shows the accent dot. The hit area reaches 24 px. */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "relative aspect-square size-4 shrink-0 rounded-pill border-[1.5px] border-strong bg-card",
        "transition-colors duration-(--duration-hover) before:absolute before:-inset-1 before:content-['']",
        "hover:border-field-hover data-[state=checked]:border-accent",
        "aria-invalid:border-danger disabled:cursor-not-allowed disabled:border-field disabled:bg-subtle",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center">
        <span className="size-2 rounded-pill bg-accent" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
