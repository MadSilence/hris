"use client";

import * as React from "react";
import { SearchBox } from "@/components/ui/SearchBox";
import { ArchivedToggle } from "@/components/ui/ArchivedToggle";

/**
 * The bar above every list, in one order.
 *
 * ```
 * [ Search ] [ Filter ]                    [ Archived (n) ] [ secondary ] [ + Add Thing ]
 * └──── left group ────┘                   └───────────── right group ─────────────┘
 * ```
 *
 * Every list page built its own toolbar row, so the order, the widths and the button variants drifted
 * per module — `Create legal entity` next to `Add Office` on two tabs of one page, the archived
 * toggle drawn three ways, Export as an icon-only button here and a modal there.
 *
 * Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 4.
 */
export const ListToolbar: React.FC<{
  search: { value: string; onChange: (value: string) => void };
  /** The filter control, if this list has one. Only the People table does. */
  filter?: React.ReactNode;
  /** Omit entirely for a list whose records cannot be archived. */
  archived?: { count: number; showing: boolean; onChange: (showArchived: boolean) => void };
  /** Export, column pickers, anything that is not the primary action. */
  secondary?: React.ReactNode;
  /** The `+ Add Thing` button. Always last. */
  primary?: React.ReactNode;
  className?: string;
}> = ({ search, filter, archived, secondary, primary, className }) => (
  <div className={`flex items-center justify-between gap-4 ${className ?? ""}`}>
    <div className="flex items-center gap-3">
      <SearchBox value={search.value} onChange={search.onChange} />
      {filter}
    </div>

    <div className="flex items-center gap-3">
      {archived && (
        <ArchivedToggle
          count={archived.count}
          showingArchived={archived.showing}
          onChange={archived.onChange}
        />
      )}
      {secondary}
      {primary}
    </div>
  </div>
);
