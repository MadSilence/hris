"use client";

import * as React from "react";
import { SearchX } from "lucide-react";

/**
 * Nothing exists yet — and the whole block invites you to make the first one.
 *
 * **This is the most valuable place in the product to put the primary action.** It is the screen
 * somebody sees on their first day, and it is the only screen where the create action is the only
 * sensible thing to do. The product had six empty-state treatments plus, in several lists, a bare
 * line of grey text.
 *
 * **It is deliberately not the same component as {@link NoResults}.** They say different things:
 * "there is nothing here yet" invites creation, "your search matched nothing" must not, because the
 * records exist and the query missed. Merging them produces a screen that offers to create a second
 * copy of something the reader already has.
 *
 * Rule: `technical_documentation/ui/TABLES_AND_LISTS.md` § 3.
 */
export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Makes the whole block the create affordance. Omit where nobody may create. */
  onCreate?: () => void;
  createLabel?: string;
  /**
   * A rendered control instead of the clickable block, for the list whose create is a **choice**
   * rather than a single act — public holiday calendars are made from a template or by hand, and a
   * block that is one button cannot ask which. Bring your own gate: unlike `onCreate`, this node is
   * rendered as given.
   */
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, onCreate, createLabel, action, className }) => {
  const create = onCreate;

  const body = (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {create && createLabel && (
        <span className="text-sm font-medium text-brown-700">{createLabel}</span>
      )}
      {action}
    </>
  );

  const shell = `flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-brown-300 px-6 py-12 text-center ${className ?? ""}`;

  // A button, not a div with a click handler: it has to be reachable by keyboard and announced as
  // the action it is.
  if (create && !action) {
    return (
      <button type="button" onClick={create} className={`${shell} transition-colors hover:border-brown-400 hover:bg-brown-50`}>
        {body}
      </button>
    );
  }

  return <div className={shell}>{body}</div>;
};

/**
 * The search matched nothing.
 *
 * **Offers no create action**, which is the entire reason it is a separate component: the records
 * exist, the query missed them, and inviting somebody to create a duplicate is the wrong answer to
 * "I cannot find the thing I know is there".
 */
export const NoResults: React.FC<{
  /** What was being looked for, for the second line: "Try a different name or email." */
  hint?: string;
  className?: string;
}> = ({ hint = "Try a different search.", className }) => (
  <div
    className={`flex w-full flex-col items-center justify-center gap-4 px-6 py-12 text-center ${className ?? ""}`}
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brown-50 text-brown-500">
      <SearchX className="h-7 w-7" />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">No results</p>
      <p className="mx-auto max-w-sm text-sm text-muted-foreground">{hint}</p>
    </div>
  </div>
);
