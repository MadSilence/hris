"use client";

import * as React from "react";
import { UserEdit01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import { FilterChip } from "@/components/ui/FilterChip";

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
  const t = useTranslations("common");
  React.useEffect(() => {
    if (count === 0 && showingDrafts) onChange(false);
  }, [count, showingDrafts, onChange]);

  if (count === 0) return null;

  return (
    <FilterChip selected={showingDrafts} onClick={() => onChange(!showingDrafts)}>
      {!showingDrafts && <Icon icon={UserEdit01Icon} size="sm" />}
      {t("toggles.drafts", { count })}
    </FilterChip>
  );
};
