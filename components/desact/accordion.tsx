"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/* Sections separated by hairlines; a section opens with the reorder timing and closes without animating. */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("border-b border-divider last:border-b-0", className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-control py-4 text-left text-body font-medium text-primary",
          "focus-visible:outline-offset-[-2px] disabled:pointer-events-none disabled:text-disabled",
          "[&[data-state=open]>[data-slot=icon]]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <Icon
          icon={ArrowDown01Icon}
          size="sm"
          className="pointer-events-none translate-y-0.5 text-tertiary transition-transform duration-(--duration-menu)"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" data-motion="reveal" className="overflow-hidden text-body" {...props}>
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
