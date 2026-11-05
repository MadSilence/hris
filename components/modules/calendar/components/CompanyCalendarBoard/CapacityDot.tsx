"use client";

import { FC } from "react";
import { useTranslations } from "next-intl";
import type { CompanyCalendarCapacity } from "@/models/calendar";
import type { CalendarTranslator } from "@/components/modules/calendar/lib/i18n";

/** Whose requests the mark speaks about: the whole company on a flat board, a group on a grouped one. */
export type CapacityScope = "company" | "team" | "department";

/**
 * What the dot means, in words — the tooltip is the explanation; the board has no legend. The request
 * form stays the authority: the mark counts per group, the engine per requester's union of teams.
 */
export const capacityTitle = (t: CalendarTranslator, mark: CompanyCalendarCapacity, who: CapacityScope): string => {
  const parts = [t("capacity.atLimit", { who, behavior: mark.behavior === "BLOCK" ? "block" : "warn" })];
  if (mark.away !== undefined && mark.cap !== undefined) {
    parts.push(t("capacity.awayOfCap", { away: mark.away, cap: mark.cap }));
  }
  parts.push(t("capacity.formDecides"));
  return parts.join(" · ");
};

/** The capacity mark: a small dot, red where the next request is refused, amber where it is warned. */
export const CapacityDot: FC<{ mark: CompanyCalendarCapacity; who: CapacityScope }> = ({ mark, who }) => {
  const t = useTranslations("calendar");
  const title = capacityTitle(t, mark, who);
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      data-behavior={mark.behavior}
      className={[
        "inline-block h-2 w-2 rounded-pill",
        mark.behavior === "BLOCK" ? "bg-status-declined-fill" : "bg-status-pending-fill",
      ].join(" ")}
    />
  );
};
