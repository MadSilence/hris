"use client";

import * as React from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/desact/icon";
import { Input } from "@/components/desact/input";
import { cn } from "@/lib/cn";

/**
 * The search box that sits at the left of a list toolbar.
 *
 * **The placeholder is the word `Search`, and it is not configurable.** The product had
 * `Search calendars`, `Search people…`, `Search members…`, `Search templates...` and a dozen more —
 * differing in the noun and in whether the ellipsis was a character or three dots. The field sits
 * inside a screen that already says what it lists, so repeating the noun buys nothing and guarantees
 * drift. Rule: `technical_documentation/ui/ACTIONS_AND_MENUS.md` § 4.
 *
 * **Escape clears.** Twenty-five hand-rolled copies existed and not one of them did.
 *
 * Not to be confused with {@link SearchField}, which is the canvas search — it carries a mode switch,
 * a match counter and prev/next arrows, and is a genuinely different control.
 */
export const SearchBox: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Only for a box that is not in a toolbar and has to fit its container. */
  fullWidth?: boolean;
  "aria-label"?: string;
}> = ({ value, onChange, className, fullWidth = false, "aria-label": ariaLabel }) => {
  const t = useTranslations("common");
  return (
  <div className={cn("relative", fullWidth ? "w-full" : "w-[260px]", className)}>
    <Icon icon={Search01Icon} size="sm" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
    <Input
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && value.length > 0) {
          e.preventDefault();
          onChange("");
        }
      }}
      className={cn("h-9 pl-10", fullWidth ? "w-full" : "w-[260px]")}
      placeholder={t("actions.search")}
      aria-label={ariaLabel ?? t("actions.search")}
      inputMode="search"
    />
  </div>
  );
};
