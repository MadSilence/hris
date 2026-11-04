"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/cn";

/*
 * Tabs (SPEC § 13.6): a 2 px accent underline under the selected tab; the selected label in the primary text
 * colour, the others tertiary. Saved views above a table are tabs too.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex h-10 w-fit items-stretch gap-6 border-b border-divider", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative -mb-px inline-flex items-center gap-2 border-b-2 border-transparent text-body font-medium whitespace-nowrap text-tertiary",
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
