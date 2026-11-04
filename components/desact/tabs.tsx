"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/cn";

/*
 * Tabs (SPEC § 13.6): a 2 px accent underline under the selected tab; the selected label in the primary text
 * colour, the others tertiary. Saved views above a table are tabs too. A tab is as wide as its label, and one
 * hairline runs under the whole row (design fixes of 2026-11-04, fix 1) — no band, no equal columns.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // The hairline is drawn, not a border: a tab sitting 1 px over a border pushed a scrolling row (the
        // profile's) into a vertical scrollbar of its own. The selected tab's underline lies on top of it.
        // Scrolls rather than clips: a row too wide for a side panel used to squeeze into equal columns; now
        // that a tab is as wide as its label, a cut-off tab would be a tab nobody can reach.
        "relative flex h-11 w-full items-stretch gap-6 overflow-x-auto",
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-divider",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent text-body font-medium whitespace-nowrap text-tertiary",
        "transition-colors duration-(--duration-hover) hover:text-primary",
        "data-[state=active]:border-accent data-[state=active]:text-primary",
        "focus-visible:outline-offset-[-2px] disabled:pointer-events-none disabled:text-disabled",
        "[&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
