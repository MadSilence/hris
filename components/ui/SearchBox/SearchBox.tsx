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
 * **Two sizes** (the designers' Automations fixes, A5 and E4, 2026-11-18): `sm`, the toolbar's — 240 × 32, the icon
 * 10 in, 13/20 text — is every list's; `md` — 36 high, 14/20 — is the search at the top of a picker window
 * (Add a step).
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
  size?: "sm" | "md";
}> = ({ value, onChange, className, fullWidth = false, "aria-label": ariaLabel, size = "sm" }) => {
  const t = useTranslations("common");
  return (
  <div className={cn("relative", fullWidth ? "w-full" : "w-60", className)}>
    <Icon
      icon={Search01Icon}
      size="sm"
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 text-tertiary",
        size === "sm" ? "left-2.5" : "left-3",
      )}
    />
    <Input
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && value.length > 0) {
          e.preventDefault();
          onChange("");
        }
      }}
      className={cn(
        size === "sm" ? "h-8 pr-2.5 pl-8.5 text-label font-normal leading-5" : "h-9 pr-3 pl-9",
        fullWidth ? "w-full" : "w-60",
      )}
      placeholder={t("actions.search")}
      aria-label={ariaLabel ?? t("actions.search")}
      inputMode="search"
    />
  </div>
  );
};
