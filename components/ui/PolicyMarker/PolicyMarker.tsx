import * as React from "react";
import { cn } from "@/lib/cn";
import { toTagColor } from "@/lib/theme/tags";
import { LEAVE_CLASSES } from "@/lib/theme/leave";

/**
 * A time off policy's colour beside its name — **a dot on a tint** (K01, the leave palette, 2026-11-19): a 16 px
 * circle of the colour's fill with an 8 px dot of its edge in the middle, no outline, 8 px before the name (the
 * caller's `gap-2`). It replaced the 16 × 6 pill. One pattern wherever a policy is named: the policy select, a balance
 * row, an Upcoming row, the request dialog's card, the profile header, the filter's values. On a calendar the colour is
 * a pill (`lib/theme/leave.ts`). With no colour — leave whose policy the reader may not see — it is gray, "Away".
 *
 * `size="sm"` is the 14 px cut inside a 28-high select (the filter's value, the dot 7); `pending` is the legend's
 * dashed ring for "Waiting for approval".
 */
export const PolicyMarker: React.FC<{
  color: string | null | undefined;
  size?: "md" | "sm";
  pending?: boolean;
  className?: string;
}> = ({ color, size = "md", pending = false, className }) => {
  const name = toTagColor(color);
  const leave = LEAVE_CLASSES[name];
  const box = size === "sm" ? "size-3.5" : "size-4";
  if (pending) {
    return (
      <span aria-hidden data-policy-color={name}
            className={cn("inline-block shrink-0 rounded-pill border-[1.5px] border-dashed", box, leave.border, className)} />
    );
  }
  return (
    <span aria-hidden data-policy-color={name}
          className={cn("inline-grid shrink-0 place-items-center rounded-pill", box, leave.fill, className)}>
      <span className={cn("rounded-pill", size === "sm" ? "size-[7px]" : "size-2", leave.edge)} />
    </span>
  );
};
