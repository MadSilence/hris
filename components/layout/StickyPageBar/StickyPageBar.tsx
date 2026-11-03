"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/public/desact/src/components/ui/utils";

/**
 * A page's heading row that stays in view while the content under it scrolls — for an editor whose
 * Save sits in the heading and whose content is longer than the window (a review form, a cycle, a
 * review being written).
 *
 * It sticks to the app's scrolling `main`. Its white reaches the window's edges past the page's own
 * width, so the content does not show beside it, and a hairline under it appears once it has stuck — at
 * rest the heading reads like any other. Both are a `border-image` drawn outward: it paints past the
 * bar without making the page wider, which a wide pseudo-element did (a horizontal scrollbar), clipped
 * or not.
 */
export function StickyPageBar({ children, className }: { children: React.ReactNode; className?: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // The bar sits one pixel above the scroller's top edge, so it is wholly visible only while it rests in
  // the page; once it sticks, that pixel is cut off and it is no longer fully inside.
  useEffect(() => {
    const node = bar.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(entry.intersectionRatio < 1),
      { root: node.closest("main"), threshold: [1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bar}
      data-stuck={stuck ? "true" : undefined}
      className={cn(
        "sticky -top-px z-20 -mt-4 py-4",
        stuck
          ? "[border-image:linear-gradient(to_top,var(--color-brown-100)_1px,#fff_1px)_fill_0//0_100vmax]"
          : "[border-image:linear-gradient(#fff,#fff)_fill_0//0_100vmax]",
        className,
      )}
    >
      {children}
    </div>
  );
}
