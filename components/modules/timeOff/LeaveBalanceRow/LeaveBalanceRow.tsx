import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * The balance row of the request window and of a request opened in full (profile-time-off Q13–Q17, Q30; `.fin-bal`):
 * a Mist box, radius 12, padding 12 16, at least 68 high. Left what the request takes ("−3 working days"), right the
 * number in 24/28 with its unit under it ("15 / days left after"). **Short** turns it red — the declined tint, the
 * number and unit in the declined text — and the request still sends (Q14). With no limit the right side is the words
 * alone (Q16).
 */
export const LeaveBalanceRow: React.FC<{
  /** "−3 working days", or "Pick the days on the calendar" before anything is picked. */
  change: React.ReactNode;
  /** A quiet line under it. */
  note?: React.ReactNode;
  /** The figure; absent with `noLimit`. */
  value?: string;
  /** Under the figure: "days left after", "day". */
  unit?: string;
  /** "No limit" in place of the figure. */
  noLimit?: string;
  short?: boolean;
  className?: string;
}> = ({ change, note, value, unit, noLimit, short = false, className }) => (
  <div
    data-short={short || undefined}
    className={cn(
      "flex min-h-17 items-center gap-3 rounded-tint px-4 py-3",
      short ? "bg-status-declined-bg" : "bg-subtle",
      className,
    )}
  >
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-body font-medium text-primary">{change}</span>
      {note ? <span className="text-hint text-tertiary">{note}</span> : null}
    </span>
    {noLimit ? (
      <span className="font-heading text-leave-balance text-primary">{noLimit}</span>
    ) : value !== undefined ? (
      <span className={cn("flex flex-col items-end", short ? "text-status-declined-text" : "text-primary")}>
        <span className="font-heading text-leave-balance tabular-nums">{value}</span>
        {unit ? <span className={cn("text-hint", short ? "" : "text-tertiary")}>{unit}</span> : null}
      </span>
    ) : null}
  </div>
);
