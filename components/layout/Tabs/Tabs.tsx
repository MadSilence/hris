"use client";

import * as React from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import styles from "./Tabs.module.css";
import { TabItem } from "@/components/layout/TabItem/TabItem";

export type NavTab = {
  id: string;
  label: string;
  href: string;
  badge?: React.ReactNode;
  disabled?: boolean;
  description?: React.ReactNode;
};

type TabsProps = {
  tabs: NavTab[];
  indicatorHeightPx?: number;
};

export function Tabs({ tabs, indicatorHeightPx = 2 }: TabsProps) {
  const segment = useSelectedLayoutSegment();
  const activeId = segment ?? tabs.find(t => !t.disabled)?.id ?? tabs[0]?.id ?? "";

  const activeTab = React.useMemo(
    () => tabs.find(t => t.id === activeId) ?? tabs[0],
    [tabs, activeId]
  );

  const linksRef = React.useRef<Record<string, HTMLAnchorElement | null>>({});
  const indicatorRef = React.useRef<HTMLDivElement>(null);

  const updateIndicator = React.useCallback(() => {
    const el = linksRef.current[activeId];
    const ind = indicatorRef.current;
    if (!el || !ind) return;
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement!.getBoundingClientRect();
    ind.style.width = `${rect.width}px`;
    ind.style.transform = `translateX(${rect.left - parentRect.left}px)`;
  }, [activeId]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, activeId, tabs.length]);

  React.useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    const container = indicatorRef.current?.parentElement;
    if (container) ro.observe(container);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [updateIndicator]);

  return (
    <nav className={styles.wrap} aria-label="Sections">
      <div className={styles.tablistWrap}>
        <div className={styles.tablist}>
          {tabs.map(t => (
            <TabItem
              key={t.id}
              href={t.href}
              label={t.label}
              badge={t.badge}
              disabled={t.disabled}
              isActive={t.id === activeId}
              ref={el => {
                linksRef.current[t.id] = el;
              }}
            />
          ))}
          <div
            ref={indicatorRef}
            className={styles.indicator}
            style={{ height: indicatorHeightPx }}
            aria-hidden
          />
        </div>
        <div className={styles.separator} aria-hidden/>
      </div>

      {/* Новое: описание активной вкладки */}
      {activeTab?.description ? (
        <div className={styles.description} role="note">
          {activeTab.description}
        </div>
      ) : null}
    </nav>
  );
}
