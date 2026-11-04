"use client";

import * as React from "react";
import { Archive02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";
import { FilterChip } from "@/components/ui/FilterChip";

/**
 * Switches the list between two views: **only archived**, or **everything else**.
 *
 * <p>Not an "also include archived" — that is what it used to be, drawn three different ways, with
 * the label flipping to "Hide archived" on two screens and simply absent on four others where
 * archived rows were always shown.
 *
 * <p><b>It renders nothing when the archived count is zero.</b> A toggle that switches to an empty
 * list is a control that cannot work, and the second rule of `technical_documentation/ui/README.md`
 * is that those are absent rather than dead. This is why the prop is a **count** and not a boolean:
 * a caller that only knows "there are some" cannot obey the rule, and asking for the number is what
 * forces the list endpoint to be able to answer it.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 5.
 */
export const ArchivedToggle: React.FC<{
  /** How many archived records exist. Zero renders nothing at all. */
  count: number;
  showingArchived: boolean;
  onChange: (showArchived: boolean) => void;
}> = ({ count, showingArchived, onChange }) => {
  // Unarchiving the last archived record while the archived view is on would leave the list empty
  // with the only way back gone (seen live on holiday calendars: "No public holiday calendars yet"
  // while three existed). The view falls back to everything else when there is nothing left to show.
  React.useEffect(() => {
    if (count === 0 && showingArchived) onChange(false);
  }, [count, showingArchived, onChange]);

  if (count === 0) return null;

  return (
    <FilterChip selected={showingArchived} onClick={() => onChange(!showingArchived)}>
      {!showingArchived && <Icon icon={Archive02Icon} size="sm" />}
      Archived ({count})
    </FilterChip>
  );
};
