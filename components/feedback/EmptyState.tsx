"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/desact/button";
import { Icon } from "@/components/desact/icon";
import { Illustration, type Scene } from "@/components/illustrations";
import { cn } from "@/lib/cn";

/**
 * Nothing exists yet — and the block invites you to make the first one.
 *
 * The noddo shape (SPEC § 12): a ring illustration, a title, at most two short sentences, one action —
 * centred. It invites: what this place is for, and the one action that fills it. Empty states may be warm
 * ("All caught up"); errors and data stay neutral.
 *
 * **This is the most valuable place in the product to put the primary action.** It is the screen somebody sees
 * on their first day, and the only screen where creating is the only sensible thing to do.
 *
 * **It is deliberately not the same component as {@link NoResults}.** They say different things: "there is
 * nothing here yet" invites creation, "your search matched nothing" must not, because the records exist and
 * the query missed. Merging them produces a screen that offers to create a second copy of something the
 * reader already has.
 *
 * Rule: `technical_documentation/ui/TABLES_AND_LISTS.md` § 3.
 */
export const EmptyState: React.FC<{
  /** Which ring illustration heads the block (`components/illustrations`). */
  scene: Scene;
  title: string;
  /** One line under the title; an empty string leaves the line out. */
  description: string;
  /** The create action, as the block's primary button. Omit where nobody may create. */
  onCreate?: () => void;
  createLabel?: string;
  /**
   * A rendered control instead of the create button, for the list whose create is a **choice** rather than a
   * single act — public holiday calendars are made from a template or by hand. Bring your own gate: unlike
   * `onCreate`, this node is rendered as given.
   */
  action?: React.ReactNode;
  /**
   * Fills the height its parent gives it — for a box that has a height of its own and scrolls inside it (the
   * Inbox's list, a tool window). On a page the block fills the free area by itself ({@link useFreeArea}).
   */
  fill?: boolean;
  /**
   * The small block, for a list that is one section of a page — "To write" on My reviews, the reviewers of a
   * cycle — where the full-size block would outweigh the sections around it. Same parts, the S illustration.
   * It is never stretched over the free area.
   */
  compact?: boolean;
  className?: string;
}> = ({ scene, title, description, onCreate, createLabel, action, fill, compact, className }) => {
  const ref = useFreeArea<HTMLDivElement>(!compact);
  const control =
    action ??
    (onCreate && createLabel ? (
      <Button type="button" size={compact ? "sm" : "md"} onClick={onCreate}>
        <Icon icon={Add01Icon} size="sm" />
        {createLabel}
      </Button>
    ) : null);
  return (
    <div
      ref={ref}
      data-slot="empty-state"
      data-free-area={compact ? undefined : ""}
      className={cn(
        "flex w-full flex-col items-center justify-center px-6 text-center",
        compact ? "py-6" : "py-12",
        fill && "h-full",
        className,
      )}
    >
      <Illustration scene={scene} size={compact ? "s" : "m"} />
      {/* SPEC § 12, the designers' D09: the drawing, 14, the title, 6, the line, 20, the action. */}
      <div className={cn("flex flex-col gap-1.5", compact ? "mt-3" : "mt-3.5")}>
        <p className={compact ? "text-body font-medium text-primary" : "text-section-title text-primary"}>{title}</p>
        {description ? <p className="mx-auto max-w-md text-body whitespace-pre-line text-secondary">{description}</p> : null}
      </div>
      {control ? <div className={compact ? "mt-4" : "mt-5"}>{control}</div> : null}
    </div>
  );
};

/**
 * Empty, no-results and error states sit in the vertical centre of **the free area under the page's toolbar**
 * (`rules/TABLES_AND_LISTS.md` § 3, the designers' ES1). A page has no height of its own — the app's `<main>`
 * scrolls and the page inside it is as tall as its content — so no class can say "the rest of the window". This
 * measures it: the block's minimum height becomes its own height plus the room left at the bottom of the box that
 * scrolls around it — the app's `<main>`, or a card, a panel or a dialog that scrolls on its own — and the block's
 * own centring does the rest. It follows the window and the content as they change size.
 *
 * Nothing scrolls around it (a dropdown, a test): it stays its own size. Two blocks in one box: the first one takes
 * the room, so they never fight over it.
 */
function useFreeArea<T extends HTMLElement>(enabled: boolean) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === "undefined") return;
    let box: HTMLElement | null = el.parentElement;
    while (box && box.tagName !== "MAIN" && !/^(auto|scroll)$/.test(getComputedStyle(box).overflowY)) {
      box = box.parentElement;
    }
    if (!box || box.querySelector("[data-free-area]") !== el) return;
    const scroller = box;

    /** How tall the box's content is — its children in the flow, its padding and its gaps. */
    const contentHeight = () => {
      const style = getComputedStyle(scroller);
      const children = Array.from(scroller.children).filter((child) => {
        const position = getComputedStyle(child).position;
        return position !== "absolute" && position !== "fixed";
      });
      const gap = /flex|grid/.test(style.display) ? (parseFloat(style.rowGap) || 0) * Math.max(0, children.length - 1) : 0;
      return (
        children.reduce((sum, child) => sum + child.getBoundingClientRect().height, 0) +
        gap +
        (parseFloat(style.paddingTop) || 0) +
        (parseFloat(style.paddingBottom) || 0)
      );
    };

    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const room = scroller.clientHeight - contentHeight();
        const next = Math.max(0, Math.floor(el.getBoundingClientRect().height + room));
        const now = parseFloat(el.style.minHeight) || 0;
        if (Math.abs(next - now) >= 1) el.style.minHeight = `${next}px`;
      });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(scroller);
    for (const child of Array.from(scroller.children)) observer.observe(child);
    fit();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.style.minHeight = "";
    };
  }, [enabled]);
  return ref;
}

/**
 * The search matched nothing, or a filter left nothing (SPEC § 12, the designers' D10 and T15).
 *
 * **Offers no create action**, which is the entire reason it is a separate component: the records exist, the
 * query missed them, and inviting somebody to create a duplicate is the wrong answer to "I cannot find the
 * thing I know is there".
 */
export const NoResults: React.FC<{
  /** The second line; "Try a different word." unless given, an empty string leaves it out. */
  hint?: string;
  /** "No results" unless given; a list's search says "Nothing called “…”" ({@link ListEmptyState}). */
  title?: string;
  /** A way out — "Clear all". */
  action?: React.ReactNode;
  /** `no-results-s` for a search that missed; `no-match-s`, the funnel, for a filter that left nothing. */
  scene?: Extract<Scene, "no-results-s" | "no-match-s">;
  /** See {@link EmptyState}'s `fill`. */
  fill?: boolean;
  /**
   * `page`, the default — the block of a page or a list, centred in the free area like {@link EmptyState}, its
   * title 18/26 600 (the designers' ES1, ES2). `panel` — the small block inside a dropdown, a dialog or a tool
   * window, where the page's title would outweigh what is around it.
   */
  variant?: "panel" | "page";
  className?: string;
}> = ({ hint, title, action, scene = "no-results-s", fill, variant = "page", className }) => {
  const t = useTranslations("common");
  const page = variant === "page";
  const ref = useFreeArea<HTMLDivElement>(page);
  // No "Clear search" here (C10, 2026-11-23): the search field's own × empties it.
  const control = action;
  const line = hint ?? t("emptyState.noResultsHint");
  return (
    <div
      ref={ref}
      data-free-area={page ? "" : undefined}
      className={cn("flex w-full flex-col items-center justify-center px-6 text-center", page ? "py-12" : "py-8", fill && "h-full", className)}
    >
      <Illustration scene={scene} size="s" />
      <div className={cn("flex flex-col gap-1.5", page ? "mt-3.5" : "mt-3")}>
        <p className={page ? "text-section-title text-primary" : "text-body font-medium text-primary"}>
          {title ?? t("states.noResults")}
        </p>
        {line ? <p className="mx-auto max-w-md text-body text-secondary">{line}</p> : null}
      </div>
      {control ? <div className={page ? "mt-5" : "mt-4"}>{control}</div> : null}
    </div>
  );
};
