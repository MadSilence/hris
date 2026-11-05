import * as React from "react";
import { cn } from "@/lib/cn";
import { TAG_CLASSES, toTagColor } from "@/lib/theme/tags";

/**
 * A time off policy's colour beside its name — **not a dot and not a chip**: a 16 × 6 pill in the colour's bar tone,
 * centred on the line, 8 px before the name (the caller's `gap-2`), the name in the primary text (the designers'
 * answer 2.3, `DESIGN_SYSTEM.md` § 7). One pattern wherever a policy is named: the policy select, a balance row, an
 * Upcoming row, the request dialog's card, Who's out. On a calendar the colour stays a bar. Never beside a Scheduled
 * status pill — leave has no Scheduled status. With no colour — leave whose policy the reader may not see — it is gray,
 * which is what "Away" looks like everywhere.
 */
export const PolicyMarker: React.FC<{ color: string | null | undefined; className?: string }> = ({ color, className }) => (
  <span aria-hidden data-policy-color={toTagColor(color)}
        className={cn("inline-block h-1.5 w-4 shrink-0 rounded-pill", TAG_CLASSES[toTagColor(color)].bar, className)} />
);
