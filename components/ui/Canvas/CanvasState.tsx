import * as React from "react";

import { Skeleton } from "@/components/desact/skeleton";
import { cn } from "@/lib/cn";

/**
 * The states of the org-structure canvases — departments, teams and the org chart.
 *
 * The skeleton takes the shape of what is coming: a root node, the connectors and three children (SPEC § 12:
 * a skeleton matching the real layout). A ring in its place would shift the whole layout, and the canvas is
 * the largest block on the screen. It sits on the canvas surface, as the nodes will (§ 13.8).
 */
export function CanvasLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="flex h-full flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center">
        <div className="flex w-56 items-center gap-3 rounded-popover border border-divider bg-card p-3 shadow-raised">
          <Skeleton className="size-9 flex-none" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <div className="h-6 w-px bg-strong" />
        <div className="h-px w-64 bg-strong" />
        <div className="flex gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-6 w-px bg-strong" />
              <div className="w-40 space-y-2 rounded-popover border border-divider bg-card p-3 shadow-raised">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-body text-tertiary">{label}</p>
    </div>
  );
}

/* An error here stays neutral (SPEC § 4.6): red is for the failed field, the destructive label and the toast icon. */
export function CanvasMessage({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "error" }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center px-6 text-center text-body",
        tone === "error" ? "text-secondary" : "text-tertiary",
      )}
    >
      {children}
    </div>
  );
}
