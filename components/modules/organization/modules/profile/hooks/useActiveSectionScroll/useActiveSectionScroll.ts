import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Options = {
  containerRef: RefObject<HTMLElement | null>;
  sectionIds: string[];
  /** Отступ сверху (px), чтобы заголовок не прилипал к самому верху */
  offsetTop?: number; // например, 24..48
};

export function useActiveSectionScroll({ containerRef, sectionIds, offsetTop = 24 }: Options) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});
  const rafRef = useRef<number | null>(null);

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    sectionsRef.current[id] = el;
  }, []);

  const scrollToId = useCallback((id: string) => {
    const container = containerRef.current;
    const node = sectionsRef.current[id];
    if (!container || !node) return;

    const top = node.offsetTop - offsetTop;
    container.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  }, [offsetTop]);

  const onScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const current = container.scrollTop;

      let bestId: string | null = null;
      let bestDelta = Number.POSITIVE_INFINITY;

      for (const id of sectionIds) {
        const el = sectionsRef.current[id];
        if (!el) continue;
        const target = el.offsetTop - offsetTop;
        const delta = Math.abs(target - current);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestId = id;
        }
      }
      if (bestId && bestId !== activeId) setActiveId(bestId);
    });
  }, [activeId, sectionIds, offsetTop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => onScroll();
    window.addEventListener("resize", onResize);

    // первичная инициализация
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  const api = useMemo(() => ({ activeId, registerSection, scrollToId }), [activeId, registerSection, scrollToId]);
  // @ts-ignore
  return api as const;
}
