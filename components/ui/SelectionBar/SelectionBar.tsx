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

/** The nearest ancestor that scrolls vertically — what the sticky bar sticks to; null is the viewport. */
const scrollParentOf = (node: HTMLElement): HTMLElement | null => {
  for (let el = node.parentElement; el; el = el.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return el;
  }
  return null;
};

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
 * The bar a list shows while rows are selected — **white, right above the list it acts on**, never SPEC § 13.5's dark
 * floating bar (`technical_documentation/ui/DESIGN_SYSTEM.md` § 7; the owner's product-wide rule of 2026-11-17, first
 * drawn in `documents-tab`): 48 px, radius 10, a hairline and a shadow tinted with the company colour; × and
 * "N selected" on the left, the actions ghost on the right, a hairline before Delete, "⋯" past four. It sticks to the
 * top of the scrolling area; Esc clears the selection.
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
  const bar = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClear]);

  // The bar is stuck once its scroller has scrolled and the bar sits at the scroller's top edge — measured on scroll.
  // No marker element beside the bar: in a `flex gap-*` column a zero-height marker is still an item and adds a gap,
  // which moved the rows under the pointer at the first tick (WALK_QUESTIONS § 50). An IntersectionObserver alone
  // cannot tell "resting at the top edge" from "stuck there", and the documents list rests exactly there.
  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    const scroller = scrollParentOf(node);
    const target: HTMLElement | Window = scroller ?? window;
    const measure = () => {
      const scrolled = scroller ? scroller.scrollTop > 0 : window.scrollY > 0;
      const edge = scroller ? scroller.getBoundingClientRect().top : 0;
      setStuck(scrolled && node.getBoundingClientRect().top - edge <= 0.5);
    };
    measure();
    target.addEventListener("scroll", measure, { passive: true });
    return () => target.removeEventListener("scroll", measure);
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
    const className = "h-8 gap-1.5 px-2 text-label text-primary hover:bg-mist";
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
      <div
        ref={bar}
        role="region"
        aria-label={t("selection.selected", { count })}
        className={cn(
          "sticky top-0 z-20 flex h-12 items-center gap-1 rounded-popover border border-accent-ring bg-card px-2 shadow-selection transition-shadow",
          stuck && "shadow-popover",
        )}
      >
        <Button type="button" variant="ghost" size="icon-sm" aria-label={t("selection.clear")} onClick={onClear}
                className="hover:bg-mist">
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
                        className="hover:bg-mist">
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
