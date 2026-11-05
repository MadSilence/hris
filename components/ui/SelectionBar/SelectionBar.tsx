"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { IconSvgElement } from "@hugeicons/react";
import { Cancel01Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { Button } from "@/components/desact/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/desact/dropdown-menu";
import { cn } from "@/lib/cn";

export type SelectionAction = {
  key: string;
  label: string;
  icon: IconSvgElement;
  /** A destructive act: a hairline before it, its icon in `declined`, its label in ink. */
  danger?: boolean;
} & ({ onClick: () => void; href?: never } | { href: string; onClick?: never });

/** Past this many the rest go into "⋯" (the designers' answer 1.2). */
const MAX_VISIBLE = 4;

/**
 * The bar a list shows while rows are selected — **Mist, in the toolbar's place**, never SPEC § 13.5's dark floating bar
 * (`technical_documentation/ui/DESIGN_SYSTEM.md` § 7). 40 px, radius 10, 4 px inside; × and "N selected" on the left,
 * the actions ghost on the right (white on hover, because the bar is already Mist), a hairline before Delete, "⋯" past
 * four. It sticks to the top of the scrolling area and takes `shadow-1` while stuck; Esc clears the selection.
 */
export const SelectionBar: React.FC<{
  count: number;
  onClear: () => void;
  /** Instead of "N selected" — "All 214 selected" once People took the whole filter. */
  label?: string;
  /** Beside the count — "Select all 214 matching" in People. */
  extra?: React.ReactNode;
  actions: SelectionAction[];
}> = ({ count, onClear, label, extra, actions }) => {
  const t = useTranslations("common");
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClear]);

  // A zero-height marker just above the bar: once it scrolls out of view, the bar is stuck.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { threshold: [0] });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = actions.length > MAX_VISIBLE ? actions.slice(0, MAX_VISIBLE - 1) : actions;
  const folded = actions.length > MAX_VISIBLE ? actions.slice(MAX_VISIBLE - 1) : [];

  const renderAction = (action: SelectionAction) => {
    const body = (
      <>
        <Icon icon={action.icon} size="sm" className={action.danger ? "text-status-declined-icon" : undefined} />
        {action.label}
      </>
    );
    const className = "h-8 gap-1.5 px-2 text-label text-primary hover:bg-overlay";
    return action.href ? (
      <Button key={action.key} asChild variant="ghost" className={className}>
        <a href={action.href} download className="no-underline">{body}</a>
      </Button>
    ) : (
      <Button key={action.key} type="button" variant="ghost" className={className} onClick={action.onClick}>
        {body}
      </Button>
    );
  };

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <div
        role="region"
        aria-label={t("selection.selected", { count })}
        className={cn(
          "sticky top-0 z-20 flex h-10 items-center gap-1 rounded-popover bg-mist p-1 transition-shadow",
          stuck && "shadow-raised",
        )}
      >
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("selection.clear")} onClick={onClear}
                className="hover:bg-overlay">
          <Icon icon={Cancel01Icon} size="sm" />
        </Button>
        <span className="text-label text-primary tabular-nums">{label ?? t("selection.selected", { count })}</span>
        {extra ? <span className="ml-2 flex items-center gap-2">{extra}</span> : null}
        <span className="flex-1" />
        <div className="flex items-center gap-1">
          {shown.map((action) => (
            <React.Fragment key={action.key}>
              {action.danger && <span aria-hidden className="mx-1 h-5 w-px bg-divider" />}
              {renderAction(action)}
            </React.Fragment>
          ))}
          {folded.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t("actions.moreActions")}
                        className="hover:bg-overlay">
                  <Icon icon={MoreHorizontalIcon} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {folded.map((action) =>
                  action.href ? (
                    <DropdownMenuItem key={action.key} asChild>
                      <a href={action.href} download><Icon icon={action.icon} size="sm" />{action.label}</a>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={action.key} variant={action.danger ? "destructive" : "default"} onClick={action.onClick}>
                      <Icon icon={action.icon} size="sm" />
                      {action.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </>
  );
};
