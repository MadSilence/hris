import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Options = {
  containerRef: RefObject<HTMLElement | null>;
  sectionIds: string[];
  offsetTop?: number;
};

export function useActiveSectionScroll({ containerRef, sectionIds, offsetTop = 8 }: Options) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});
  const rafRef = useRef<number | null>(null);

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    sectionsRef.current[id] = el;
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      const container = containerRef.current;
      const node = sectionsRef.current[id];
      if (!container || !node) return;

      container.scrollTo({ top: node.offsetTop - offsetTop, behavior: "smooth" });
      setActiveId(id);
    },
    [containerRef, offsetTop],
  );

  const key = sectionIds.join("|");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const current = container.scrollTop;
        let bestId: string | null = null;
        let bestDelta = Number.POSITIVE_INFINITY;

        for (const id of sectionIds) {
          const el = sectionsRef.current[id];
          if (!el) continue;
          const delta = Math.abs(el.offsetTop - offsetTop - current);
          if (delta < bestDelta) {
            bestDelta = delta;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, key, offsetTop]);

  return useMemo(
    () => ({ activeId, registerSection, scrollToId }),
    [activeId, registerSection, scrollToId],
  );
}
