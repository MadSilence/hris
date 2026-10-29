"use client";

import { FC } from "react";
import type { CompanyCalendarCapacity } from "@/models/calendar";

/**
 * What the dot means, in words — the tooltip is the explanation; the board has no legend. The request
 * form stays the authority: the mark counts per group, the engine per requester's union of teams.
 */
export const capacityTitle = (mark: CompanyCalendarCapacity, who: string): string => {
  const parts = [
    `At its limit — new requests from ${who} will be ${mark.behavior === "BLOCK" ? "refused" : "warned"}`,
  ];
  if (mark.away !== undefined && mark.cap !== undefined) parts.push(`${mark.away} of ${mark.cap} away`);
  parts.push("The request form decides for each person");
  return parts.join(" · ");
};

/** The capacity mark: a small dot, red where the next request is refused, amber where it is warned. */
export const CapacityDot: FC<{ mark: CompanyCalendarCapacity; who: string }> = ({ mark, who }) => {
  const title = capacityTitle(mark, who);
  return (
    <span
      role="img"
      aria-label={title}
      title={title}
      data-behavior={mark.behavior}
      className={[
        "inline-block h-2 w-2 rounded-full",
        mark.behavior === "BLOCK" ? "bg-danger-500" : "bg-warning-500",
      ].join(" ")}
    />
  );
};
