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
   * Fills the height its parent gives it instead of sizing to its own content — for a **page** whose whole
   * body is the empty state (Tasks, Processes, the Inbox). The parent has to have a height.
   */
  fill?: boolean;
  /**
   * The small block, for a list that is one section of a page — "To write" on My reviews, the reviewers of a
   * cycle — where the full-size block would outweigh the sections around it. Same parts, the S illustration.
   */
  compact?: boolean;
  className?: string;
}> = ({ scene, title, description, onCreate, createLabel, action, fill, compact, className }) => (
  <div
    data-slot="empty-state"
    className={cn(
      "flex w-full flex-col items-center justify-center px-6 text-center",
      compact ? "gap-3 py-6" : "gap-4 py-12",
      fill && "h-full",
      className,
    )}
  >
    <Illustration scene={scene} size={compact ? "s" : "m"} />
    <div className="flex flex-col gap-1">
      <p className={compact ? "text-body font-medium text-primary" : "text-section-title text-primary"}>{title}</p>
      <p className="mx-auto max-w-sm text-body whitespace-pre-line text-tertiary">{description}</p>
    </div>
    {action ??
      (onCreate && createLabel ? (
        <Button type="button" size={compact ? "sm" : "md"} onClick={onCreate}>
          <Icon icon={Add01Icon} size="sm" />
          {createLabel}
        </Button>
      ) : null)}
  </div>
);

/**
 * The search matched nothing (SPEC § 13.5: "No one matches these filters", the S illustration).
 *
 * **Offers no create action**, which is the entire reason it is a separate component: the records exist, the
 * query missed them, and inviting somebody to create a duplicate is the wrong answer to "I cannot find the
 * thing I know is there".
 */
export const NoResults: React.FC<{
  /** What was being looked for, for the second line: "Try a different name or email." */
  hint?: string;
  title?: string;
  /** A way out — "Clear filters". */
  action?: React.ReactNode;
  /** See {@link EmptyState}'s `fill`. */
  fill?: boolean;
  className?: string;
}> = ({ hint, title, action, fill, className }) => {
  const t = useTranslations("common");
  return (
  <div className={cn("flex w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center", fill && "h-full", className)}>
    <Illustration scene="no-results-s" size="s" />
    <div className="flex flex-col gap-1">
      <p className="text-body font-medium text-primary">{title ?? t("states.noResults")}</p>
      <p className="mx-auto max-w-sm text-body text-tertiary">{hint ?? t("emptyState.noResultsHint")}</p>
    </div>
    {action}
  </div>
  );
};
