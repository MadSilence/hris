"use client";

import * as React from "react";
import { UserRoundPen } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";

/**
 * Switches the people directory between the employees and the people nobody has started yet.
 *
 * <p>The twin of `ArchivedToggle`, and deliberately the same shape: a view, not a filter. A draft is
 * not an employee with a flag on — it has no account, no employment and no unit — so it belongs in
 * its own segment rather than mixed into the list and its total.
 *
 * <p><b>Nothing is rendered when the count is zero</b>, and the view falls back when the last draft
 * is invited away while it is open. Same rule, same reason as the archived one: a control that can
 * only show an empty list is absent, not dead.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
 */
export const DraftsToggle: React.FC<{
  /** How many drafts exist. Zero renders nothing at all. */
  count: number;
  showingDrafts: boolean;
  onChange: (showDrafts: boolean) => void;
}> = ({ count, showingDrafts, onChange }) => {
  React.useEffect(() => {
    if (count === 0 && showingDrafts) onChange(false);
  }, [count, showingDrafts, onChange]);

  if (count === 0) return null;

  return (
    <Button
      type="button"
      variant={showingDrafts ? "default" : "outline"}
      size="sm"
      className="gap-1.5"
      aria-pressed={showingDrafts}
      onClick={() => onChange(!showingDrafts)}
    >
      <UserRoundPen className="h-4 w-4" />
      Drafts ({count})
    </Button>
  );
};
