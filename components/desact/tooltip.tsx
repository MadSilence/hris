"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/cn";

/*
 * A tooltip: an explanation only. **Light** — the one exception to SPEC § 13.7 (the owner, 2026-11-05; the designers'
 * values, `DECISIONS.md` § "The designers' answers on the fixes", 1.1): the overlay surface, a hairline, the level-2
 * shadow, 12/16 secondary text, radius 10, 8 × 12 inside, at most 240 wide and wrapping, 8 px off the element, no arrow.
 * A `title` gives it a first line 12/16 500 in the primary text — a leave bar's policy above its dates and status.
 *
 * Shown after 400 ms and hidden at once; **while one is open the next shows without a delay** — which needs every
 * tooltip under one provider, so the app's root has one (`AppProviders`). A tooltip rendered outside it (a test, a
 * portal of its own) brings its own provider rather than failing.
 */
const TOOLTIP_DELAY_MS = 400;

const HasTooltipProvider = React.createContext(false);

function TooltipProvider({
  delayDuration = TOOLTIP_DELAY_MS,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props}>
      <HasTooltipProvider.Provider value={true}>{children}</HasTooltipProvider.Provider>
    </TooltipPrimitive.Provider>
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const shared = React.useContext(HasTooltipProvider);
  const root = <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return shared ? root : <TooltipProvider>{root}</TooltipProvider>;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 8,
  title,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, "title"> & {
  /** A first line in the primary text, 500 — what the rest is about. */
  title?: React.ReactNode;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-motion="menu"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-[240px] origin-(--radix-tooltip-content-transform-origin) break-words",
          "rounded-popover border border-divider bg-overlay px-3 py-2 text-hint text-secondary shadow-popover",
          className,
        )}
        {...props}
      >
        {title ? <p className="font-medium text-primary">{title}</p> : null}
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
