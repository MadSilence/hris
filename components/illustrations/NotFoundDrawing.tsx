"use client";

import * as React from "react";

import { cn } from "@/lib/cn";
import { NOT_FOUND_MOVING, NOT_FOUND_STILL } from "./notFoundScenes";

/*
 * The 404 page's drawing — its own page design, not an empty-state illustration, and the one picture in the
 * product that moves (empty-state spec, "404 page"; SPEC § 10 keeps every other illustration static).
 *
 * 480 px wide, never wider than its column. The balls fall once and stay.
 *
 * **The timeline is restarted on mount.** SMIL counts from when the document's timeline began, not from when
 * this drawing appeared: reached by a link inside the app, the 3.6 s would long be over and the balls would
 * already lie in their row, never having fallen. Under `prefers-reduced-motion: reduce` the still cut is drawn
 * instead — the same picture at rest.
 */
export function NotFoundDrawing({ className }: { className?: string }) {
  const svg = React.useRef<SVGSVGElement>(null);
  const [still, setStill] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    svg.current?.setCurrentTime?.(0);
  }, []);

  return (
    <svg
      ref={svg}
      viewBox="0 0 240 150"
      width={480}
      height={300}
      fill="none"
      aria-hidden
      className={cn("h-auto max-w-full shrink-0 text-(--illustration-ring)", className)}
    >
      {still ? NOT_FOUND_STILL : NOT_FOUND_MOVING}
    </svg>
  );
}
