"use client";

import { useCallback, useRef, useState } from "react";

/**
 * The height an element last had, kept after it unmounts. People's selection bar takes the toolbar's place; on a
 * narrow window the toolbar wraps onto two rows (~100 px) and the 48 px bar moved every row up under the pointer at the
 * first tick (WALK_QUESTIONS § 52, the owner's 1). The bar's slot keeps the toolbar's last height instead.
 */
export const useLastHeight = (): [(node: HTMLElement | null) => void, number | undefined] => {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node) return; // unmounted: the last height stays
    const measure = () => setHeight(Math.round(node.getBoundingClientRect().height) || undefined);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    observer.current = new ResizeObserver(measure);
    observer.current.observe(node);
  }, []);

  return [ref, height];
};
