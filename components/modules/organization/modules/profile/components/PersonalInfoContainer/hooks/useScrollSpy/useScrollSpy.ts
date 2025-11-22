import { RefObject, useCallback, useEffect, useRef, useState } from "react";

type Options = {
  containerRef: RefObject<HTMLElement | null>;
  sectionIds: string[];
};

export function useScrollSpy({ containerRef, sectionIds }: Options) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const connectObserver = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible ? (visible.target as HTMLElement).dataset.groupId : null;
        if (id && id !== activeId) setActiveId(id);
      },
      {
        root: container,
        threshold: [0.15, 0.3, 0.5, 0.75],
        rootMargin: "0px 0px -40% 0px",
      }
    );

    sectionIds.forEach((id) => {
      const el = sectionsRef.current[id];
      if (el) observerRef.current!.observe(el);
    });
  }, [containerRef, sectionIds.join("|"), activeId]);

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    sectionsRef.current[id] = el;
    const obs = observerRef.current;
    if (el && obs) obs.observe(el);
  }, []);

  const scrollToId = useCallback((id: string) => {
    const node = sectionsRef.current[id];
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }, []);

  useEffect(() => {
    connectObserver();
    return () => observerRef.current?.disconnect();
  }, [connectObserver]);

  return { activeId, registerSection, scrollToId } as const;
}
